package com.andresbotia.yearlytracker.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build

object WidgetUi {
  fun isLarge(options: android.os.Bundle?): Boolean {
    // crude but effective: large widgets have larger minHeight
    val minH = options?.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT) ?: 0
    return minH >= 180
  }

  fun deepLinkPendingIntent(context: Context, uri: String, requestCode: Int): PendingIntent {
    val clickIntent = Intent(Intent.ACTION_VIEW, Uri.parse(uri)).apply {
      `package` = context.packageName
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }
    return PendingIntent.getActivity(context, requestCode, clickIntent, flags)
  }
}
