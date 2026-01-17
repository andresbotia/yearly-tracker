package com.andresbotia.yearlytracker.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.andresbotia.yearlytracker.R
import org.json.JSONArray
import org.json.JSONObject

class GoalsListWidgetProvider : AppWidgetProvider() {

  companion object {
    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, GoalsListWidgetProvider::class.java))
      onUpdateStatic(context, mgr, ids)
    }

    private fun onUpdateStatic(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      val payloadObj = SharedWidgetStore.parsePayload(SharedWidgetStore.loadPayloadJson(context))
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

        views.setOnClickPendingIntent(
          R.id.root,
          WidgetUi.deepLinkPendingIntent(context, "exp+yearly-tracker://goals", 1004)
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
    if (intent.action == YearlyProgressWidgetProvider.ACTION_REFRESH_ALL) {
      updateAll(context)
    }
  }
}
