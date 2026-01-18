package com.andresbotia.yearlytracker.widgets

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

object SharedWidgetStore {
  const val PREFS_NAME = "yearly_tracker_widget_payloads"

  const val KEY_YEARLY_PROGRESS = "yearly_progress"
  const val KEY_GOALS_LIST = "goals_list"
  const val KEY_HABITS = "habits"
  const val KEY_GOAL_HIGHLIGHT = "goal_highlight"
  const val KEY_DEBUG_TEXT = "debug_text"

  fun loadPayloadJson(context: Context, key: String): String {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return prefs.getString(key, null) ?: ""
  }

  fun loadDebugText(context: Context): String? {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return prefs.getString(KEY_DEBUG_TEXT, null)
  }

  fun parsePayload(json: String): JSONObject? {
    if (json.isBlank()) return null
    return try {
      JSONObject(json)
    } catch (_: Exception) {
      null
    }
  }

  fun clamp01(x: Double): Double = when {
    x < 0.0 -> 0.0
    x > 1.0 -> 1.0
    else -> x
  }

  fun pctInt01(x: Double): Int = (clamp01(x) * 100.0).toInt()

  // Theme background approximation (ARGB ints)
  fun themeBgColor(theme: String?): Int {
    return when ((theme ?: "").lowercase()) {
      "ocean", "oceanblue", "blue" -> 0x38008CD9.toInt()
      "dark" -> 0x40000000.toInt()
      "light" -> 0x2EFFFFFF.toInt()
      else -> 0x1F1A1A1F.toInt()
    }
  }

  fun jsonArray(obj: JSONObject, key: String): JSONArray =
    obj.optJSONArray(key) ?: JSONArray()
}
