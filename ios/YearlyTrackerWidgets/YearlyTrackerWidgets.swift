import WidgetKit
import SwiftUI
import Foundation

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

        // Refresh every 30 minutes
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date())
            ?? Date().addingTimeInterval(1800)

        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

struct Entry: TimelineEntry {
    let date: Date
    let payload: SharedStore.WidgetPayload?
}

// MARK: - Helpers

private func clamp01(_ x: Double) -> Double { max(0.0, min(1.0, x)) }

private func colorFromHex(_ hex: String?) -> Color? {
    guard var h = hex?.trimmingCharacters(in: .whitespacesAndNewlines), !h.isEmpty else { return nil }
    if h.hasPrefix("#") { h.removeFirst() }
    guard h.count == 6, let n = UInt32(h, radix: 16) else { return nil }
    let r = Double((n >> 16) & 0xFF) / 255.0
    let g = Double((n >> 8) & 0xFF) / 255.0
    let b = Double(n & 0xFF) / 255.0
    return Color(red: r, green: g, blue: b)
}

private func themeContainerColor(_ payload: SharedStore.WidgetPayload?) -> Color {
    if let c = colorFromHex(payload?.themeBg) ?? colorFromHex(payload?.themePrimary) {
        return c.opacity(0.28)
    }
    switch (payload?.theme ?? "").lowercased() {
    case "ocean", "oceanblue", "blue":
        return Color(red: 0.00, green: 0.55, blue: 0.85).opacity(0.22)
    case "dark":
        return Color.black.opacity(0.25)
    case "light":
        return Color.white.opacity(0.18)
    default:
        return Color(red: 0.10, green: 0.10, blue: 0.12).opacity(0.12)
    }
}

private func themeLegacyBackground(_ payload: SharedStore.WidgetPayload?) -> Color {
    themeContainerColor(payload)
}


private struct EmptyStateView: View {
    let title: String

    var body: some View {
        let raw = SharedStore.loadRawData()
        let bytes = raw?.count ?? 0
        let hasKey = raw != nil

        return VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.headline)

            if !hasKey {
                Text("No data found in App Group")
                    .font(.caption)
                Text("Likely App Groups entitlement mismatch")
                    .font(.caption2)
                    .opacity(0.7)
            } else {
                Text("Found raw data (\(bytes) bytes)")
                    .font(.caption)
                Text("Decode failed → payload shape mismatch")
                    .font(.caption2)
                    .opacity(0.7)
            }

            Text("Open the app and toggle a habit")
                .font(.caption2)
                .opacity(0.7)
        }
        .padding()
    }
}


private struct HabitStateDot: View {
    let state: Int

    var body: some View {
        Circle()
            .frame(width: 10, height: 10)
            .opacity(state == 0 ? 0.25 : 1.0)
    }
}

private func habitStateSymbol(_ state: Int) -> String {
    switch state {
    case 1: return "+"
    case 2: return "×"
    default: return "."
    }
}

// MARK: - 1) Yearly Progress Widget

private struct YearlyProgressView: View {
    let entry: Entry

    var body: some View {
        guard let payload = entry.payload else {
            return AnyView(EmptyStateView(title: "Atelier Tracker Progress"))
        }

        let pct = clamp01(payload.yearlyProgress)

        return AnyView(
            VStack(alignment: .leading, spacing: 10) {
                Text("Atelier Tracker Progress")
                    .font(.headline)

                Text("\(Int(round(pct * 100)))%")
                    .font(.system(size: 28, weight: .bold))

                ProgressView(value: pct)
            }
            .padding()
        )
    }
}

