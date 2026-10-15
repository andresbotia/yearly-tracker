import SwiftUI

// Year at a Glance layout. SwiftUI only (no WidgetKit / UIKit) so the layout
// can be rendered and checked at each large-widget size outside the extension.

struct YearGlancePalette {
    let ink: Color
    let muted: Color
    let accent: Color
    let keyline: Color
    let wash: Color?   // faint paper wash behind the dense grid on artwork
}

// Square cells, column count chosen to maximise cell size in the space given.
struct YearGlanceGrid: Equatable {
    let columns: Int
    let rows: Int
    let cell: CGFloat

    static func fit(count: Int, in size: CGSize) -> YearGlanceGrid {
        var best = YearGlanceGrid(columns: max(count, 1), rows: 1, cell: 0)
        guard count > 0, size.width > 0, size.height > 0 else { return best }
        for columns in 1...count {
            let rows = (count + columns - 1) / columns
            let cell = min(size.width / CGFloat(columns), size.height / CGFloat(rows))
            if cell > best.cell { best = YearGlanceGrid(columns: columns, rows: rows, cell: cell) }
        }
        return best
    }
}

private let monthInitials = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]

struct YearAtAGlanceContent: View {
    let progress: YearProgress
    let palette: YearGlancePalette

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            header
            YearGlanceCanvas(progress: progress, palette: palette)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .accessibilityHidden(true)
            MonthStrip(progress: progress, palette: palette)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            "\(progress.year). Every day counts. \(progress.dayOfYear) of \(progress.daysInYear) days, \(progress.percent) percent of the year."
        )
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(alignment: .firstTextBaseline) {
                Text(verbatim: String(progress.year))
                    .font(.system(size: 26, weight: .bold, design: .serif))
                    .foregroundColor(palette.ink)
                Spacer(minLength: 8)
                Text(verbatim: "\(progress.percent)%")
                    .font(.system(size: 18, weight: .bold, design: .serif))
                    .foregroundColor(palette.ink)
            }
            HStack(alignment: .firstTextBaseline) {
                Text("Every day counts.")
                    .font(.system(size: 12, weight: .regular, design: .serif).italic())
                    .foregroundColor(palette.muted)
                Spacer(minLength: 8)
                Text(verbatim: "\(progress.dayOfYear) / \(progress.daysInYear) DAYS")
                    .font(.system(size: 9, weight: .semibold, design: .monospaced))
                    .foregroundColor(palette.muted)
            }
            .lineLimit(1)
        }
    }
}

private struct YearGlanceCanvas: View {
    let progress: YearProgress
    let palette: YearGlancePalette

    var body: some View {
        Canvas { context, size in
            let count = progress.daysInYear
            let grid = YearGlanceGrid.fit(count: count, in: size)
            let cell = grid.cell
            let origin = CGPoint(
                x: (size.width - CGFloat(grid.columns) * cell) / 2,
                y: (size.height - CGFloat(grid.rows) * cell) / 2
            )

            if let wash = palette.wash {
                let area = CGRect(x: origin.x, y: origin.y,
                                  width: CGFloat(grid.columns) * cell,
                                  height: CGFloat(grid.rows) * cell)
                context.fill(Path(area.insetBy(dx: -3, dy: -3)), with: .color(wash))
            }

            let gap = max(1, cell * 0.14)
            let keylineWidth = max(0.5, cell * 0.05)
            let markWidth = max(1, cell * 0.095)
            var boxes = Path()
            var marks = Path()
            var todayBox = Path()
            var todayMark = Path()

            for index in 0..<count {
                let day = index + 1
                let box = CGRect(
                    x: origin.x + CGFloat(index % grid.columns) * cell,
                    y: origin.y + CGFloat(index / grid.columns) * cell,
                    width: cell, height: cell
                ).insetBy(dx: gap / 2, dy: gap / 2)

                if day == progress.dayOfYear {
                    todayBox.addRect(box)
                    addX(to: &todayMark, in: box)
                } else {
                    boxes.addRect(box)
                    if day < progress.dayOfYear { addX(to: &marks, in: box) }
                }
            }

            context.stroke(boxes, with: .color(palette.keyline), lineWidth: keylineWidth)
            context.stroke(marks, with: .color(palette.ink.opacity(0.82)),
                           style: StrokeStyle(lineWidth: markWidth, lineCap: .round))
            context.fill(todayBox, with: .color(palette.accent.opacity(0.16)))
            context.stroke(todayBox, with: .color(palette.accent), lineWidth: markWidth)
            context.stroke(todayMark, with: .color(palette.accent),
                           style: StrokeStyle(lineWidth: markWidth * 1.15, lineCap: .round))
        }
    }

    private func addX(to path: inout Path, in box: CGRect) {
        let r = box.insetBy(dx: box.width * 0.24, dy: box.height * 0.24)
        path.move(to: CGPoint(x: r.minX, y: r.minY))
        path.addLine(to: CGPoint(x: r.maxX, y: r.maxY))
        path.move(to: CGPoint(x: r.maxX, y: r.minY))
        path.addLine(to: CGPoint(x: r.minX, y: r.maxY))
    }
}

// January–December progression: complete, current (partial), future.
private struct MonthStrip: View {
    let progress: YearProgress
    let palette: YearGlancePalette

    var body: some View {
        HStack(spacing: 3) {
            ForEach(1...12, id: \.self) { m in
                VStack(spacing: 2) {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Rectangle().fill(palette.keyline)
                            Rectangle()
                                .fill(m == progress.month ? palette.accent : palette.ink.opacity(0.7))
                                .frame(width: geo.size.width * progress.monthFill(m))
                        }
                    }
                    .frame(height: 2)
                    Text(verbatim: monthInitials[m - 1])
                        .font(.system(size: 8, weight: m == progress.month ? .bold : .regular,
                                      design: .monospaced))
                        .foregroundColor(m <= progress.month ? palette.ink : palette.muted)
                }
                .frame(maxWidth: .infinity)
            }
        }
    }
}
