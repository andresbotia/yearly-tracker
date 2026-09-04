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
import org.json.JSONArray
import org.json.JSONObject

class GoalHighlightWidgetProvider : AppWidgetProvider() {

  companion object {
    private const val TAG = "GoalHighlightWidget"

    const val ACTION_REFRESH_ALL = "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH_ALL"
    const val ACTION_REFRESH = "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH_GOAL_HIGHLIGHT"

    fun requestUpdateAll(context: Context) {
      Log.d(TAG, "requestUpdateAll explicit broadcast")
      val intent = Intent(context, GoalHighlightWidgetProvider::class.java).apply {
        action = ACTION_REFRESH_ALL
      }
      context.sendBroadcast(intent)
    }

    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, GoalHighlightWidgetProvider::class.java))
      Log.d(TAG, "updateAll ids=${ids.contentToString()}")
      onUpdateStatic(context, mgr, ids)
    }

    private fun pickHighlight(goals: JSONArray?): JSONObject? {
      if (goals == null || goals.length() == 0) return null

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
      Log.d(TAG, "onUpdateStatic ids=${ids.contentToString()}")

      val payloadJson = SharedWidgetStore.loadPayloadJson(context, SharedWidgetStore.KEY_GOAL_HIGHLIGHT)
      if (payloadJson.isBlank()) {
        Log.w(TAG, "No payload JSON found for goal highlight.")
      } else {
        Log.d(TAG, "Loaded payload JSON length=${payloadJson.length}")
      }

      val payloadObj = SharedWidgetStore.parsePayload(payloadJson)
      val goals = payloadObj?.optJSONArray("goals")
      val top = pickHighlight(goals)

      for (id in ids) {
        val views = RemoteViews(context.packageName, R.layout.widget_goal_highlight)
        SharedWidgetStore.applySurface(views, context, payloadObj)
        SharedWidgetStore.applyInk(views, payloadObj, R.id.kicker, R.id.goalTitle, R.id.pct)
        try {
          views.setTextColor(R.id.bar, SharedWidgetStore.accentColor(payloadObj))
        } catch (_: Exception) {
        }

        views.setTextViewText(R.id.kicker, "/ GOAL")
        if (top == null) {
          views.setTextViewText(R.id.goalTitle, "No goals yet")
          views.setTextViewText(R.id.pct, "00%")
          views.setTextViewText(R.id.bar, SharedWidgetStore.asciiBar(0.0, 22))
        } else {
          val title = top.optString("title", "")
          val pct01 = top.optDouble("percent", 0.0)
          views.setTextViewText(R.id.goalTitle, title)
          views.setTextViewText(R.id.pct, SharedWidgetStore.pctLabel(pct01))
          views.setTextViewText(R.id.bar, SharedWidgetStore.asciiBar(pct01, 22))
        }

        val refreshIntent = Intent(context, GoalHighlightWidgetProvider::class.java).apply {
          action = ACTION_REFRESH
        }
        val refreshPi = PendingIntent.getBroadcast(
          context,
          4001,
          refreshIntent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(
  R.id.root,
  WidgetUi.launchAppPendingIntent(context, 2004)
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
    when (intent.action) {
      ACTION_REFRESH_ALL, ACTION_REFRESH -> updateAll(context)
    }
  }
}
