// Atelier collection browser. Presentation only.
// Existing classic ids, custom ids, and art ids still resolve through makeTheme.

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import {
  ART_THEMES,
  ART_THEME_GROUPS,
  RANDOM_ART_ID,
  artistGroupLabel,
} from "../../themes/artThemes";
import { ART_IMAGES } from "../../assets/art/images";
import MetadataLabel from "../editorial/MetadataLabel";
import SectionRule from "../editorial/SectionRule";

function groupLabel(artist) {
  return artistGroupLabel(artist);
}

function Stamp({ image, selected, onPress, label, theme, wide }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.stamp,
        wide && styles.stampWide,
        {
          borderColor: selected ? theme.text : theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {image ? (
        <Image source={image} style={styles.stampImage} resizeMode="cover" />
      ) : (
        <View
          style={[
            styles.stampImage,
            { backgroundColor: theme.bg, borderColor: theme.border },
          ]}
        />
      )}
      {selected ? (
        <View style={[styles.stampMark, { backgroundColor: theme.text }]} />
      ) : null}
    </Pressable>
  );
}

export default function ThemeGallery({
  theme,
  themeChoice,
  classicThemes,
  customThemes,
  onPick,
  onDeleteCustom,
}) {
  const fontsLoaded = useFontsLoaded();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState("all");
  const paperTheme = ART_THEMES.find((t) => t.id === "museum-paper");
  const artWorks = ART_THEMES.filter((t) => t.artwork);
  const groups = ART_THEME_GROUPS.filter((g) =>
    artWorks.some((t) => groupLabel(t.artwork?.artist) === g.label),
  );
  const visible = useMemo(() => {
    if (filter === "all") return artWorks;
    return artWorks.filter((t) => groupLabel(t.artwork?.artist) === filter);
  }, [artWorks, filter]);

  const gap = SPACE.xs;
  const cols = width < 400 ? 3 : 4;
  const stampW = Math.max(72, Math.floor((Math.min(width, 420) - 48 - gap * (cols - 1)) / cols));

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
        [AT]  Atelier collection
      </MetadataLabel>
      <Text
        style={[
          styles.sectionNote,
          {
            color: theme.mutedText,
            fontFamily: fontFamily("body", fontsLoaded),
          },
        ]}
      >
        {artWorks.length} public-domain plates, bundled. No network calls.
      </Text>

      <Pressable
        onPress={() => onPick(RANDOM_ART_ID)}
        style={({ pressed }) => [
          styles.randomRow,
          {
            borderColor:
              themeChoice === RANDOM_ART_ID ? theme.text : theme.border,
            opacity: pressed ? 0.75 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: themeChoice === RANDOM_ART_ID }}
        accessibilityLabel="Random art"
      >
        <Text
          style={[
            styles.randomTitle,
            {
              color: theme.text,
              fontFamily: fontFamily("display", fontsLoaded),
            },
          ]}
        >
          Random art
        </Text>
        <Text
          style={[
            styles.randomMeta,
            {
              color: theme.mutedText,
              fontFamily: fontFamily("data", fontsLoaded),
            },
          ]}
        >
          A new plate each launch
        </Text>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {[{ label: "All", key: "all" }, ...groups.map((g) => ({ label: g.label, key: g.label }))].map(
          (chip) => {
            const on = filter === chip.key;
            return (
              <Pressable
                key={chip.key}
                onPress={() => setFilter(chip.key)}
                style={[
                  styles.chip,
                  {
                    borderColor: on ? theme.text : theme.border,
                    backgroundColor: on ? theme.text : "transparent",
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: on ? theme.bg || "#f6f3ec" : theme.text,
                      fontFamily: fontFamily("data", fontsLoaded),
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          },
        )}
      </ScrollView>

      <View style={[styles.grid, { gap }]}>
        {visible.map((t) => (
          <View key={t.id} style={{ width: stampW }}>
            <Stamp
              image={ART_IMAGES[t.id]}
              selected={t.id === themeChoice}
              onPress={() => onPick(t.id)}
              label={t.artwork?.title || t.name}
              theme={theme}
            />
            <Text
              style={[
                styles.stampCaption,
                {
                  color: theme.mutedText,
                  fontFamily: fontFamily("data", fontsLoaded),
                },
              ]}
              numberOfLines={2}
            >
              {t.artwork?.title || t.name}
            </Text>
          </View>
        ))}
      </View>

      <SectionRule theme={theme} />

      {paperTheme ? (
        <Pressable
          onPress={() => onPick(paperTheme.id)}
          style={({ pressed }) => [
            styles.listRow,
            {
              borderBottomColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.listTitle,
              {
                color: theme.text,
                fontFamily: fontFamily("display", fontsLoaded),
              },
            ]}
          >
            Museum Paper
          </Text>
          {themeChoice === paperTheme.id ? (
            <Text style={{ color: theme.text }}>●</Text>
          ) : null}
        </Pressable>
      ) : null}

      <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
        Classic
      </MetadataLabel>
      {(classicThemes || []).map((t) => (
        <Pressable
          key={t.id}
          onPress={() => onPick(t.id)}
          style={({ pressed }) => [
            styles.listRow,
            {
              borderBottomColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.listTitle,
              {
                color: theme.text,
                fontFamily: fontFamily("display", fontsLoaded),
              },
            ]}
          >
            {t.name}
          </Text>
          {t.id === themeChoice ? (
            <Text style={{ color: theme.text }}>●</Text>
          ) : null}
        </Pressable>
      ))}

      <SectionRule theme={theme} />
      <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
        Custom
      </MetadataLabel>
      {(customThemes || []).length === 0 ? (
        <Text
          style={[
            styles.empty,
            {
              color: theme.mutedText,
              fontFamily: fontFamily("body", fontsLoaded),
            },
          ]}
        >
          No custom palettes yet.
        </Text>
      ) : (
        (customThemes || []).map((t) => (
          <Pressable
            key={t.id}
            onPress={() => onPick(t.id)}
            style={({ pressed }) => [
              styles.listRow,
              {
                borderBottomColor: theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.listTitle,
                {
                  color: theme.text,
                  fontFamily: fontFamily("display", fontsLoaded),
                },
              ]}
            >
              {t.name}
            </Text>
            {t._customId ? (
              <Pressable
                onPress={() => onDeleteCustom(t._customId)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Delete theme ${t.name}`}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={theme.danger || "#9b2c2c"}
                />
              </Pressable>
            ) : null}
            {t.id === themeChoice ? (
              <Text style={{ color: theme.text }}>●</Text>
            ) : null}
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: SPACE.sm,
    maxHeight: 480,
  },
  scrollContent: {
    paddingBottom: SPACE.lg,
  },
  sectionNote: {
    marginTop: SPACE["2xs"],
    marginBottom: SPACE.sm,
    fontSize: TYPE_SIZE.caption,
  },
  randomRow: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACE.sm,
    marginBottom: SPACE.sm,
    minHeight: 56,
    justifyContent: "center",
  },
  randomTitle: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
  },
  randomMeta: {
    marginTop: 2,
    fontSize: TYPE_SIZE.kicker,
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
  },
  chips: {
    gap: SPACE.xs,
    paddingBottom: SPACE.sm,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    minHeight: 32,
    justifyContent: "center",
  },
  chipText: {
    fontSize: TYPE_SIZE.kicker,
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  stamp: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    aspectRatio: 3 / 4,
  },
  stampWide: {
    aspectRatio: 4 / 3,
  },
  stampImage: {
    width: "100%",
    height: "100%",
  },
  stampMark: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 7,
    height: 7,
  },
  stampCaption: {
    marginTop: 4,
    marginBottom: SPACE.sm,
    fontSize: 9,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACE.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    gap: SPACE.sm,
  },
  listTitle: {
    flex: 1,
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
  },
  empty: {
    marginTop: SPACE.sm,
    fontSize: TYPE_SIZE.caption,
  },
});
