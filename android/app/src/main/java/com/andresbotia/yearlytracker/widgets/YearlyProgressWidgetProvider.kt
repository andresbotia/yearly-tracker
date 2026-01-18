// android/app/src/main/java/com/andresbotia/yearlytracker/widgets/YearlyProgressWidgetProvider.kt
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

class YearlyProgressWidgetProvider : AppWidgetProvider() {

  companion object {
    private const val TAG = "YearlyProgressWidget"

    const val ACTION_REFRESH_ALL =
      "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH_ALL"
    const val ACTION_REFRESH =
      "com.andresbotia.yearlytracker.widgets.ACTION_REFRESH"

    fun requestUpdateAll(context: Context) {
      Log.d(TAG, "requestUpdateAll broadcast (explicit)")
      val intent = Intent(context, YearlyProgressWidgetProvider::class.java).apply {
        action = ACTION_REFRESH_ALL
      }
      context.sendBroadcast(intent)
    }

    fun updateAll(context: Context) {
      val mgr = AppWidgetManager.getInstance(context)
      val ids = mgr.getAppWidgetIds(
        ComponentName(context, YearlyProgressWidgetProvider::class.java)
      )
      Log.d(TAG, "updateAll ids=${ids.contentToString()}")
      onUpdateStatic(context, mgr, ids)
    }

    private fun onUpdateStatic(context: Context, mgr: AppWidgetManager, ids: IntArray) {
      Log.d(TAG, "onUpdateStatic ids=${ids.contentToString()}")

      val payloadJson = SharedWidgetStore.loadPayloadJson(
        context,
        SharedWidgetStore.KEY_YEARLY_PROGRESS
      )

      if (payloadJson.isBlank()) {
        Log.w(TAG, "No payload JSON found for yearly progress.")
      } else {
        Log.d(TAG, "Loaded payload JSON length=${payloadJson.length}")
      }

      val payloadObj = SharedWidgetStore.parsePayload(payloadJson)

      // ✅ Debug logs must be AFTER payloadObj is defined
      run {
        val keys = mutableListOf<String>()
        val it = payloadObj?.keys()
        while (it != null && it.hasNext()) keys.add(it.next())
        Log.d(TAG, "payload keys=$keys")
        Log.d(TAG, "yearlyProgress raw=${payloadObj?.optDouble("yearlyProgress", -1.0)}")
      }

      val theme = payloadObj?.optString("theme", null)
      val pct = SharedWidgetStore.pctInt01(payloadObj?.optDouble("yearlyProgress", 0.0) ?: 0.0)
      val debugText = SharedWidgetStore.loadDebugText(context)

      for (id in ids) {
        val views = RemoteViews(context.packageName, R.layout.widget_yearly_progress)

        views.setInt(R.id.root, "setBackgroundColor", SharedWidgetStore.themeBgColor(theme))
        views.setTextViewText(R.id.title, debugText ?: "NO_DEBUG")
        views.setTextViewText(R.id.pct, "${pct}%")
        views.setProgressBar(R.id.progress, 100, pct, false)

        // ✅ Tap widget -> open app via deep link
        views.setOnClickPendingIntent(
          R.id.root,
          WidgetUi.deepLinkPendingIntent(context, "exp+yearly-tracker://goals", 2001)
        )

        // (Optional but useful) Tap title -> force refresh
        val refreshIntent = Intent(context, YearlyProgressWidgetProvider::class.java).apply {
          action = ACTION_REFRESH
        }
        val refreshPending = PendingIntent.getBroadcast(
          context,
          1001,
          refreshIntent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.title, refreshPending)

        mgr.updateAppWidget(id, views)
      }
    }
  }

  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray
  ) {
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
