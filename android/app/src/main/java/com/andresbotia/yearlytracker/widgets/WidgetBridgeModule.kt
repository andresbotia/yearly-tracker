package com.andresbotia.yearlytracker.widgets

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetBridgeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "WidgetBridgeAndroid"

  @ReactMethod
  fun pushWidgetPayload(payloadJson: String) {
    // Save to shared prefs (or your SharedWidgetStore helper)
    SharedWidgetStore.savePayload(reactApplicationContext, payloadJson)

    // Trigger refresh for all widget providers you registered
    YearlyProgressWidgetProvider.requestUpdate(reactApplicationContext)
    HabitsWidgetProvider.requestUpdate(reactApplicationContext)
    GoalHighlightWidgetProvider.requestUpdate(reactApplicationContext)
    GoalsListWidgetProvider.requestUpdate(reactApplicationContext)
  }
}
