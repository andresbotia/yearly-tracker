// android/app/src/main/java/com/andresbotia/yearlytracker/widgets/GoalsListWidgetProvider.kt
package com.andresbotia.yearlytracker.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import com.andresbotia.yearlytracker.R
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.roundToInt

class GoalsListWidgetProvider : AppWidgetProvider() {

  companion object {
    private const val TAG = "GoalsListWidget"

    private const val MAX_LINES = 6
    private const val SMALL_VISIBLE_LINES = 4
    private const val LARGE_VISIBLE_LINES = 6

    const val ACTION_REFRESH_ALL =
      "com.andresbotia.yearlytracker.widgets.GOALS_LIST_REFRESH_ALL"
    const val ACTION_REFRESH =
      "com.andresbotia.yearlytracker.widgets.GOALS_LIST_REFRESH"

    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(
        ComponentName(context, GoalsListWidgetProvider::class.java)
      )
      Log.d(TAG, "updateAll ids=${ids.contentToString()}")
      onUpdateStatic(context, mgr, ids)
    }

    private fun onUpdateStatic(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      val payloadJson =
        SharedWidgetStore.loadPayloadJson(context, SharedWidgetStore.KEY_GOALS_LIST)

      if (payloadJson.isBlank()) {
        Log.w(TAG, "No payload JSON found for goals list.")
      } else {
        Log.d(TAG, "Loaded payload JSON length=${payloadJson.length}")
      }

      val payloadObj = SharedWidgetStore.parsePayload(payloadJson)
      val theme = payloadObj?.optString("theme", null)

      val goals: JSONArray = payloadObj?.optJSONArray("goals") ?: JSONArray()

      for (id in ids) {
        val options = mgr.getAppWidgetOptions(id)
        val layoutId = WidgetUi.chooseLayout(
          options,
          R.layout.widget_goals_list_small,
          R.layout.widget_goals_list_large
        )

        val views = RemoteViews(context.packageName, layoutId)

        // Background
        views.safeSetInt(
          R.id.root,
          "setBackgroundColor",
          SharedWidgetStore.themeBgColor(theme, payloadObj)
        )

        // Title: always default (do NOT override with debug text)
        views.safeSetText(R.id.title, "Goals")

        val visibleLines =
          if (layoutId == R.layout.widget_goals_list_large) LARGE_VISIBLE_LINES else SMALL_VISIBLE_LINES

        renderGoalsIntoViews(
          views = views,
          goals = goals,
          visibleLines = visibleLines
        )

        // Click -> open app
        views.safeSetOnClick(
          R.id.root,
          WidgetUi.launchAppPendingIntent(context, 3001 + id)
        )

        mgr.updateAppWidget(id, views)
      }
    }

    private fun renderGoalsIntoViews(
      views: RemoteViews,
      goals: JSONArray,
      visibleLines: Int
    ) {
      val count = goals.length()

      // If empty: show a single placeholder line, hide the rest.
      if (count <= 0) {
        // line1 placeholder
        views.safeSetText(R.id.line1, "—")
        views.safeSetVisibility(R.id.line1, View.VISIBLE)

        // hide line2..line6
        for (i in 2..MAX_LINES) {
          val lineId = lineIdByIndex(i)
          views.safeSetVisibility(lineId, View.GONE)
        }

        // hide moreLine
        views.safeSetVisibility(R.id.moreLine, View.GONE)
        return
      }

      // Show up to visibleLines, capped by MAX_LINES.
      val showLines = minOf(visibleLines, MAX_LINES)

      for (i in 1..MAX_LINES) {
        val lineId = lineIdByIndex(i)
        val shouldShow = i <= showLines && (i - 1) < count
        if (shouldShow) {
          val g = goals.optJSONObject(i - 1)
          views.safeSetText(lineId, formatGoalLine(g))
          views.safeSetVisibility(lineId, View.VISIBLE)
        } else {
          views.safeSetVisibility(lineId, View.GONE)
        }
      }

      // Overflow line
      val overflow = count - showLines
      if (overflow > 0) {
        views.safeSetText(R.id.moreLine, "… +$overflow more")
        views.safeSetVisibility(R.id.moreLine, View.VISIBLE)
      } else {
        views.safeSetVisibility(R.id.moreLine, View.GONE)
      }
    }

    private fun lineIdByIndex(i: Int): Int {
      return when (i) {
        1 -> R.id.line1
        2 -> R.id.line2
        3 -> R.id.line3
        4 -> R.id.line4
        5 -> R.id.line5
        6 -> R.id.line6
        else -> R.id.line1
      }
    }

    private fun formatGoalLine(g: JSONObject?): String {
      if (g == null) return "—"
      val title = g.optString("title", "").ifBlank { "—" }
      val pct01 = g.optDouble("percent", 0.0)
      val pct = (SharedWidgetStore.clamp01(pct01) * 100.0).roundToInt()
      return "$title • $pct%"
    }

    // ---- RemoteViews safe helpers (prevents crash if an ID is missing in some layout) ----

    private fun RemoteViews.safeSetText(viewId: Int, text: String) {
      try {
        setTextViewText(viewId, text)
      } catch (_: Throwable) {
      }
    }

    private fun RemoteViews.safeSetVisibility(viewId: Int, visibility: Int) {
      try {
        setViewVisibility(viewId, visibility)
      } catch (_: Throwable) {
      }
    }

    private fun RemoteViews.safeSetOnClick(viewId: Int, pi: android.app.PendingIntent) {
      try {
        setOnClickPendingIntent(viewId, pi)
      } catch (_: Throwable) {
      }
    }

    private fun RemoteViews.safeSetInt(viewId: Int, methodName: String, value: Int) {
      try {
        setInt(viewId, methodName, value)
      } catch (_: Throwable) {
      }
    }
  }

  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray
  ) {
    Log.d(TAG, "onUpdate ids=${appWidgetIds.contentToString()}")
    onUpdateStatic(context, appWidgetManager, appWidgetIds)
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)
    Log.d(TAG, "onReceive action=${intent.action}")
    when (intent.action) {
      ACTION_REFRESH_ALL, ACTION_REFRESH -> updateAll(context)
    }
  }

  override fun onAppWidgetOptionsChanged(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int,
    newOptions: android.os.Bundle
  ) {
    super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions)
    Log.d(TAG, "onAppWidgetOptionsChanged id=$appWidgetId options=$newOptions")
    onUpdateStatic(context, appWidgetManager, intArrayOf(appWidgetId))
  }
}
