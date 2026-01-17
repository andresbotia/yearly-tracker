package com.andresbotia.yearlytracker.widgets

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

object SharedWidgetStore {
  const val PREFS_NAME = "widget_prefs"
  const val KEY_PAYLOAD_JSON = "widget_payload_json"

  fun loadPayloadJson(context: Context): String {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return prefs.getString(KEY_PAYLOAD_JSON, null) ?: ""
  }

  fun parsePayload(json: String): JSONObject? {
    if (json.isBlank()) return null
    return try { JSONObject(json) } catch (_: Exception) { null }
  }

  fun clamp01(x: Double): Double = when {
    x < 0.0 -> 0.0
    x > 1.0 -> 1.0
    else -> x
  }

  fun pctInt01(x: Double): Int = (clamp01(x) * 100.0).toInt()

  // Matches your iOS-ish theme container colors (approx)
  fun themeBgColor(theme: String?): Int {
    return when ((theme ?: "").lowercase()) {
      "ocean", "oceanblue", "blue" -> 0x38008CD9  // translucent blue
      "dark" -> 0x40000000
      "light" -> 0x2EFFFFFF
      else -> 0x1F1A1A1F
    }.toInt()
  }

  fun jsonArray(obj: JSONObject, key: String): JSONArray = obj.optJSONArray(key) ?: JSONArray()
}
