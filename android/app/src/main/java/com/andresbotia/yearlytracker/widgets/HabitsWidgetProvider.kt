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

class HabitsWidgetProvider : AppWidgetProvider() {

  companion object {
    private const val TAG = "HabitsWidget"

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
      val debugText = SharedWidgetStore.loadDebugText(context)

      val habits: JSONArray = payloadObj?.optJSONArray("habits") ?: JSONArray()

      for (id in ids) {
        val options = mgr.getAppWidgetOptions(id)
        val layoutId = WidgetUi.chooseLayout(
  options,
  R.layout.widget_habits_small,
  R.layout.widget_habits_large
)


        val views = RemoteViews(context.packageName, layoutId)

        views.setInt(R.id.root, "setBackgroundColor", SharedWidgetStore.themeBgColor(theme))

        // Title: always set
        views.setTextViewText(R.id.title, debugText ?: "Habits")

        if (layoutId == R.layout.widget_habits_small) {
          val h1 = habits.optJSONObject(0)
          val h2 = habits.optJSONObject(1)

          views.setTextViewText(R.id.line1, formatHabitLine(h1))
          views.setTextViewText(R.id.line2, formatHabitLine(h2))
        } else {
          // Large: fill 4 lines (if your widget_habits.xml has line3/line4)
          val h1 = habits.optJSONObject(0)
          val h2 = habits.optJSONObject(1)
          val h3 = habits.optJSONObject(2)
          val h4 = habits.optJSONObject(3)

          views.setTextViewText(R.id.line1, formatHabitLine(h1))
          views.setTextViewText(R.id.line2, formatHabitLine(h2))
          views.setTextViewText(R.id.line3, formatHabitLine(h3))
          views.setTextViewText(R.id.line4, formatHabitLine(h4))
        }

        views.setOnClickPendingIntent(
          R.id.root,
          WidgetUi.launchAppPendingIntent(context, 4001 + id)
        )

        mgr.updateAppWidget(id, views)
      }
    }

    private fun formatHabitLine(h: JSONObject?): String {
      if (h == null) return "—"
      val title = h.optString("title", "").ifBlank { "—" }
      val state = h.optInt("todayState", 0)
      val badge = when (state) {
        1 -> "✅"
        2 -> "⚠️"
        else -> "⬜"
      }
      return "$badge $title"
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
