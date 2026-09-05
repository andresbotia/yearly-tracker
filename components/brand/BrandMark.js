// Final [YT] mark. Geometry is outlined in assets/brand — never typed brackets.
import React from "react";
import { Image } from "react-native";

const OPTICAL = {
  16: require("../../assets/brand/marks/yearly-mark-16.png"),
  24: require("../../assets/brand/marks/yearly-mark-24.png"),
  32: require("../../assets/brand/marks/yearly-mark-32.png"),
  64: require("../../assets/brand/marks/yearly-mark-64.png"),
  128: require("../../assets/brand/marks/yearly-mark-128.png"),
};

const LARGE = {
  ink: require("../../assets/brand/marks/yearly-mark-ink-1024.png"),
  ivory: require("../../assets/brand/marks/yearly-mark-ivory-1024.png"),
  cypress: require("../../assets/brand/marks/yearly-mark-cypress-1024.png"),
};

function opticalKey(size) {
  if (size <= 16) return 16;
  if (size <= 24) return 24;
  if (size <= 32) return 32;
  if (size <= 64) return 64;
  return 128;
}

export default function BrandMark({
  size = 24,
  variant = "ink",
  style,
}) {
  const label = { accessibilityRole: "image", accessibilityLabel: "Yearly Tracker" };

  if (size > 128) {
    const src = LARGE[variant] || LARGE.ink;
    const height = Math.round(size * (491 / 1024));
    return (
      <Image
        source={src}
        style={[{ width: size, height }, style]}
        resizeMode="contain"
        {...label}
      />
    );
  }

  return (
    <Image
      source={OPTICAL[opticalKey(size)]}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      {...label}
    />
  );
}
