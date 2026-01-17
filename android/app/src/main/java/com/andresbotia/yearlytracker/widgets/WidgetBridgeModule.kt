package com.andresbotia.yearlytracker.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetBridgeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "WidgetBridgeAndroid"

  // JS -> Native
  // nativeWidgetBridgeAndroid.pushProgressWidgetPayload(jsonString)
  @ReactMethod
  fun pushProgressWidgetPayload(json: String) {
    try {
      savePayload(reactContext, "yearly_progress", json)
      requestUpdate(reactContext, YearlyProgressWidgetProvider::class.java)
    } catch (e: Exception) {
      Log.e("WidgetBridge", "pushProgressWidgetPayload failed", e)
    }
  }

  // JS -> Native
  @ReactMethod
  fun pushGoalsListWidgetPayload(json: String) {
    try {
      savePayload(reactContext, "goals_list", json)
      requestUpdate(reactContext, GoalsListWidgetProvider::class.java)
    } catch (e: Exception) {
      Log.e("WidgetBridge", "pushGoalsListWidgetPayload failed", e)
    }
  }

  // JS -> Native
  @ReactMethod
  fun pushHabitsWidgetPayload(json: String) {
    try {
      savePayload(reactContext, "habits", json)
      requestUpdate(reactContext, HabitsWidgetProvider::class.java)
    } catch (e: Exception) {
      Log.e("WidgetBridge", "pushHabitsWidgetPayload failed", e)
    }
  }

  // Optional (if you have the “goal highlight” widget)
  @ReactMethod
  fun pushGoalHighlightWidgetPayload(json: String) {
    try {
      savePayload(reactContext, "goal_highlight", json)
      requestUpdate(reactContext, GoalHighlightWidgetProvider::class.java)
    } catch (e: Exception) {
      Log.e("WidgetBridge", "pushGoalHighlightWidgetPayload failed", e)
    }
  }
}

// -------------------------
// Widget payload + update helpers
// -------------------------

private const val WIDGET_PREFS = "yearly_tracker_widget_payloads"

private fun savePayload(context: Context, key: String, json: String) {
  context
    .getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE)
    .edit()
    .putString(key, json)
    .apply()
}

private fun requestUpdate(context: Context, provider: Class<out AppWidgetProvider>) {
  val manager = AppWidgetManager.getInstance(context)
  val ids = manager.getAppWidgetIds(ComponentName(context, provider))
  if (ids.isEmpty()) return

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
