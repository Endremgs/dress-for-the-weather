import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Widget configuration intent

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Kledningsapp"
    static var description = IntentDescription("Vis kledningsanbefaling for valgt aktivitet")

    @Parameter(title: "Aktivitet", default: .rusling)
    var activity: ActivityType

    @Parameter(title: "Varighet (minutter)", default: 60)
    var durationMinutes: Int
}

extension ActivityType: AppEnum {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Aktivitet"
    static var caseDisplayRepresentations: [ActivityType: DisplayRepresentation] = [
        .rusling:  DisplayRepresentation(title: "Rusling",  image: .init(systemName: "figure.walk")),
        .løping:   DisplayRepresentation(title: "Løping",   image: .init(systemName: "figure.run")),
        .sykling:  DisplayRepresentation(title: "Sykling",  image: .init(systemName: "figure.outdoor.cycle")),
        .fjelltur: DisplayRepresentation(title: "Fjelltur", image: .init(systemName: "mountain.2")),
        .langrenn: DisplayRepresentation(title: "Langrenn", image: .init(systemName: "figure.skiing.crosscountry")),
        .alpint:   DisplayRepresentation(title: "Alpint",   image: .init(systemName: "figure.skiing.downhill")),
        .klatring: DisplayRepresentation(title: "Klatring", image: .init(systemName: "figure.climbing")),
        .svømming: DisplayRepresentation(title: "Svømming", image: .init(systemName: "figure.open.water.swim")),
    ]
}

// MARK: - Widget bundle

@main
struct KledningsWidgetBundle: WidgetBundle {
    var body: some Widget {
        KledningsWidget()
        KledningsLockScreenWidget()
    }
}

// MARK: - Home screen widget

struct KledningsWidget: Widget {
    let kind: String = "KledningsWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: KledningsProvider()) { entry in
            KledningsWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Kledningsapp")
        .description("Se hva du bør ha på deg")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Lock Screen widget

struct KledningsLockScreenWidget: Widget {
    let kind: String = "KledningsLockScreen"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: KledningsProvider()) { entry in
            LockScreenWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Kledning")
        .description("Kledningsanbefaling på låseskjerm")
        .supportedFamilies([.accessoryRectangular, .accessoryInline])
    }
}
