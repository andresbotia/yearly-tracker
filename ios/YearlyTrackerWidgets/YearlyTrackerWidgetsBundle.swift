import WidgetKit
import SwiftUI

@main
struct YearlyTrackerWidgetsBundle: WidgetBundle {
    var body: some Widget {
        YearlyProgressWidget()
        HabitsWidget()
        HighlightGoalWidget()
        GoalsListWidget()
    }
}
