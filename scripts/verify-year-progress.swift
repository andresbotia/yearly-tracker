// Year at a Glance widget checks: calendar math, midnight scheduling, grid fit.
// Compiles the real widget sources on macOS; no simulator needed.
//
//   swiftc -parse-as-library -o /tmp/verify-year-progress \
//     ios/YearlyTrackerWidgets/YearProgress.swift \
//     ios/YearlyTrackerWidgets/YearAtAGlanceContent.swift \
//     scripts/verify-year-progress.swift && /tmp/verify-year-progress

import Foundation
import CoreGraphics

private var failures: [String] = []
private var checks = 0

private func expect(_ condition: @autoclosure () -> Bool, _ message: String) {
    checks += 1
    if !condition() { failures.append(message) }
}

private func tz(_ id: String) -> TimeZone { TimeZone(identifier: id)! }

private func date(_ y: Int, _ m: Int, _ d: Int, _ h: Int = 12, _ min: Int = 0, _ s: Int = 0,
                  in zone: TimeZone) -> Date {
    YearProgress.calendar(timeZone: zone)
        .date(from: DateComponents(year: y, month: m, day: d, hour: h, minute: min, second: s))!
}

private func progress(_ y: Int, _ m: Int, _ d: Int, _ h: Int = 12, _ min: Int = 0,
                      zone: TimeZone = tz("America/New_York")) -> YearProgress {
    YearProgress(date: date(y, m, d, h, min, in: zone), calendar: YearProgress.calendar(timeZone: zone))
}

private func expectDay(_ p: YearProgress, _ day: Int, of total: Int, year: Int, _ label: String) {
    expect(p.year == year, "\(label): year \(p.year) != \(year)")
    expect(p.dayOfYear == day, "\(label): day \(p.dayOfYear) != \(day)")
    expect(p.daysInYear == total, "\(label): total \(p.daysInYear) != \(total)")
}

@main
struct VerifyYearProgress {
    static func main() {
        dayCounts()
        rollover()
        timeZones()
        daylightSaving()
        scheduling()
        gridFit()

        if failures.isEmpty {
            print("Year at a Glance checks passed (\(checks) assertions): day counts, leap years, rollover, time zones, DST, midnight scheduling, grid fit.")
        } else {
            failures.forEach { print("FAIL: \($0)") }
            exit(1)
        }
    }

    static func dayCounts() {
        expectDay(progress(2026, 1, 1, 0, 0), 1, of: 365, year: 2026, "Jan 1 at 00:00")
        expectDay(progress(2026, 1, 1, 23, 59), 1, of: 365, year: 2026, "Jan 1 at 23:59")
        expectDay(progress(2026, 1, 2), 2, of: 365, year: 2026, "Jan 2")
        expectDay(progress(2026, 1, 10), 10, of: 365, year: 2026, "Jan 10")
        expectDay(progress(2026, 2, 1), 32, of: 365, year: 2026, "Feb 1")
        expectDay(progress(2026, 2, 28), 59, of: 365, year: 2026, "Feb 28 (non-leap)")
        expectDay(progress(2026, 3, 1), 60, of: 365, year: 2026, "Mar 1 (non-leap)")
        expectDay(progress(2026, 10, 14), 287, of: 365, year: 2026, "Oct 14 2026")
        expectDay(progress(2026, 12, 31, 23, 59), 365, of: 365, year: 2026, "Dec 31 (non-leap)")

        expectDay(progress(2028, 2, 28), 59, of: 366, year: 2028, "Feb 28 (leap)")
        expectDay(progress(2028, 2, 29), 60, of: 366, year: 2028, "Feb 29 (leap)")
        expectDay(progress(2028, 3, 1), 61, of: 366, year: 2028, "Mar 1 (leap)")
        expectDay(progress(2028, 12, 31), 366, of: 366, year: 2028, "Dec 31 (leap)")

        // Century rules: 2100 is not a leap year, 2000 was.
        expect(progress(2100, 6, 1).daysInYear == 365, "2100 should have 365 days")
        expect(progress(2000, 6, 1).daysInYear == 366, "2000 should have 366 days")

        expect(progress(2026, 1, 1).percent == 0, "Jan 1 percent should floor to 0")
        expect(progress(2026, 12, 30).percent == 99, "Dec 30 percent should be 99")
        expect(progress(2026, 12, 31).percent == 100, "Dec 31 percent should be 100")
        expect(progress(2028, 12, 31).percent == 100, "Leap Dec 31 percent should be 100")
        expect(progress(2026, 10, 14).percent == 78, "Oct 14 2026 percent should be 78")

        let p = progress(2028, 2, 10)
        expect(p.monthLengths == [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], "Leap month lengths")
        expect(progress(2026, 2, 10).monthLengths[1] == 28, "Non-leap February length")
        expect(p.monthFill(1) == 1, "January complete in February")
        expect(abs(p.monthFill(2) - 10.0 / 29.0) < 1e-9, "February partially complete")
        expect(p.monthFill(3) == 0, "March not started in February")
        expect(p.monthLengths.reduce(0, +) == p.daysInYear, "Month lengths sum to year length")
    }

