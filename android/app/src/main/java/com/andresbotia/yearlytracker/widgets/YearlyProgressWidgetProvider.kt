package com.andresbotia.yearlytracker.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.andresbotia.yearlytracker.R

class YearlyProgressWidgetProvider : AppWidgetProvider() {

  companion object {
    const val ACTION_REFRESH_ALL = "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH_ALL"

    fun requestUpdateAll(context: Context) {
      context.sendBroadcast(Intent(ACTION_REFRESH_ALL))
    }

    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, YearlyProgressWidgetProvider::class.java))
      onUpdateStatic(context, mgr, ids)
    }

    private fun onUpdateStatic(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      val payloadObj = SharedWidgetStore.parsePayload(SharedWidgetStore.loadPayloadJson(context))
      val theme = payloadObj?.optString("theme", null)
      val pct = SharedWidgetStore.pctInt01(payloadObj?.optDouble("yearlyProgress", 0.0) ?: 0.0)

      for (id in ids) {
        val views = RemoteViews(context.packageName, R.layout.widget_yearly_progress)

        views.setInt(R.id.root, "setBackgroundColor", SharedWidgetStore.themeBgColor(theme))
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
    onUpdateStatic(context, appWidgetManager, appWidgetIds)
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)
    if (intent.action == ACTION_REFRESH_ALL) {
      updateAll(context)
    }
  }
}
