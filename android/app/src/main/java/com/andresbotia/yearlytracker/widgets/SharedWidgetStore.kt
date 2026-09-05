package com.andresbotia.yearlytracker.widgets

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.net.Uri
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import com.andresbotia.yearlytracker.R
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.net.URL
import java.util.Calendar
import kotlin.math.max
import kotlin.math.roundToInt

object SharedWidgetStore {
  const val PREFS_NAME = "yearly_tracker_widget_payloads"

  const val KEY_YEARLY_PROGRESS = "yearly_progress"
  const val KEY_GOALS_LIST = "goals_list"
  const val KEY_HABITS = "habits"
  const val KEY_GOAL_HIGHLIGHT = "goal_highlight"
  const val KEY_DEBUG_TEXT = "debug_text"

  const val ARTWORK_FILENAME = "atelier-widget-background.jpg"
  const val ARTWORK_ID_KEY = "yt_widget_artwork_id_v1"
  private const val MAX_ARTWORK_PX = 900
  private const val TAG = "SharedWidgetStore"

  const val PAPER = 0xFFF6F3EC.toInt()
  const val INK = 0xFF1C1916.toInt()
  const val VEIL = 0x96F6F3EC.toInt()

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

  fun pctInt01(x: Double): Int = (clamp01(x) * 100.0).roundToInt()

  fun pctLabel(x: Double): String = String.format("%02d%%", pctInt01(x))

  fun asciiBar(x: Double, width: Int = 20): String {
    val filled = (clamp01(x) * width).roundToInt().coerceIn(0, width)
    return "+".repeat(filled) + ".".repeat(width - filled)
  }

  fun habitSymbol(state: Int): String = when (state) {
    1 -> "+"
    2 -> "×"
    else -> "."
  }

  fun payloadYear(payload: JSONObject?): Int {
    val y = payload?.optInt("year", 0) ?: 0
    if (y > 0) return y
    return Calendar.getInstance().get(Calendar.YEAR)
  }

  fun parseHexColor(hex: String?): Int? {
    if (hex.isNullOrBlank()) return null
    val h = hex.trim().removePrefix("#")
    if (h.length != 6) return null
    return try {
      (0xFF000000 or h.toLong(16)).toInt()
    } catch (_: Exception) {
      null
    }
  }

  fun inkColor(payload: JSONObject?): Int =
    parseHexColor(payload?.optString("themeText")) ?: INK

  fun mutedInk(payload: JSONObject?): Int {
    val c = inkColor(payload)
    val r = Color.red(c)
    val g = Color.green(c)
    val b = Color.blue(c)
    return Color.argb(158, r, g, b)
  }

  fun accentColor(payload: JSONObject?): Int =
    parseHexColor(payload?.optString("themePrimary")) ?: inkColor(payload)

  fun surfaceColor(payload: JSONObject?): Int =
    parseHexColor(payload?.optString("themeBg"))
      ?: parseHexColor(payload?.optString("themePrimary"))
      ?: PAPER

  // Legacy translucent approximation kept for unused providers.
  fun themeBgColor(theme: String?, payload: JSONObject? = null): Int {
    parseHexColor(payload?.optString("themeBg"))?.let { return it }
    parseHexColor(payload?.optString("themePrimary"))?.let { return (it and 0x00FFFFFF) or 0x38000000 }
    return when ((theme ?: "").lowercase()) {
      "ocean", "oceanblue", "blue" -> 0x38008CD9.toInt()
      "dark" -> 0x40000000.toInt()
      "light" -> 0x2EFFFFFF.toInt()
      else -> PAPER
    }
  }

  fun jsonArray(obj: JSONObject, key: String): JSONArray =
    obj.optJSONArray(key) ?: JSONArray()

  fun artworkFile(context: Context): File =
    File(File(context.filesDir, "widget"), ARTWORK_FILENAME)

  fun writeArtwork(context: Context, sourceUri: String, artworkId: String) {
    val id = artworkId.trim()
    if (id.isEmpty()) {
      clearArtwork(context)
      return
    }
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val file = artworkFile(context)
    if (prefs.getString(ARTWORK_ID_KEY, null) == id && file.exists() && file.length() > 0L) {
      return
    }
    val bitmap = decodeUri(context, sourceUri)
    if (bitmap == null) {
      Log.w(TAG, "Could not decode widget artwork from $sourceUri")
      clearArtwork(context)
      return
    }
    val scaled = scaleMax(bitmap, MAX_ARTWORK_PX)
    try {
      file.parentFile?.mkdirs()
      FileOutputStream(file).use { out ->
        scaled.compress(Bitmap.CompressFormat.JPEG, 82, out)
      }
      prefs.edit().putString(ARTWORK_ID_KEY, id).commit()
    } catch (e: Exception) {
      Log.e(TAG, "writeArtwork failed", e)
      clearArtwork(context)
    } finally {
      if (scaled !== bitmap) scaled.recycle()
      bitmap.recycle()
    }
  }

