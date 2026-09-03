package com.andresbotia.yearlytracker.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.widget.RemoteViews
import com.andresbotia.yearlytracker.R

class ProgressWidgetProvider : AppWidgetProvider() {

  companion object {
    const val PREFS_NAME = "widget_prefs"
    const val KEY_JSON = "progress_widget_json"

    // Broadcast action your RN app will send to refresh widgets immediately
    const val ACTION_REFRESH = "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH"

    fun requestUpdate(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, ProgressWidgetProvider::class.java))
      val intent = Intent(context, ProgressWidgetProvider::class.java).apply {
        action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
      }
      context.sendBroadcast(intent)
    }

    private fun getJson(context: Context): String {
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      return prefs.getString(KEY_JSON, "{}") ?: "{}"
    }

    private fun parseFields(json: String): Pair<String, String> {
      // Expect: {"title":"...","subtitle":"..."}
      val title = Regex(""""title"\s*:\s*"([^"]*)"""")
        .find(json)?.groupValues?.get(1) ?: "Atelier Tracker"

      val subtitle = Regex(""""subtitle"\s*:\s*"([^"]*)"""")
        .find(json)?.groupValues?.get(1) ?: "Progress: --%"

      return Pair(title, subtitle)
    }

    fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
      val views = RemoteViews(context.packageName, R.layout.widget_progress)

      val json = getJson(context)
      val (title, subtitle) = parseFields(json)

      views.setTextViewText(R.id.widget_title, title)
      views.setTextViewText(R.id.widget_subtitle, subtitle)

      // Deep link (weâ€™ll wire up scheme in a later step)
      val deepLink = Uri.parse("exp+yearly-tracker://progress")
      val clickIntent = Intent(Intent.ACTION_VIEW, deepLink).apply {
        `package` = context.packageName
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
      }

      val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      } else {
        PendingIntent.FLAG_UPDATE_CURRENT
      }

      val pendingIntent = PendingIntent.getActivity(context, 0, clickIntent, flags)
      views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

      appWidgetManager.updateAppWidget(appWidgetId, views)
    }
  }

  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    for (id in appWidgetIds) {
      updateAppWidget(context, appWidgetManager, id)
    }
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)
    if (intent.action == ACTION_REFRESH) {
      requestUpdate(context)
    }
  }
}
