// android/app/src/main/java/com/andresbotia/yearlytracker/widgets/HabitsWidgetProvider.kt
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

class HabitsWidgetProvider : AppWidgetProvider() {

  companion object {
    private const val TAG = "HabitsWidget"

    private const val MAX_LINES = 8
    private const val SMALL_VISIBLE_LINES = 5
    private const val LARGE_VISIBLE_LINES = 8

    const val ACTION_REFRESH_ALL =
      "com.andresbotia.yearlytracker.widgets.HABITS_REFRESH_ALL"
    const val ACTION_REFRESH =
      "com.andresbotia.yearlytracker.widgets.HABITS_REFRESH"

    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, HabitsWidgetProvider::class.java))
      Log.d(TAG, "updateAll ids=${ids.contentToString()}")
      onUpdateStatic(context, mgr, ids)
    }

    private fun onUpdateStatic(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      val payloadJson = SharedWidgetStore.loadPayloadJson(context, SharedWidgetStore.KEY_HABITS)

      if (payloadJson.isBlank()) {
        Log.w(TAG, "No payload JSON found for habits.")
      } else {
        Log.d(TAG, "Loaded payload JSON length=${payloadJson.length}")
      }

      val payloadObj = SharedWidgetStore.parsePayload(payloadJson)
      val theme = payloadObj?.optString("theme", null)

      val habits: JSONArray = payloadObj?.optJSONArray("habits") ?: JSONArray()

      for (id in ids) {
        val options = mgr.getAppWidgetOptions(id)
        val layoutId = WidgetUi.chooseLayout(
          options,
          R.layout.widget_habits_small,
          R.layout.widget_habits_large
        )

        val views = RemoteViews(context.packageName, layoutId)

        views.safeSetInt(R.id.root, "setBackgroundColor", SharedWidgetStore.themeBgColor(theme, payloadObj))

        // Title: always default (do NOT override with debug text)
        views.safeSetText(R.id.title, "Habits")

        val visibleLines =
          if (layoutId == R.layout.widget_habits_large) LARGE_VISIBLE_LINES else SMALL_VISIBLE_LINES

        renderHabitsIntoViews(
          views = views,
          habits = habits,
          visibleLines = visibleLines
        )

        views.safeSetOnClick(
          R.id.root,
          WidgetUi.launchAppPendingIntent(context, 4001 + id)
        )

        mgr.updateAppWidget(id, views)
      }
    }

    private fun renderHabitsIntoViews(
      views: RemoteViews,
      habits: JSONArray,
      visibleLines: Int
    ) {
      val count = habits.length()

      if (count <= 0) {
        views.safeSetText(R.id.line1, "—")
        views.safeSetVisibility(R.id.line1, View.VISIBLE)

        for (i in 2..MAX_LINES) {
          val lineId = lineIdByIndex(i)
          views.safeSetVisibility(lineId, View.GONE)
        }

        views.safeSetVisibility(R.id.moreLine, View.GONE)
        return
      }

      val showLines = minOf(visibleLines, MAX_LINES)

      for (i in 1..MAX_LINES) {
        val lineId = lineIdByIndex(i)
        val shouldShow = i <= showLines && (i - 1) < count
        if (shouldShow) {
          val h = habits.optJSONObject(i - 1)
          views.safeSetText(lineId, formatHabitLine(h))
          views.safeSetVisibility(lineId, View.VISIBLE)
        } else {
          views.safeSetVisibility(lineId, View.GONE)
        }
      }

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
        7 -> R.id.line7
        8 -> R.id.line8
        else -> R.id.line1
      }
    }

    private fun formatHabitLine(h: JSONObject?): String {
      if (h == null) return "—"
      val title = h.optString("title", "").ifBlank { "—" }
      val state = h.optInt("todayState", 0)
      val badge = when (state) {
        1 -> "+"
        2 -> "×"
        else -> "."
      }
      return "$badge $title"
    }

    // ---- RemoteViews safe helpers ----

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

  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
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
