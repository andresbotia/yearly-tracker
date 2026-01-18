package com.andresbotia.yearlytracker.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import com.andresbotia.yearlytracker.R

class YearlyProgressWidgetProvider : AppWidgetProvider() {

  companion object {
    private const val TAG = "YearlyProgressWidget"
    const val ACTION_REFRESH_ALL = "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH_ALL"

    fun requestUpdateAll(context: Context) {
      Log.d(TAG, "requestUpdateAll broadcast")
      context.sendBroadcast(Intent(ACTION_REFRESH_ALL))
    }

    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, YearlyProgressWidgetProvider::class.java))
      Log.d(TAG, "updateAll ids=${ids.contentToString()}")
      onUpdateStatic(context, mgr, ids)
    }

    private fun onUpdateStatic(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      Log.d(TAG, "onUpdateStatic ids=${ids.contentToString()}")
      val payloadJson = SharedWidgetStore.loadPayloadJson(context, SharedWidgetStore.KEY_YEARLY_PROGRESS)
      if (payloadJson.isBlank()) {
        Log.w(TAG, "No payload JSON found for yearly progress.")
      } else {
        Log.d(TAG, "Loaded payload JSON length=${payloadJson.length}")
      }
      val payloadObj = SharedWidgetStore.parsePayload(payloadJson)
      val theme = payloadObj?.optString("theme", null)
      val pct = SharedWidgetStore.pctInt01(payloadObj?.optDouble("yearlyProgress", 0.0) ?: 0.0)
      val debugText = SharedWidgetStore.loadDebugText(context)

      for (id in ids) {
        val views = RemoteViews(context.packageName, R.layout.widget_yearly_progress)

        views.setInt(R.id.root, "setBackgroundColor", SharedWidgetStore.themeBgColor(theme))
        if (!debugText.isNullOrBlank()) {
          views.setTextViewText(R.id.title, debugText)
        }
        views.setTextViewText(R.id.pct, "${pct}%")
        views.setProgressBar(R.id.progress, 100, pct, false)

        views.setOnClickPendingIntent(
          R.id.root,
          WidgetUi.deepLinkPendingIntent(context, "exp+yearly-tracker://progress", 1001)
        )

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
    if (intent.action == ACTION_REFRESH_ALL) {
      updateAll(context)
    }
  }
}
