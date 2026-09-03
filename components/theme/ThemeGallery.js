// Atelier collection theme picker. Presentation only.
// Existing classic ids, custom ids, and art ids still resolve through makeTheme.

import React from "react";
import { View, Text, Pressable, Image, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import { ART_THEMES, ART_THEME_GROUPS } from "../../themes/artThemes";
import { ART_IMAGES } from "../../assets/art/images";
import MetadataLabel from "../editorial/MetadataLabel";
import SectionRule from "../editorial/SectionRule";

function PaletteDots({ palette }) {
  const colors = [
    palette?.primary,
    palette?.bg,
    palette?.text,
    palette?.card,
  ].filter(Boolean);

  return (
    <View style={styles.dots}>
      {colors.map((c, i) => (
        <View
          key={`${c}-${i}`}
          style={[styles.dot, { backgroundColor: c, borderColor: palette.border }]}
        />
      ))}
    </View>
  );
}

function GalleryRow({
  title,
  subtitle,
  meta,
  selected,
  onPress,
  theme,
  fontsLoaded,
  image,
  trailing,
  children,
}) {
  const ink = theme.text;
  const muted = theme.mutedText;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: theme.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}${selected ? ", selected" : ""}`}
    >
      {image ? (
        <Image source={image} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View
          style={[
            styles.thumb,
            styles.thumbFallback,
            { backgroundColor: theme.bg, borderColor: theme.border },
          ]}
        />
      )}
      <View style={styles.body}>
        <Text
          style={[
            styles.title,
            { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
          ]}
        >
          {String(title || "").toUpperCase()}
        </Text>
        {!!subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: muted, fontFamily: fontFamily("body", fontsLoaded) },
            ]}
          >
            {subtitle}
          </Text>
        )}
        {!!meta && (
          <Text
            style={[
              styles.meta,
              { color: muted, fontFamily: fontFamily("data", fontsLoaded) },
            ]}
          >
            {meta}
          </Text>
        )}
        {children}
      </View>
      {trailing}
      {selected ? (
        <Text
          style={[
            styles.selectedMark,
            { color: ink, fontFamily: fontFamily("data", fontsLoaded) },
          ]}
        >
          ●
        </Text>
      ) : null}
    </Pressable>
  );
}

function ArtGroup({
  label,
  themes,
  theme,
  themeChoice,
  fontsLoaded,
  onPick,
}) {
  if (!themes.length) return null;
  return (
    <View style={styles.group}>
      <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
        {label}
      </MetadataLabel>
      {themes.map((t, i) => {
        const selected = t.id === themeChoice;
        const art = t.artwork;
        const image = ART_IMAGES[t.id] || null;
        const index = String(i + 1).padStart(2, "0");
        return (
          <GalleryRow
            key={t.id}
            title={`${index}  —  ${art?.title || t.name}`}
            subtitle={art ? art.artist : "No plate"}
            meta={
              art
                ? [art.year, art.museum].filter(Boolean).join("  ·  ")
                : "Paper, ink, rule"
            }
            selected={selected}
            onPress={() => onPick(t.id)}
            theme={theme}
            fontsLoaded={fontsLoaded}
            image={image}
          >
            <PaletteDots palette={t.palette} />
          </GalleryRow>
        );
      })}
    </View>
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
  const paperTheme = ART_THEMES.find((t) => t.id === "museum-paper");

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
        Public-domain plates, bundled. No network calls.
      </Text>

      {ART_THEME_GROUPS.map((group) => (
        <ArtGroup
          key={group.key}
          label={group.label}
          themes={ART_THEMES.filter((t) => t.artwork?.artist === group.artist)}
          theme={theme}
          themeChoice={themeChoice}
          fontsLoaded={fontsLoaded}
          onPick={onPick}
        />
      ))}

      {paperTheme ? (
        <ArtGroup
          label="Paper"
          themes={[paperTheme]}
          theme={theme}
          themeChoice={themeChoice}
          fontsLoaded={fontsLoaded}
          onPick={onPick}
        />
      ) : null}

      <SectionRule theme={theme} />

      <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
        Classic
      </MetadataLabel>
      {(classicThemes || []).map((t) => {
        const selected = t.id === themeChoice;
        return (
          <GalleryRow
            key={t.id}
            title={t.name}
            subtitle="Built-in palette"
            selected={selected}
            onPress={() => onPick(t.id)}
            theme={theme}
            fontsLoaded={fontsLoaded}
          >
            <PaletteDots palette={t.palette} />
          </GalleryRow>
        );
      })}

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
        (customThemes || []).map((t) => {
          const selected = t.id === themeChoice;
          return (
            <GalleryRow
              key={t.id}
              title={t.name}
              subtitle="Yours"
              selected={selected}
              onPress={() => onPick(t.id)}
              theme={theme}
              fontsLoaded={fontsLoaded}
              trailing={
                t._customId ? (
                  <Pressable
                    onPress={() => onDeleteCustom(t._customId)}
                    hitSlop={10}
                    style={styles.trash}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete theme ${t.name}`}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={theme.danger || "#9b2c2c"}
                    />
                  </Pressable>
                ) : null
              }
            >
              <PaletteDots palette={t.palette} />
            </GalleryRow>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: SPACE.sm,
    maxHeight: 420,
  },
  scrollContent: {
    paddingBottom: SPACE.md,
  },
  sectionNote: {
    marginTop: SPACE["2xs"],
    marginBottom: SPACE.sm,
    fontSize: TYPE_SIZE.caption,
  },
  group: {
    marginTop: SPACE.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACE.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: SPACE.sm,
  },
  thumb: {
    width: 56,
    height: 72,
    backgroundColor: "transparent",
  },
  thumbFallback: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  subtitle: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "400",
  },
  meta: {
    fontSize: TYPE_SIZE.kicker,
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
  },
  dots: {
    flexDirection: "row",
    gap: 4,
    marginTop: SPACE["2xs"],
  },
  dot: {
    width: 10,
    height: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  selectedMark: {
    fontSize: 10,
    marginLeft: SPACE["2xs"],
  },
  trash: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    marginTop: SPACE.sm,
    fontSize: TYPE_SIZE.caption,
  },
});
