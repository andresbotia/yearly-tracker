package com.andresbotia.yearlytracker.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle

object WidgetUi {

  fun isLarge(options: Bundle?): Boolean {
    // crude but effective: large widgets have larger minHeight
    val minH = options?.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT) ?: 0
    return minH >= 180
  }

  fun chooseLayout(options: Bundle?, smallLayout: Int, largeLayout: Int): Int {
    return if (isLarge(options)) largeLayout else smallLayout
  }

  fun deepLinkPendingIntent(context: Context, uri: String, requestCode: Int): PendingIntent {
    val clickIntent = Intent(Intent.ACTION_VIEW, Uri.parse(uri)).apply {
      `package` = context.packageName
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    val flags = pendingFlags()
    return PendingIntent.getActivity(context, requestCode, clickIntent, flags)
  }

  /**
   * Safer "open app" intent for widgets (works even if deep links aren't registered right yet).
   */
  fun launchAppPendingIntent(context: Context, requestCode: Int): PendingIntent {
    val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
      ?: Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
        `package` = context.packageName
      }

    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    val flags = pendingFlags()
    return PendingIntent.getActivity(context, requestCode, launchIntent, flags)
  }

  private fun pendingFlags(): Int {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }
  }
}
