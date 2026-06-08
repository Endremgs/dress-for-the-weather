import WidgetKit
import CoreLocation
import SwiftUI

struct WidgetEntry: TimelineEntry {
    let date: Date
    let activity: ActivityType
    let durationMinutes: Int
    let result: RecommendationResult?
    let errorMessage: String?

    static let placeholder = WidgetEntry(
        date: .now,
        activity: .rusling,
        durationMinutes: 60,
        result: nil,
        errorMessage: nil
    )
}

struct KledningsProvider: AppIntentTimelineProvider {
    typealias Entry = WidgetEntry
    typealias Intent = ConfigurationAppIntent

    // Fixed Oslo coordinates for widget (no location access in widget context)
    private let defaultLat = 59.9139
    private let defaultLon = 10.7522

    func placeholder(in context: Context) -> WidgetEntry {
        .placeholder
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> WidgetEntry {
        await fetchEntry(configuration: configuration)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<WidgetEntry> {
        let entry = await fetchEntry(configuration: configuration)
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }

    private func fetchEntry(configuration: ConfigurationAppIntent) async -> WidgetEntry {
        do {
            let result = try await APIService.shared.fetchRecommendation(
                lat: defaultLat, lon: defaultLon,
                activity: configuration.activity,
                durationMinutes: configuration.durationMinutes
            )
            return WidgetEntry(
                date: .now,
                activity: configuration.activity,
                durationMinutes: configuration.durationMinutes,
                result: result,
                errorMessage: nil
            )
        } catch {
            return WidgetEntry(
                date: .now,
                activity: configuration.activity,
                durationMinutes: configuration.durationMinutes,
                result: nil,
                errorMessage: error.localizedDescription
            )
        }
    }
}
