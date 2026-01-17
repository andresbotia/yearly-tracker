package com.andresbotia.yearlytracker.widgets

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetBridgeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "WidgetBridge"

  @ReactMethod
  fun saveProgressWidgetJson(json: String, promise: Promise) {
    try {
      val prefs = reactApplicationContext.getSharedPreferences(
        ProgressWidgetProvider.PREFS_NAME,
        Context.MODE_PRIVATE
      )
      prefs.edit().putString(ProgressWidgetProvider.KEY_JSON, json).apply()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("SAVE_FAILED", e)
    }
  }

  @ReactMethod
  fun refreshProgressWidget(promise: Promise) {
    try {
      ProgressWidgetProvider.requestUpdate(reactApplicationContext)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("REFRESH_FAILED", e)
    }
  }
}
