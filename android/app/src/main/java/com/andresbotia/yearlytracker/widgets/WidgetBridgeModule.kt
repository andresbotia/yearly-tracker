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
  private val tag = "WidgetBridge"

  // JS -> Native
  // nativeWidgetBridgeAndroid.pushProgressWidgetPayload(jsonString)
  @ReactMethod
  fun pushProgressWidgetPayload(json: String) {
    try {
      Log.d(tag, "pushProgressWidgetPayload length=${json.length}")
      savePayload(reactContext, SharedWidgetStore.KEY_YEARLY_PROGRESS, json)
      requestUpdate(reactContext, YearlyProgressWidgetProvider::class.java)
    } catch (e: Exception) {
      Log.e(tag, "pushProgressWidgetPayload failed", e)
    }
  }

  // JS -> Native
  @ReactMethod
  fun pushGoalsListWidgetPayload(json: String) {
    try {
      Log.d(tag, "pushGoalsListWidgetPayload length=${json.length}")
      savePayload(reactContext, SharedWidgetStore.KEY_GOALS_LIST, json)
      requestUpdate(reactContext, GoalsListWidgetProvider::class.java)
    } catch (e: Exception) {
      Log.e(tag, "pushGoalsListWidgetPayload failed", e)
    }
  }

  // JS -> Native
  @ReactMethod
  fun pushHabitsWidgetPayload(json: String) {
    try {
      Log.d(tag, "pushHabitsWidgetPayload length=${json.length}")
      savePayload(reactContext, SharedWidgetStore.KEY_HABITS, json)
      requestUpdate(reactContext, HabitsWidgetProvider::class.java)
    } catch (e: Exception) {
      Log.e(tag, "pushHabitsWidgetPayload failed", e)
    }
  }

  // Optional (if you have the “goal highlight” widget)
  @ReactMethod
  fun pushGoalHighlightWidgetPayload(json: String) {
    try {
      Log.d(tag, "pushGoalHighlightWidgetPayload length=${json.length}")
      savePayload(reactContext, SharedWidgetStore.KEY_GOAL_HIGHLIGHT, json)
      requestUpdate(reactContext, GoalHighlightWidgetProvider::class.java)
    } catch (e: Exception) {
      Log.e(tag, "pushGoalHighlightWidgetPayload failed", e)
    }
  }

  @ReactMethod
  fun setDebugWidgetText(text: String) {
    try {
      Log.d(tag, "setDebugWidgetText length=${text.length}")
      saveDebugText(reactContext, text)
      requestUpdate(reactContext, YearlyProgressWidgetProvider::class.java)
      requestUpdate(reactContext, GoalsListWidgetProvider::class.java)
      requestUpdate(reactContext, HabitsWidgetProvider::class.java)
      requestUpdate(reactContext, GoalHighlightWidgetProvider::class.java)
    } catch (e: Exception) {
      Log.e(tag, "setDebugWidgetText failed", e)
    }
  }
}

// -------------------------
// Widget payload + update helpers
// -------------------------

private const val WIDGET_PREFS = "yearly_tracker_widget_payloads"

private fun savePayload(context: Context, key: String, json: String) {
  val success = context
    .getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE)
    .edit()
    .putString(key, json)
    .commit()
  Log.d("WidgetBridge", "Saved payload key=$key success=$success")
}

private fun saveDebugText(context: Context, text: String) {
  val success = context
    .getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE)
    .edit()
    .putString(SharedWidgetStore.KEY_DEBUG_TEXT, text)
    .commit()
  Log.d("WidgetBridge", "Saved debug text success=$success")
}

private fun requestUpdate(context: Context, provider: Class<out AppWidgetProvider>) {
  val manager = AppWidgetManager.getInstance(context)
  val ids = manager.getAppWidgetIds(ComponentName(context, provider))
  Log.d("WidgetBridge", "requestUpdate ${provider.simpleName} ids=${ids.contentToString()}")
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
