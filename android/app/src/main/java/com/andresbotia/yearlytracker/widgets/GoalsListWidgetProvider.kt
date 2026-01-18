package com.andresbotia.yearlytracker.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import com.andresbotia.yearlytracker.R
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.roundToInt

class GoalsListWidgetProvider : AppWidgetProvider() {

  companion object {
    private const val TAG = "GoalsListWidget"

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
      val debugText = SharedWidgetStore.loadDebugText(context)

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
        views.setInt(
          R.id.root,
          "setBackgroundColor",
          SharedWidgetStore.themeBgColor(theme)
        )

        // Title: always set (debug if present else label)
        views.setTextViewText(R.id.title, debugText ?: "Goals")

        if (layoutId == R.layout.widget_goals_list_small) {
          // Fill 2 lines (top goals)
          val g1 = goals.optJSONObject(0)
          val g2 = goals.optJSONObject(1)
          views.setTextViewText(R.id.line1, formatGoalLine(g1))
          views.setTextViewText(R.id.line2, formatGoalLine(g2))
        } else {
          // Large layout: Fill 4 lines (top goals)
          val g1 = goals.optJSONObject(0)
          val g2 = goals.optJSONObject(1)
          val g3 = goals.optJSONObject(2)
          val g4 = goals.optJSONObject(3)

          // These IDs must exist in widget_goals_list.xml
          views.setTextViewText(R.id.line1, formatGoalLine(g1))
          views.setTextViewText(R.id.line2, formatGoalLine(g2))
          views.setTextViewText(R.id.line3, formatGoalLine(g3))
          views.setTextViewText(R.id.line4, formatGoalLine(g4))
        }

        // Click -> open app
        views.setOnClickPendingIntent(
          R.id.root,
          WidgetUi.launchAppPendingIntent(context, 3001 + id)
        )

        mgr.updateAppWidget(id, views)
      }
    }

    private fun formatGoalLine(g: JSONObject?): String {
      if (g == null) return "—"
      val title = g.optString("title", "").ifBlank { "—" }
      val pct01 = g.optDouble("percent", 0.0)
      val pct = (SharedWidgetStore.clamp01(pct01) * 100.0).roundToInt()
      return "$title • $pct%"
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
