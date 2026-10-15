import WidgetKit
import SwiftUI

// MARK: - Timeline

// Progress is derived from each entry's date on-device. The app payload is
// read only for theme colors; the widget never uses the app's viewed year.
struct YearGlanceProvider: TimelineProvider {
    func placeholder(in context: Context) -> YearGlanceEntry {
        YearGlanceEntry(date: Date(), payload: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (YearGlanceEntry) -> Void) {
        completion(YearGlanceEntry(date: Date(), payload: SharedStore.loadPayload()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<YearGlanceEntry>) -> Void) {
        let now = Date()
        let payload = SharedStore.loadPayload()
        let entries = YearProgress.timelineDates(from: now).map {
            YearGlanceEntry(date: $0, payload: payload)
        }
        // Rebuild after the next local midnight so the following day's entry
        // uses the current time zone (DST and travel included).
        let reload = YearProgress.nextDayStart(after: now)
        completion(Timeline(entries: entries, policy: .after(reload)))
    }
}

struct YearGlanceEntry: TimelineEntry {
    let date: Date
    let payload: SharedStore.WidgetPayload?
}

// MARK: - Theme

private let darkPaper = Color(red: 28 / 255, green: 25 / 255, blue: 22 / 255)
private let cypress = Color(red: 62 / 255, green: 79 / 255, blue: 69 / 255)
private let cypressLight = Color(red: 143 / 255, green: 165 / 255, blue: 150 / 255)

private func glancePalette(_ payload: SharedStore.WidgetPayload?,
                           hasArtwork: Bool,
                           scheme: ColorScheme) -> YearGlancePalette {
    guard let payload else {
        // No app theme yet: follow the system appearance.
        let ink = scheme == .dark ? paper : inkFallback
        return YearGlancePalette(
            ink: ink,
            muted: ink.opacity(0.62),
            accent: scheme == .dark ? cypressLight : cypress,
            keyline: ink.opacity(0.2),
            wash: nil
        )
    }
    let ink = colorFromHex(payload.themeText) ?? inkFallback
    return YearGlancePalette(
        ink: ink,
        muted: ink.opacity(0.62),
        accent: colorFromHex(payload.themePrimary) ?? ink,
        keyline: ink.opacity(0.2),
        wash: hasArtwork ? paper.opacity(0.42) : nil
    )
}

private struct YearGlanceBackdrop: View {
    let payload: SharedStore.WidgetPayload?
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        if payload == nil {
            scheme == .dark ? darkPaper : paper
        } else {
            AtelierBackdrop(payload: payload)
        }
    }
}

// MARK: - View

private struct YearAtAGlanceView: View {
    let entry: YearGlanceEntry
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        let hasArtwork = SharedStore.widgetBackgroundImage(for: entry.payload) != nil
        YearAtAGlanceContent(
            progress: YearProgress(date: entry.date),
            palette: glancePalette(entry.payload, hasArtwork: hasArtwork, scheme: scheme)
        )
        .yearGlanceChrome(entry.payload)
    }
}

private extension View {
    @ViewBuilder
    func yearGlanceChrome(_ payload: SharedStore.WidgetPayload?) -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(for: .widget) {
                YearGlanceBackdrop(payload: payload)
            }
        } else {
            self.padding(16).background(YearGlanceBackdrop(payload: payload))
        }
    }
}

struct YearAtAGlanceWidget: Widget {
    let kind = "YearAtAGlanceWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: YearGlanceProvider()) { entry in
            YearAtAGlanceView(entry: entry)
        }
        .configurationDisplayName("Year at a Glance")
        .description("Every day of the year, marked as it passes.")
        .supportedFamilies([.systemLarge])
    }
}
