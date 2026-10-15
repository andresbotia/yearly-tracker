import Foundation

// Calendar math for the Year at a Glance widget. Pure Foundation so it can be
// verified outside Xcode: scripts/verify-year-progress.swift.
//
// The year is always the Gregorian civil year (the app tracks Gregorian years)
// evaluated in the device's current time zone. It never reads app data.
struct YearProgress: Equatable {
    let year: Int
    let dayOfYear: Int    // 1-based; today counts as elapsed
    let daysInYear: Int   // 365 or 366
    let monthLengths: [Int]
    let month: Int        // 1-based current month
    let dayOfMonth: Int

    var fraction: Double { Double(dayOfYear) / Double(daysInYear) }

    // Floor, so 100% appears only on the last day of the year.
    var percent: Int { (dayOfYear * 100) / daysInYear }

    static func calendar(timeZone: TimeZone = .current) -> Calendar {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        cal.locale = Locale(identifier: "en_US_POSIX")
        return cal
    }

    init(date: Date, calendar: Calendar = YearProgress.calendar()) {
        let parts = calendar.dateComponents([.year, .month, .day], from: date)
        let year = parts.year ?? 1970
        self.year = year
        month = parts.month ?? 1
        dayOfMonth = parts.day ?? 1
        dayOfYear = calendar.ordinality(of: .day, in: .year, for: date) ?? 1
        daysInYear = calendar.range(of: .day, in: .year, for: date)?.count ?? 365

        monthLengths = (1...12).map { m in
            let first = calendar.date(from: DateComponents(year: year, month: m, day: 1)) ?? date
            return calendar.range(of: .day, in: .month, for: first)?.count ?? 30
        }
    }

    // How much of a month (1...12) has elapsed, counting today as elapsed.
    func monthFill(_ m: Int) -> Double {
        if m < month { return 1 }
        if m > month { return 0 }
        return Double(dayOfMonth) / Double(monthLengths[m - 1])
    }

    // Start of the next local day. DST-safe: uses the day interval rather than
    // adding 24 hours, and survives zones where midnight itself is skipped.
    static func nextDayStart(after date: Date, calendar: Calendar = YearProgress.calendar()) -> Date {
        if let end = calendar.dateInterval(of: .day, for: date)?.end, end > date { return end }
        return calendar.date(byAdding: .day, value: 1, to: calendar.startOfDay(for: date))
            ?? date.addingTimeInterval(86_400)
    }

    // Timeline dates: now plus the next `days` local day starts. The widget
    // asks WidgetKit to reload after the first day start, so each day's
    // timeline is rebuilt in the device's then-current time zone. The extra
    // day start keeps the widget correct if WidgetKit delays that reload.
    static func timelineDates(from now: Date, days: Int = 2,
                              calendar: Calendar = YearProgress.calendar()) -> [Date] {
        var dates = [now]
        for _ in 0..<max(days, 1) {
            dates.append(nextDayStart(after: dates[dates.count - 1], calendar: calendar))
        }
        return dates
    }
}