struct YearlyProgressWidget: Widget {
    let kind = "YearlyProgressWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                YearlyProgressView(entry: entry)
                    .containerBackground(themeContainerColor(entry.payload), for: .widget)
            } else {
                YearlyProgressView(entry: entry)
                    .padding()
                    .background(themeLegacyBackground(entry.payload))
            }
        }
        .configurationDisplayName("Yearly Progress")
        .description("Shows your overall yearly goal progress.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - 2) Habits Widget (BIG)

private struct HabitsView: View {
    let entry: Entry

    @Environment(\.widgetFamily) private var family

    var body: some View {
        guard let payload = entry.payload else {
            return AnyView(EmptyStateView(title: "Habits"))
        }

        // More habits for large widget
        let limit: Int = (family == .systemLarge) ? 10 : 6
        let habits = Array(payload.habits.prefix(limit))

        return AnyView(
            VStack(alignment: .leading, spacing: 10) {
                Text("Habits Today")
                    .font(.headline)

                if habits.isEmpty {
                    Text("No habits yet")
                        .font(.caption)
                        .opacity(0.7)
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(habits, id: \.id) { h in
                            HStack(spacing: 8) {
                                HabitStateDot(state: h.todayState)

                                Text(h.title)
                                    .font(.system(size: 14, weight: .semibold))
                                    .lineLimit(1)

                                Spacer()

                                Text(habitStateSymbol(h.todayState))
                                    .font(.system(size: 14, weight: .bold))
                                    .opacity(h.todayState == 0 ? 0.55 : 1.0)
                            }
                        }
                    }
                }

                Spacer(minLength: 0)
            }
            .padding()
        )
    }
}

struct HabitsWidget: Widget {
    let kind = "HabitsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                HabitsView(entry: entry)
                    .containerBackground(themeContainerColor(entry.payload), for: .widget)
            } else {
                HabitsView(entry: entry)
                    .padding()
                    .background(themeLegacyBackground(entry.payload))
            }
        }
        .configurationDisplayName("Habits")
        .description("Shows today’s habit states.")
        .supportedFamilies([.systemMedium, .systemLarge]) // ✅ BIG habits widget
    }
}

// MARK: - 3) Highlight Goal Widget

private struct HighlightGoalView: View {
    let entry: Entry

    var body: some View {
        guard let payload = entry.payload else {
            return AnyView(EmptyStateView(title: "Goal Highlight"))
        }

        let inProgress = payload.goals.filter { $0.percent < 1.0 }

        let topInProgress = inProgress.sorted { $0.percent > $1.percent }.first
        let topOverall = payload.goals.sorted { $0.percent > $1.percent }.first
        let top = topInProgress ?? topOverall

        guard let g = top else {
            return AnyView(EmptyStateView(title: "Goal Highlight"))
        }

        let pct = clamp01(g.percent)

        return AnyView(
            VStack(alignment: .leading, spacing: 10) {
                Text("Goal Highlight")
                    .font(.headline)

                Text(g.title)
                    .font(.system(size: 14, weight: .semibold))
                    .lineLimit(2)

                Text("\(Int(round(pct * 100)))%")
                    .font(.system(size: 26, weight: .bold))

                ProgressView(value: pct)
            }
            .padding()
        )
    }
}

struct HighlightGoalWidget: Widget {
    let kind = "HighlightGoalWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                HighlightGoalView(entry: entry)
                    .containerBackground(themeContainerColor(entry.payload), for: .widget)
            } else {
                HighlightGoalView(entry: entry)
                    .padding()
                    .background(themeLegacyBackground(entry.payload))
            }
        }
        .configurationDisplayName("Goal Highlight")
        .description("Highlights your top goal.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - 4) Goals List Widget (no “All Goals” header)

private struct GoalsListView: View {
    let entry: Entry

    @Environment(\.widgetFamily) private var family

    var body: some View {
        guard let payload = entry.payload else {
            return AnyView(EmptyStateView(title: "Goals"))
        }

        let limit: Int = (family == .systemLarge) ? 6 : 4
        let goals = Array(payload.goals.prefix(limit))

        return AnyView(
            VStack(alignment: .leading, spacing: 10) {
                if goals.isEmpty {
                    Text("No goals yet")
                        .font(.headline)
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(goals, id: \.id) { g in
                            let pct = clamp01(g.percent)

                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Text(g.title)
                                        .font(.system(size: 13, weight: .semibold))
                                        .lineLimit(1)

                                    Spacer()

                                    Text("\(Int(round(pct * 100)))%")
                                        .font(.caption)
                                        .opacity(0.7)
                                }

                                ProgressView(value: pct)
                            }
                        }
                    }
                }

                Spacer(minLength: 0)
            }
            .padding()
        )
    }
}

struct GoalsListWidget: Widget {
    let kind = "GoalsListWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                GoalsListView(entry: entry)
                    .containerBackground(themeContainerColor(entry.payload), for: .widget)
            } else {
                GoalsListView(entry: entry)
                    .padding()
                    .background(themeLegacyBackground(entry.payload))
            }
        }
        .configurationDisplayName("Goals List")
        .description("Shows your goals and progress.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - Previews