  fun clearArtwork(context: Context) {
    try {
      val file = artworkFile(context)
      if (file.exists()) file.delete()
    } catch (_: Exception) {
    }
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(ARTWORK_ID_KEY)
      .commit()
  }

  fun decodeSharedArtwork(context: Context): Bitmap? {
    val file = artworkFile(context)
    if (!file.exists() || file.length() <= 0L) return null
    return try {
      BitmapFactory.decodeFile(file.absolutePath)
    } catch (e: Exception) {
      Log.e(TAG, "decodeSharedArtwork failed", e)
      null
    }
  }

  fun applySurface(views: RemoteViews, context: Context, payload: JSONObject?) {
    val bg = surfaceColor(payload)
    val hasArt = payload?.optBoolean("hasArtwork", false) == true
    val bmp = if (hasArt) decodeSharedArtwork(context) else null
    if (bmp != null) {
      try {
        views.setImageViewBitmap(R.id.artwork, bmp)
        views.setViewVisibility(R.id.artwork, View.VISIBLE)
        views.setViewVisibility(R.id.veil, View.VISIBLE)
        views.setInt(R.id.root, "setBackgroundColor", Color.TRANSPARENT)
        return
      } catch (e: Exception) {
        Log.w(TAG, "applySurface artwork failed, using palette", e)
      }
    }
    try {
      views.setViewVisibility(R.id.artwork, View.GONE)
      views.setViewVisibility(R.id.veil, View.GONE)
    } catch (_: Exception) {
    }
    try {
      views.setInt(R.id.root, "setBackgroundColor", bg)
    } catch (_: Exception) {
    }
  }

  fun applyInk(views: RemoteViews, payload: JSONObject?, vararg ids: Int) {
    val ink = inkColor(payload)
    val muted = mutedInk(payload)
    for (id in ids) {
      try {
        val color = if (id == R.id.kicker || id == R.id.moreLine) muted else ink
        views.setTextColor(id, color)
      } catch (_: Exception) {
      }
    }
  }

  private fun decodeUri(context: Context, sourceUri: String): Bitmap? {
    val trimmed = sourceUri.trim()
    if (trimmed.isEmpty()) return null
    return try {
      openStream(context, trimmed).use { stream ->
        if (stream == null) return null
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        val preview = stream.readBytes()
        BitmapFactory.decodeByteArray(preview, 0, preview.size, bounds)
        val opts = BitmapFactory.Options().apply {
          inSampleSize = sampleSize(bounds.outWidth, bounds.outHeight, MAX_ARTWORK_PX)
        }
        BitmapFactory.decodeByteArray(preview, 0, preview.size, opts)
      }
    } catch (e: Exception) {
      Log.e(TAG, "decodeUri failed", e)
      null
    }
  }

  private fun openStream(context: Context, sourceUri: String): InputStream? {
    return try {
      when {
        sourceUri.startsWith("file://") -> {
          val path = Uri.parse(sourceUri).path ?: sourceUri.removePrefix("file://")
          FileInputStream(path)
        }
        sourceUri.startsWith("/") -> FileInputStream(sourceUri)
        sourceUri.startsWith("content://") ||
          sourceUri.startsWith("android.resource://") ->
          context.contentResolver.openInputStream(Uri.parse(sourceUri))
        sourceUri.startsWith("http://") || sourceUri.startsWith("https://") ->
          URL(sourceUri).openStream()
        sourceUri.startsWith("asset://") || sourceUri.startsWith("assets://") -> {
          val path = sourceUri.substringAfter("://").trimStart('/')
          context.assets.open(path)
        }
        else -> {
          try {
            context.contentResolver.openInputStream(Uri.parse(sourceUri))
          } catch (_: Exception) {
            FileInputStream(sourceUri)
          }
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "openStream failed for $sourceUri", e)
      null
    }
  }

  private fun sampleSize(width: Int, height: Int, maxPx: Int): Int {
    var sample = 1
    val longest = max(width, height)
    if (longest <= 0) return 1
    while (longest / sample > maxPx * 2) {
      sample *= 2
    }
    return sample
  }

  private fun scaleMax(src: Bitmap, maxPx: Int): Bitmap {
    val longest = max(src.width, src.height)
    if (longest <= maxPx || longest <= 0) return src
    val scale = maxPx.toFloat() / longest.toFloat()
    val w = max(1, (src.width * scale).roundToInt())
    val h = max(1, (src.height * scale).roundToInt())
    return Bitmap.createScaledBitmap(src, w, h, true)
  }
}
