import WidgetKit
import SwiftUI
import Foundation
import UIKit

// MARK: - Timeline

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> Entry {
        Entry(date: Date(), payload: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
        completion(Entry(date: Date(), payload: SharedStore.loadPayload()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        let entry = Entry(date: Date(), payload: SharedStore.loadPayload())
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date())
            ?? Date().addingTimeInterval(1800)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

struct Entry: TimelineEntry {
    let date: Date
    let payload: SharedStore.WidgetPayload?
}

// MARK: - Color / type helpers

private let paper = Color(red: 246 / 255, green: 243 / 255, blue: 236 / 255)
private let inkFallback = Color(red: 28 / 255, green: 25 / 255, blue: 22 / 255)

private func clamp01(_ x: Double) -> Double { max(0.0, min(1.0, x)) }

private func colorFromHex(_ hex: String?, opacity: Double = 1.0) -> Color? {
    guard var h = hex?.trimmingCharacters(in: .whitespacesAndNewlines), !h.isEmpty else { return nil }
    if h.hasPrefix("#") { h.removeFirst() }
    guard h.count == 6, let n = UInt32(h, radix: 16) else { return nil }
    let r = Double((n >> 16) & 0xFF) / 255.0
    let g = Double((n >> 8) & 0xFF) / 255.0
    let b = Double(n & 0xFF) / 255.0
    return Color(red: r, green: g, blue: b, opacity: opacity)
}

private func inkColor(_ payload: SharedStore.WidgetPayload?) -> Color {
    colorFromHex(payload?.themeText) ?? inkFallback
}

private func mutedInk(_ payload: SharedStore.WidgetPayload?) -> Color {
    colorFromHex(payload?.themeText, opacity: 0.62)
        ?? Color(red: 28 / 255, green: 25 / 255, blue: 22 / 255, opacity: 0.62)
}

private func atelierAccentColor(_ payload: SharedStore.WidgetPayload?) -> Color {
    colorFromHex(payload?.themePrimary) ?? inkColor(payload)
}

private func paletteColor(_ payload: SharedStore.WidgetPayload?) -> Color {
    if let c = colorFromHex(payload?.themeBg) { return c }
    if let c = colorFromHex(payload?.themePrimary, opacity: 0.18) { return c }
    return paper
}

private func payloadYear(_ payload: SharedStore.WidgetPayload?) -> Int {
    if let y = payload?.year, y > 0 { return y }
    return Calendar.current.component(.year, from: Date())
}

private func pctLabel(_ x: Double) -> String {
    String(format: "%02d%%", Int((clamp01(x) * 100).rounded()))
}

private func asciiBar(_ x: Double, width: Int = 20) -> String {
    let filled = Int((clamp01(x) * Double(width)).rounded())
    let plus = String(repeating: "+", count: max(0, filled))
    let dots = String(repeating: ".", count: max(0, width - filled))
    return plus + dots
}

private func habitStateSymbol(_ state: Int) -> String {
    switch state {
    case 1: return "+"
    case 2: return "×"
    default: return "."
    }
}

private func kickerFont() -> Font {
    .system(size: 10, weight: .semibold, design: .monospaced)
}

private struct AtelierMark: View {
    var size: CGFloat = 24

    var body: some View {
        Image(size <= 16 ? "AtelierMark16" : "AtelierMark24")
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}

private struct AtelierKicker: View {
    let suffix: String
    let payload: SharedStore.WidgetPayload?

    var body: some View {
        HStack(spacing: 6) {
            AtelierMark(size: 24)
            Text(suffix)
                .font(kickerFont())
                .foregroundColor(mutedInk(payload))
            Spacer(minLength: 0)
        }
    }
}

private func displayFont(_ size: CGFloat) -> Font {
    .system(size: size, weight: .bold, design: .serif)
}

private func dataFont(_ size: CGFloat) -> Font {
    .system(size: size, weight: .regular, design: .monospaced)
}

// MARK: - Backdrop (art + paper veil, or solid palette)

private struct AtelierBackdrop: View {
    let payload: SharedStore.WidgetPayload?

    var body: some View {
        ZStack {
            if let img = SharedStore.widgetBackgroundImage(for: payload) {
                GeometryReader { geo in
                    Image(uiImage: img)
                        .resizable()
                        .scaledToFill()
                        .frame(width: geo.size.width, height: geo.size.height)
                        .clipped()
                }
                paper.opacity(0.58)
            } else {
                paletteColor(payload)
            }
        }
    }
}

private extension View {
    @ViewBuilder
    func atelierWidgetChrome(_ payload: SharedStore.WidgetPayload?) -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(for: .widget) {
                AtelierBackdrop(payload: payload)
            }
        } else {
            self.background(AtelierBackdrop(payload: payload))
        }
    }
}

private struct EmptyStateView: View {
    let title: String
    let payload: SharedStore.WidgetPayload?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            AtelierMark(size: 16)
            Text(title)
                .font(displayFont(16))
                .foregroundColor(inkColor(payload))
            Text("Open Yearly Tracker to refresh")
                .font(dataFont(11))
                .foregroundColor(mutedInk(payload))
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

// MARK: - 1) Yearly Progress

private struct YearlyProgressView: View {
    let entry: Entry

    var body: some View {
        let payload = entry.payload
        let year = payloadYear(payload)
        let pct = clamp01(payload?.yearlyProgress ?? 0)

        VStack(alignment: .leading, spacing: 8) {
            AtelierKicker(suffix: "/ \(year)", payload: payload)

            Text("\(year) PROGRESS")
                .font(kickerFont())
                .foregroundColor(inkColor(payload))

            if payload == nil {
                Text("Open Yearly Tracker to refresh")
                    .font(dataFont(11))
                    .foregroundColor(mutedInk(payload))
            } else {
                Text(pctLabel(pct))
                    .font(displayFont(28))
                    .foregroundColor(inkColor(payload))

                Text(asciiBar(pct, width: 22))
                    .font(dataFont(11))
                    .foregroundColor(atelierAccentColor(payload))
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
            }

            Spacer(minLength: 0)
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct YearlyProgressWidget: Widget {
    let kind = "YearlyProgressWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            YearlyProgressView(entry: entry)
                .atelierWidgetChrome(entry.payload)
        }
        .configurationDisplayName("Yearly Progress")
        .description("Overall yearly goal progress.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - 2) Yearly Habits

private struct HabitsView: View {
    let entry: Entry
    @Environment(\.widgetFamily) private var family

    var body: some View {
        guard let payload = entry.payload else {
            return AnyView(EmptyStateView(title: "Habits", payload: nil))
        }

        let limit: Int = (family == .systemLarge) ? 10 : 6
        let habits = Array(payload.habits.prefix(limit))

        return AnyView(
            VStack(alignment: .leading, spacing: 8) {
                AtelierKicker(suffix: "/ TODAY", payload: payload)

                Text("HABITS")
                    .font(kickerFont())
                    .foregroundColor(inkColor(payload))

                if habits.isEmpty {
                    Text("No habits yet")
                        .font(dataFont(12))
                        .foregroundColor(mutedInk(payload))
                } else {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(habits, id: \.id) { h in
                            HStack(alignment: .firstTextBaseline, spacing: 8) {
                                Text(h.title)
                                    .font(dataFont(13))
                                    .foregroundColor(inkColor(payload))
                                    .lineLimit(1)
                                Spacer(minLength: 4)
                                Text(habitStateSymbol(h.todayState))
                                    .font(dataFont(13))
                                    .foregroundColor(
                                        h.todayState == 0
                                            ? mutedInk(payload)
                                            : inkColor(payload)
                                    )
                            }
                        }
                    }
                }

                Spacer(minLength: 0)
            }
            .padding(12)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        )
    }
}

struct HabitsWidget: Widget {
    let kind = "HabitsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HabitsView(entry: entry)
                .atelierWidgetChrome(entry.payload)
        }
        .configurationDisplayName("Yearly Habits")
        .description("Today’s habit marks.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - 3) Goal Highlight

private struct HighlightGoalView: View {
    let entry: Entry

    var body: some View {
        guard let payload = entry.payload else {
            return AnyView(EmptyStateView(title: "Goal", payload: nil))
        }

        let inProgress = payload.goals.filter { $0.percent < 1.0 }
        let topInProgress = inProgress.sorted { $0.percent > $1.percent }.first
        let topOverall = payload.goals.sorted { $0.percent > $1.percent }.first
        let top = topInProgress ?? topOverall

        guard let g = top else {
            return AnyView(EmptyStateView(title: "Goal", payload: payload))
        }

        let pct = clamp01(g.percent)

        return AnyView(
            VStack(alignment: .leading, spacing: 8) {
                AtelierKicker(suffix: "/ GOAL", payload: payload)

                Text(g.title)
                    .font(displayFont(15))
                    .foregroundColor(inkColor(payload))
                    .lineLimit(2)

                Text(pctLabel(pct))
                    .font(displayFont(26))
                    .foregroundColor(inkColor(payload))

                Text(asciiBar(pct, width: 22))
                    .font(dataFont(11))
                    .foregroundColor(atelierAccentColor(payload))
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)

                Spacer(minLength: 0)
            }
            .padding(12)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        )
    }
}

struct HighlightGoalWidget: Widget {
    let kind = "HighlightGoalWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HighlightGoalView(entry: entry)
                .atelierWidgetChrome(entry.payload)
        }
        .configurationDisplayName("Goal Highlight")
        .description("Highlights your top in-progress goal.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - 4) Yearly Goals

private struct GoalsListView: View {
    let entry: Entry
    @Environment(\.widgetFamily) private var family

    var body: some View {
        guard let payload = entry.payload else {
            return AnyView(EmptyStateView(title: "Goals", payload: nil))
        }

        let limit: Int = (family == .systemLarge) ? 6 : 4
        let goals = Array(payload.goals.prefix(limit))

        return AnyView(
            VStack(alignment: .leading, spacing: 8) {
                AtelierKicker(suffix: "/ GOALS", payload: payload)

                if goals.isEmpty {
                    Text("No goals yet")
                        .font(dataFont(12))
                        .foregroundColor(mutedInk(payload))
                } else {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(Array(goals.enumerated()), id: \.element.id) { index, g in
                            let pct = clamp01(g.percent)
                            HStack(alignment: .firstTextBaseline, spacing: 8) {
                                Text("\(String(format: "%02d", index + 1))  \(g.title)")
                                    .font(dataFont(12))
                                    .foregroundColor(inkColor(payload))
                                    .lineLimit(1)
                                Spacer(minLength: 4)
                                Text(pctLabel(pct))
                                    .font(dataFont(12))
                                    .foregroundColor(mutedInk(payload))
                            }
                        }
                    }
                }

                Spacer(minLength: 0)
            }
            .padding(12)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        )
    }
}

struct GoalsListWidget: Widget {
    let kind = "GoalsListWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            GoalsListView(entry: entry)
                .atelierWidgetChrome(entry.payload)
        }
        .configurationDisplayName("Yearly Goals")
        .description("Your goals and progress.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - Previews
