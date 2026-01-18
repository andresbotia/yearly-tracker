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

class GoalsListWidgetProvider : AppWidgetProvider() {

  companion object {
    private const val TAG = "GoalsListWidget"

    const val ACTION_REFRESH_ALL = "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH_ALL"
    const val ACTION_REFRESH = "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH_GOALS_LIST"

    fun requestUpdateAll(context: Context) {
      Log.d(TAG, "requestUpdateAll explicit broadcast")
      val intent = Intent(context, GoalsListWidgetProvider::class.java).apply {
        action = ACTION_REFRESH_ALL
      }
      context.sendBroadcast(intent)
    }

    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, GoalsListWidgetProvider::class.java))
      Log.d(TAG, "updateAll ids=${ids.contentToString()}")
      onUpdateStatic(context, mgr, ids)
    }

    private fun onUpdateStatic(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      Log.d(TAG, "onUpdateStatic ids=${ids.contentToString()}")

      val payloadJson = SharedWidgetStore.loadPayloadJson(context, SharedWidgetStore.KEY_GOALS_LIST)
      if (payloadJson.isBlank()) {
        Log.w(TAG, "No payload JSON found for goals list.")
      } else {
        Log.d(TAG, "Loaded payload JSON length=${payloadJson.length}")
      }

      val payloadObj = SharedWidgetStore.parsePayload(payloadJson)
      val theme = payloadObj?.optString("theme", null)
      val goals = payloadObj?.optJSONArray("goals")

      for (id in ids) {
        val options = mgr.getAppWidgetOptions(id)
        val large = WidgetUi.isLarge(options)
        val limit = if (large) 6 else 4

        val views = RemoteViews(context.packageName, R.layout.widget_goals_list)
        views.setInt(R.id.root, "setBackgroundColor", SharedWidgetStore.themeBgColor(theme))

        for (i in 0 until 6) {
          val rowId = context.resources.getIdentifier("row$i", "id", context.packageName)
          val textId = context.resources.getIdentifier("text$i", "id", context.packageName)
          val pctId = context.resources.getIdentifier("pct$i", "id", context.packageName)
          val progId = context.resources.getIdentifier("prog$i", "id", context.packageName)

          if (i >= limit || goals == null || i >= goals.length()) {
            views.setViewVisibility(rowId, android.view.View.GONE)
            continue
          }

          val g = goals.optJSONObject(i) ?: JSONObject()
          val title = g.optString("title", "")
          val pct = SharedWidgetStore.pctInt01(g.optDouble("percent", 0.0))

          views.setViewVisibility(rowId, android.view.View.VISIBLE)
          views.setTextViewText(textId, title)
          views.setTextViewText(pctId, "${pct}%")
          views.setProgressBar(progId, 100, pct, false)
        }

        val refreshIntent = Intent(context, GoalsListWidgetProvider::class.java).apply {
          action = ACTION_REFRESH
        }
        val refreshPi = PendingIntent.getBroadcast(
          context,
          2001,
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
