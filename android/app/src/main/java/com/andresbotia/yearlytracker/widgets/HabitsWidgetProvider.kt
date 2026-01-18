package com.andresbotia.yearlytracker.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import com.andresbotia.yearlytracker.R
import org.json.JSONObject

class HabitsWidgetProvider : AppWidgetProvider() {

  companion object {
    private const val TAG = "HabitsWidget"

    const val ACTION_REFRESH_ALL = "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH_ALL"
    const val ACTION_REFRESH = "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH_HABITS"

    fun requestUpdateAll(context: Context) {
      Log.d(TAG, "requestUpdateAll explicit broadcast")
      val intent = Intent(context, HabitsWidgetProvider::class.java).apply {
        action = ACTION_REFRESH_ALL
      }
      context.sendBroadcast(intent)
    }

    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, HabitsWidgetProvider::class.java))
      Log.d(TAG, "updateAll ids=${ids.contentToString()}")
      onUpdateStatic(context, mgr, ids)
    }

    private fun dotForState(state: Int): Int {
      return when (state) {
        1 -> R.drawable.habit_dot_done
        2 -> R.drawable.habit_dot_warn
        else -> R.drawable.habit_dot_empty
      }
    }

    private fun symbolForState(state: Int): String {
      return when (state) {
        1 -> "OK"
        2 -> "!"
        else -> "x"
      }
    }

    private fun onUpdateStatic(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      Log.d(TAG, "onUpdateStatic ids=${ids.contentToString()}")

      val payloadJson = SharedWidgetStore.loadPayloadJson(context, SharedWidgetStore.KEY_HABITS)
      if (payloadJson.isBlank()) {
        Log.w(TAG, "No payload JSON found for habits.")
      } else {
        Log.d(TAG, "Loaded payload JSON length=${payloadJson.length}")
      }

      val payloadObj = SharedWidgetStore.parsePayload(payloadJson)
      val theme = payloadObj?.optString("theme", null)
      val habits = payloadObj?.optJSONArray("habits")

      for (id in ids) {
        val options = mgr.getAppWidgetOptions(id)
        val large = WidgetUi.isLarge(options)
        val limit = if (large) 10 else 6

        val views = RemoteViews(context.packageName, R.layout.widget_habits)
        views.setInt(R.id.root, "setBackgroundColor", SharedWidgetStore.themeBgColor(theme))

        for (i in 0 until 10) {
          val rowId = context.resources.getIdentifier("row$i", "id", context.packageName)
          val dotId = context.resources.getIdentifier("dot$i", "id", context.packageName)
          val textId = context.resources.getIdentifier("text$i", "id", context.packageName)
          val symId = context.resources.getIdentifier("sym$i", "id", context.packageName)

          if (i >= limit || habits == null || i >= habits.length()) {
            views.setViewVisibility(rowId, android.view.View.GONE)
            continue
          }

          val h = habits.optJSONObject(i) ?: JSONObject()
          val title = h.optString("title", "")
          val state = h.optInt("todayState", 0)

          views.setViewVisibility(rowId, android.view.View.VISIBLE)
          views.setTextViewText(textId, title)
          views.setTextViewText(symId, symbolForState(state))
          views.setImageViewResource(dotId, dotForState(state))
          views.setFloat(symId, "setAlpha", if (state == 0) 0.55f else 1.0f)
        }

        val refreshIntent = Intent(context, HabitsWidgetProvider::class.java).apply {
          action = ACTION_REFRESH
        }
        val refreshPi = PendingIntent.getBroadcast(
          context,
          3001,
          refreshIntent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.root, refreshPi)

        mgr.updateAppWidget(id, views)
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
}
