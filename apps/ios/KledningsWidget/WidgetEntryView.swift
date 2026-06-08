import WidgetKit
import SwiftUI

// MARK: - Home screen entry view

struct KledningsWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: WidgetEntry

    var body: some View {
        switch family {
        case .systemSmall: SmallWidgetView(entry: entry)
        case .systemMedium: MediumWidgetView(entry: entry)
        default: SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Small (2×2)

struct SmallWidgetView: View {
    let entry: WidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(entry.activity.icon)
                    .font(.title3)
                Spacer()
                if let result = entry.result {
                    Text("\(result.weather.airTemp, specifier: "%.0f")°")
                        .font(.headline)
                        .foregroundStyle(.secondary)
                }
            }

            if let result = entry.result {
                Text(result.summary)
                    .font(.caption.weight(.medium))
                    .lineLimit(3)
                    .minimumScaleFactor(0.8)

                Spacer()

                if let warning = result.safetyWarnings.first {
                    Label(warning.level == .critical ? "Farlig!" : "Advarsel",
                          systemImage: warning.level.icon)
                        .font(.caption2)
                        .foregroundStyle(warning.level == .critical ? .red : .orange)
                }
            } else if let error = entry.errorMessage {
                Text(error)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
            } else {
                Text("Laster...")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

// MARK: - Medium (4×2)

struct MediumWidgetView: View {
    let entry: WidgetEntry

    var body: some View {
        HStack(spacing: 12) {
            // Left column: activity + temp
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 4) {
                    Text(entry.activity.icon).font(.title2)
                    Text(entry.activity.label)
                        .font(.subheadline.weight(.semibold))
                }
                if let result = entry.result {
                    Text("\(result.weather.airTemp, specifier: "%.0f")°C")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                    Text("Føles \(result.apparentTemp, specifier: "%.0f")°")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
            }

            Divider()

            // Right column: outfit layers
            if let result = entry.result {
                VStack(alignment: .leading, spacing: 4) {
                    Text(result.summary)
                        .font(.caption.weight(.medium))
                        .lineLimit(2)

                    Spacer()

                    MediumLayerLine(icon: "tshirt", text: result.garments.upperBody.baseLayer.item)
                    if let mid = result.garments.upperBody.midLayer {
                        MediumLayerLine(icon: "square.3.layers.3d", text: mid.item)
                    }
                    if let outer = result.garments.upperBody.outerLayer {
                        MediumLayerLine(icon: "cloud.rain", text: outer.item)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct MediumLayerLine: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .frame(width: 14)
            Text(text)
                .font(.caption)
                .lineLimit(1)
        }
    }
}

// MARK: - Lock screen views

struct LockScreenWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: WidgetEntry

    var body: some View {
        if family == .accessoryInline {
            inlineView
        } else {
            rectangularView
        }
    }

    private var inlineView: some View {
        Group {
            if let result = entry.result {
                Label("\(entry.activity.icon) \(result.weather.airTemp, specifier: "%.0f")° – \(result.garments.upperBody.baseLayer.item)",
                      systemImage: entry.activity.sfSymbol)
            } else {
                Text("\(entry.activity.icon) Laster...")
            }
        }
    }

    private var rectangularView: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(entry.activity.icon)
                Text(entry.activity.label).font(.caption.weight(.semibold))
                Spacer()
                if let result = entry.result {
                    Text("\(result.weather.airTemp, specifier: "%.0f")°")
                        .font(.caption.weight(.semibold))
                }
            }
            if let result = entry.result {
                Text(result.summary)
                    .font(.caption2)
                    .lineLimit(2)
            }
        }
    }
}
