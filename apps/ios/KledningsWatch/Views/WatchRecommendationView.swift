import SwiftUI

struct WatchRecommendationView: View {
    let result: RecommendationResult
    let activity: ActivityType
    let locationName: String
    let onChangeTap: () -> Void

    private var conditionIcon: String {
        switch result.weather.precipitation {
        case "none":
            let c = result.weather.cloudCover
            if c < 25  { return "sun.max.fill" }
            if c < 60  { return "cloud.sun.fill" }
            if c < 85  { return "cloud.fill" }
            return "smoke.fill"
        case "light":    return "cloud.drizzle.fill"
        case "moderate": return "cloud.rain.fill"
        default:         return "cloud.heavyrain.fill"
        }
    }

    private var conditionLabel: String {
        switch result.weather.precipitation {
        case "none":
            let c = result.weather.cloudCover
            if c < 25  { return "Klarvær" }
            if c < 60  { return "Delvis skyet" }
            if c < 85  { return "Skyet" }
            return "Overskyet"
        case "light":    return "Lett nedbør"
        case "moderate": return "Moderat nedbør"
        default:         return "Kraftig nedbør"
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    // Location row
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Text(locationName)
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(.secondary)
                        Spacer()
                        Button(action: onChangeTap) {
                            Image(systemName: "arrow.triangle.2.circlepath")
                                .font(.caption)
                                .foregroundStyle(.blue)
                        }
                        .buttonStyle(.plain)
                    }

                    // Activity + temperature + condition
                    HStack(alignment: .center, spacing: 6) {
                        Image(systemName: activity.sfSymbol)
                            .font(.title3)
                            .foregroundStyle(.blue)
                        Text("\(result.weather.airTemp, specifier: "%.0f")°C")
                            .font(.headline)
                        Spacer()
                        HStack(spacing: 3) {
                            Image(systemName: conditionIcon)
                                .font(.caption)
                                .foregroundStyle(.blue.opacity(0.85))
                                .symbolRenderingMode(.hierarchical)
                            Text(conditionLabel)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }

                    // Effective temp + wind
                    HStack {
                        Text("Eff. \(result.effectiveTemp, specifier: "%.0f")°")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Spacer()
                        HStack(spacing: 2) {
                            Image(systemName: "wind")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                            Text("\(result.weather.windSpeed, specifier: "%.1f") m/s")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(.bottom, 2)

                // Safety warnings
                ForEach(result.safetyWarnings.prefix(2)) { warning in
                    HStack(spacing: 4) {
                        Image(systemName: warning.level.icon)
                            .font(.caption2)
                        Text(warning.message)
                            .font(.caption2)
                            .lineLimit(2)
                    }
                    .foregroundStyle(warning.level.swiftUIColor)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(warning.level.swiftUIColor.opacity(0.15), in: RoundedRectangle(cornerRadius: 8))
                }

                Divider()

                // Summary
                Text(result.summary)
                    .font(.caption.weight(.semibold))
                    .fixedSize(horizontal: false, vertical: true)

                Divider()

                // Layers
                VStack(alignment: .leading, spacing: 6) {
                    WatchLayerRow(label: "Hode", item: result.garments.head.item, required: result.garments.head.required)
                    WatchLayerRow(label: "Base", item: result.garments.upperBody.baseLayer.item, required: true)
                    if let mid = result.garments.upperBody.midLayer {
                        WatchLayerRow(label: "Mellom", item: mid.item, required: mid.required)
                    }
                    if let outer = result.garments.upperBody.outerLayer {
                        WatchLayerRow(label: "Ytter", item: outer.item, required: outer.required)
                    }
                    WatchLayerRow(label: "Bein", item: result.garments.lowerBody.outerLayer.item, required: true)
                    WatchLayerRow(label: "Hender", item: result.garments.hands.item, required: result.garments.hands.required)
                }

                // Backpack extras
                if !result.garments.backpackExtras.isEmpty {
                    Divider()
                    Text("Sekken")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.secondary)
                    ForEach(result.garments.backpackExtras.prefix(2), id: \.self) { extra in
                        HStack(spacing: 4) {
                            Image(systemName: "plus.circle.fill")
                                .font(.caption2)
                                .foregroundStyle(.green)
                            Text(extra)
                                .font(.caption2)
                                .lineLimit(2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                // Forecast alerts
                if !result.forecastAlerts.isEmpty {
                    Divider()
                    Text("Varsler")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.secondary)
                    ForEach(result.forecastAlerts) { alert in
                        HStack(spacing: 4) {
                            Image(systemName: alert.type.icon)
                                .font(.caption2)
                                .foregroundStyle(alert.severity == "advarsel" ? .orange : .blue)
                            Text(alert.message)
                                .font(.caption2)
                                .lineLimit(3)
                                .foregroundStyle(.primary)
                        }
                    }
                }
            }
            .padding()
        }
    }

}

struct WatchLayerRow: View {
    let label: String
    let item: String
    let required: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 6) {
            Text(label)
                .font(.caption2.weight(.medium))
                .foregroundStyle(.secondary)
                .frame(width: 46, alignment: .leading)
            Text(item)
                .font(.caption2)
                .lineLimit(2)
                .foregroundStyle(required ? .primary : .secondary)
        }
    }
}
