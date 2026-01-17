package com.andresbotia.yearlytracker.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.andresbotia.yearlytracker.R
import org.json.JSONObject

class HabitsWidgetProvider : AppWidgetProvider() {

  companion object {
    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(ComponentName(context, HabitsWidgetProvider::class.java))
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
      val payloadObj = SharedWidgetStore.parsePayload(SharedWidgetStore.loadPayloadJson(context))
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

        views.setOnClickPendingIntent(
          R.id.root,
          WidgetUi.deepLinkPendingIntent(context, "exp+yearly-tracker://habits", 1002)
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