    static func rollover() {
        let zone = tz("Europe/London")
        let cal = YearProgress.calendar(timeZone: zone)
        let lastSecond = date(2026, 12, 31, 23, 59, 59, in: zone)
        let next = YearProgress.nextDayStart(after: lastSecond, calendar: cal)
        expect(next == date(2027, 1, 1, 0, 0, 0, in: zone), "Next day start after Dec 31 is Jan 1 00:00")
        expectDay(YearProgress(date: next, calendar: cal), 1, of: 365, year: 2027, "Rollover entry")

        // 2027 -> 2028 rollover lands in a leap year.
        let into2028 = YearProgress.nextDayStart(after: date(2027, 12, 31, 20, in: zone), calendar: cal)
        expectDay(YearProgress(date: into2028, calendar: cal), 1, of: 366, year: 2028, "Rollover into leap year")

        // The scheduled timeline crosses the year without the app running.
        let entries = YearProgress.timelineDates(from: date(2026, 12, 31, 22, in: zone), calendar: cal)
        let years = Set(entries.map { YearProgress(date: $0, calendar: cal).year })
        expect(years == [2026, 2027], "Timeline from Dec 31 covers both years")
        expect(entries.contains(date(2027, 1, 1, 0, 0, 0, in: zone)), "Timeline includes New Year midnight")
    }

    static func timeZones() {
        // One instant, three local calendars.
        let instant = date(2026, 12, 31, 23, 30, in: tz("UTC"))
        let utc = YearProgress(date: instant, calendar: YearProgress.calendar(timeZone: tz("UTC")))
        let tokyo = YearProgress(date: instant, calendar: YearProgress.calendar(timeZone: tz("Asia/Tokyo")))
        let la = YearProgress(date: instant, calendar: YearProgress.calendar(timeZone: tz("America/Los_Angeles")))
        expectDay(utc, 365, of: 365, year: 2026, "UTC Dec 31")
        expectDay(tokyo, 1, of: 365, year: 2027, "Tokyo already Jan 1")
        expectDay(la, 365, of: 365, year: 2026, "Los Angeles still Dec 31")

        // Half-hour and 45-minute offsets still get an exact local midnight entry.
        for id in ["Asia/Kolkata", "Asia/Kathmandu", "Australia/Adelaide", "Pacific/Chatham"] {
            let zone = tz(id)
            let cal = YearProgress.calendar(timeZone: zone)
            let entries = YearProgress.timelineDates(from: date(2026, 6, 10, 15, 10, in: zone), calendar: cal)
            expect(entries.contains(date(2026, 6, 11, 0, 0, 0, in: zone)), "\(id): local midnight scheduled")
        }

        // Travelling east: a timeline built in New York ends on New York day
        // starts; the reload WidgetKit performs after the first one is built in
        // the new zone and lands exactly on Tokyo's next midnight.
        let ny = tz("America/New_York")
        let tokyoZone = tz("Asia/Tokyo")
        let tokyoCal = YearProgress.calendar(timeZone: tokyoZone)
        let reloadAt = date(2026, 3, 21, 0, 0, 0, in: ny)
        let rebuilt = YearProgress.timelineDates(from: reloadAt, calendar: tokyoCal)
        expectDay(YearProgress(date: rebuilt[0], calendar: tokyoCal), 80, of: 365, year: 2026, "Tokyo at reload")
        expect(rebuilt[1] == date(2026, 3, 22, 0, 0, 0, in: tokyoZone), "Rebuilt timeline uses Tokyo midnight")
        expectDay(YearProgress(date: rebuilt[1], calendar: tokyoCal), 81, of: 365, year: 2026, "Tokyo next day")
    }

