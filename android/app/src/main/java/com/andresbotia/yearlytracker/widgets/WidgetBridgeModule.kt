package com.andresbotia.yearlytracker.widgets

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

  @ReactMethod
  fun pushProgressWidgetPayload(json: String) {
    try {
      Log.d(tag, "pushProgressWidgetPayload length=${json.length}")
      savePayload(reactContext, SharedWidgetStore.KEY_YEARLY_PROGRESS, json)
      requestUpdate(
        reactContext,
        YearlyProgressWidgetProvider::class.java,
        YearlyProgressWidgetProvider.ACTION_REFRESH_ALL
      )
    } catch (e: Exception) {
      Log.e(tag, "pushProgressWidgetPayload failed", e)
    }
  }

  @ReactMethod
  fun pushGoalsListWidgetPayload(json: String) {
    try {
      Log.d(tag, "pushGoalsListWidgetPayload length=${json.length}")
      savePayload(reactContext, SharedWidgetStore.KEY_GOALS_LIST, json)
      requestUpdate(
        reactContext,
        GoalsListWidgetProvider::class.java,
        GoalsListWidgetProvider.ACTION_REFRESH_ALL
      )
    } catch (e: Exception) {
      Log.e(tag, "pushGoalsListWidgetPayload failed", e)
    }
  }

  @ReactMethod
  fun pushHabitsWidgetPayload(json: String) {
    try {
      Log.d(tag, "pushHabitsWidgetPayload length=${json.length}")
      savePayload(reactContext, SharedWidgetStore.KEY_HABITS, json)
      requestUpdate(
        reactContext,
        HabitsWidgetProvider::class.java,
        HabitsWidgetProvider.ACTION_REFRESH_ALL
      )
    } catch (e: Exception) {
      Log.e(tag, "pushHabitsWidgetPayload failed", e)
    }
  }

  @ReactMethod
  fun pushGoalHighlightWidgetPayload(json: String) {
    try {
      Log.d(tag, "pushGoalHighlightWidgetPayload length=${json.length}")
      savePayload(reactContext, SharedWidgetStore.KEY_GOAL_HIGHLIGHT, json)
      requestUpdate(
        reactContext,
        GoalHighlightWidgetProvider::class.java,
        GoalHighlightWidgetProvider.ACTION_REFRESH_ALL
      )
    } catch (e: Exception) {
      Log.e(tag, "pushGoalHighlightWidgetPayload failed", e)
    }
  }

  @ReactMethod
  fun setDebugWidgetText(text: String) {
    try {
      Log.d(tag, "setDebugWidgetText length=${text.length}")
      saveDebugText(reactContext, text)

      requestUpdate(
        reactContext,
        YearlyProgressWidgetProvider::class.java,
        YearlyProgressWidgetProvider.ACTION_REFRESH_ALL
      )
      requestUpdate(
        reactContext,
        GoalsListWidgetProvider::class.java,
        GoalsListWidgetProvider.ACTION_REFRESH_ALL
      )
      requestUpdate(
        reactContext,
        HabitsWidgetProvider::class.java,
        HabitsWidgetProvider.ACTION_REFRESH_ALL
      )
      requestUpdate(
        reactContext,
        GoalHighlightWidgetProvider::class.java,
        GoalHighlightWidgetProvider.ACTION_REFRESH_ALL
      )
    } catch (e: Exception) {
      Log.e(tag, "setDebugWidgetText failed", e)
    }
  }
}

// -------------------------
// Widget payload + update helpers
// -------------------------

private fun savePayload(context: Context, key: String, json: String) {
  val success = context
    .getSharedPreferences(SharedWidgetStore.PREFS_NAME, Context.MODE_PRIVATE)
    .edit()
    .putString(key, json)
    .commit()

  Log.d("WidgetBridge", "Saved payload key=$key success=$success len=${json.length}")
}

private fun saveDebugText(context: Context, text: String) {
  val success = context
    .getSharedPreferences(SharedWidgetStore.PREFS_NAME, Context.MODE_PRIVATE)
    .edit()
    .putString(SharedWidgetStore.KEY_DEBUG_TEXT, text)
    .commit()

  Log.d("WidgetBridge", "Saved debug text success=$success len=${text.length}")
}

/**
 * Explicit broadcast to a specific provider class with a provider-defined action.
 * This works reliably even when receivers are android:exported="false".
 */
private fun requestUpdate(
  context: Context,
  provider: Class<*>,
  refreshAction: String
) {
  Log.d("WidgetBridge", "requestUpdate ${provider.simpleName} action=$refreshAction")

  val intent = Intent(context, provider).apply {
    action = refreshAction
  }

  try {
    context.sendBroadcast(intent)
  } catch (e: Exception) {
    Log.e("WidgetBridge", "requestUpdate failed for ${provider.simpleName}", e)
  }
}
