// --- Widget payload storage + update helpers ---
// Put this at the BOTTOM of WidgetBridgeModule.kt (same package)

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.appwidget.AppWidgetProvider

private const val WIDGET_PREFS = "yearly_tracker_widget_payloads"

/**
 * Matches calls like: savePayload(reactApplicationContext, jsonString)
 */
private fun savePayload(context: Context, json: String) {
  context
    .getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE)
    .edit()
    .putString("payload", json)
    .apply()
}

/**
 * Also supports calls like: savePayload(context, "goalsList", jsonString)
 */
private fun savePayload(context: Context, key: String, json: String) {
  context
    .getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE)
    .edit()
    .putString(key, json)
    .apply()
}

/**
 * Matches calls like: requestUpdate(reactApplicationContext, ProgressWidgetProvider::class.java)
 */
private fun requestUpdate(context: Context, provider: Class<out AppWidgetProvider>) {
  val manager = AppWidgetManager.getInstance(context)
  val ids = manager.getAppWidgetIds(ComponentName(context, provider))

  if (ids.isEmpty()) return

  // Triggers provider.onUpdate(...) so your RemoteViews redraw with latest saved payload
  val intent = Intent(context, provider).apply {
    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
  }

  try {
    context.sendBroadcast(intent)
  } catch (e: Exception) {
    Log.e("WidgetBridge", "requestUpdate failed for ${provider.simpleName}", e)
  }
}