    static func daylightSaving() {
        let ny = tz("America/New_York")
        let nyCal = YearProgress.calendar(timeZone: ny)
        // Spring forward 2026-03-08 (23h day) and fall back 2026-11-01 (25h day).
        let spring = YearProgress.nextDayStart(after: date(2026, 3, 8, 0, 0, 0, in: ny), calendar: nyCal)
        expect(spring == date(2026, 3, 9, 0, 0, 0, in: ny), "Spring-forward next midnight")
        expect(spring.timeIntervalSince(date(2026, 3, 8, 0, 0, 0, in: ny)) == 23 * 3600, "Spring-forward day is 23h")
        let fall = YearProgress.nextDayStart(after: date(2026, 11, 1, 0, 0, 0, in: ny), calendar: nyCal)
        expect(fall == date(2026, 11, 2, 0, 0, 0, in: ny), "Fall-back next midnight")
        expect(fall.timeIntervalSince(date(2026, 11, 1, 0, 0, 0, in: ny)) == 25 * 3600, "Fall-back day is 25h")
        expectDay(YearProgress(date: date(2026, 3, 8, 3, 30, in: ny), calendar: nyCal), 67, of: 365, year: 2026, "Day after skipped hour")

        // Santiago skips midnight itself (00:00 -> 01:00 on 2026-09-06).
        let scl = tz("America/Santiago")
        let sclCal = YearProgress.calendar(timeZone: scl)
        let skipped = YearProgress.nextDayStart(after: date(2026, 9, 5, 12, in: scl), calendar: sclCal)
        let sclDay = YearProgress(date: skipped, calendar: sclCal)
        expect(sclDay.month == 9 && sclDay.dayOfMonth == 6, "Santiago: next day start is Sept 6")
        expect(skipped.timeIntervalSince(date(2026, 9, 5, 12, in: scl)) <= 12 * 3600, "Santiago: no extra day skipped")
        let sclEntries = YearProgress.timelineDates(from: date(2026, 9, 5, 12, in: scl), calendar: sclCal)
        expect(sclEntries.contains(skipped), "Santiago: skipped-midnight day start scheduled")
    }

    static func scheduling() {
        let zone = tz("America/New_York")
        let cal = YearProgress.calendar(timeZone: zone)
        let now = date(2026, 10, 14, 21, 47, 13, in: zone)
        let entries = YearProgress.timelineDates(from: now, calendar: cal)

        expect(entries == [now,
                           date(2026, 10, 15, 0, 0, 0, in: zone),
                           date(2026, 10, 16, 0, 0, 0, in: zone)],
               "Timeline is now plus the next two local midnights")
        expect(YearProgress.nextDayStart(after: now, calendar: cal) == entries[1],
               "Reload is requested at the first midnight entry")
        expect(YearProgress.timelineDates(from: now, days: 0, calendar: cal).count == 2,
               "At least one day start is always scheduled")

        let beforeMidnight = YearProgress(date: date(2026, 10, 14, 23, 59, 59, in: zone), calendar: cal)
        let atMidnight = YearProgress(date: date(2026, 10, 15, 0, 0, 0, in: zone), calendar: cal)
        expect(atMidnight.dayOfYear == beforeMidnight.dayOfYear + 1, "Midnight entry advances one day")

        let fromMidnight = YearProgress.nextDayStart(after: date(2026, 10, 15, 0, 0, 0, in: zone), calendar: cal)
        expect(fromMidnight == date(2026, 10, 16, 0, 0, 0, in: zone), "Next day start from exactly midnight")
    }

    static func gridFit() {
        // Large widget sizes (pt) minus default 16pt content margins.
        let sizes: [(String, CGFloat, CGFloat)] = [
            ("320pt iPhone", 292, 311), ("375pt iPhone 7/8/SE", 321, 324),
            ("375pt iPhone X/mini", 329, 345), ("390-402pt iPhone", 338, 354),
            ("414pt iPhone Plus/Max", 360, 379), ("428-440pt iPhone Pro Max", 364, 382),
        ]
        // Grid share after header (~44), month strip (~14) and spacing (16).
        for (name, w, h) in sizes {
            let area = CGSize(width: w - 32, height: h - 32 - 74)
            for count in [365, 366] {
                let g = YearGlanceGrid.fit(count: count, in: area)
                expect(g.columns * g.rows >= count, "\(name) \(count): every cell has a slot")
                expect(CGFloat(g.columns) * g.cell <= area.width + 0.001, "\(name) \(count): fits width")
                expect(CGFloat(g.rows) * g.cell <= area.height + 0.001, "\(name) \(count): fits height")
                expect(g.cell >= 10, "\(name) \(count): cell \(g.cell)pt too small to read")
            }
        }
        expect(YearGlanceGrid.fit(count: 366, in: .zero).cell == 0, "Zero size does not crash")
    }
}
