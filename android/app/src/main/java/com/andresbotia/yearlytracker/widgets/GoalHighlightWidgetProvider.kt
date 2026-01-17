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

class GoalHighlightWidgetProvider : AppWidgetProvider() {

  companion object {
    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, GoalHighlightWidgetProvider::class.java))
      onUpdateStatic(context, mgr, ids)
    }

    private fun pickHighlight(goals: JSONArray?): JSONObject? {
      if (goals == null || goals.length() == 0) return null

      // Prefer top in-progress (percent < 1), else top overall
      var topInProgress: JSONObject? = null
      var topOverall: JSONObject? = null

      for (i in 0 until goals.length()) {
        val g = goals.optJSONObject(i) ?: continue
        val pct = SharedWidgetStore.clamp01(g.optDouble("percent", 0.0))
        if (topOverall == null || pct > SharedWidgetStore.clamp01(topOverall!!.optDouble("percent", 0.0))) {
          topOverall = g
        }
        if (pct < 1.0) {
          if (topInProgress == null || pct > SharedWidgetStore.clamp01(topInProgress!!.optDouble("percent", 0.0))) {
            topInProgress = g
          }
        }
      }

      return topInProgress ?: topOverall
    }

    private fun onUpdateStatic(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      val payloadObj = SharedWidgetStore.parsePayload(SharedWidgetStore.loadPayloadJson(context))
      val theme = payloadObj?.optString("theme", null)
      val goals = payloadObj?.optJSONArray("goals")
      val top = pickHighlight(goals)

      for (id in ids) {
        val views = RemoteViews(context.packageName, R.layout.widget_goal_highlight)
        views.setInt(R.id.root, "setBackgroundColor", SharedWidgetStore.themeBgColor(theme))

        if (top == null) {
          views.setTextViewText(R.id.goalTitle, "No goals yet")
          views.setTextViewText(R.id.pct, "--%")
          views.setProgressBar(R.id.progress, 100, 0, false)
        } else {
          val title = top.optString("title", "")
          val pct = SharedWidgetStore.pctInt01(top.optDouble("percent", 0.0))
          views.setTextViewText(R.id.goalTitle, title)
          views.setTextViewText(R.id.pct, "${pct}%")
          views.setProgressBar(R.id.progress, 100, pct, false)
        }

        views.setOnClickPendingIntent(
          R.id.root,
          WidgetUi.deepLinkPendingIntent(context, "exp+yearly-tracker://goals", 1003)
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
