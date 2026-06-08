import SwiftUI

struct WatchRecommendationView: View {
    let result: RecommendationResult
    let activity: ActivityType
    let locationName: String
    let onChangeTap: () -> Void

    private var precipitationText: String {
        let prob = Int(result.weather.precipitationProb)
        switch result.weather.precipitation {
        case "none":     return prob < 10 ? "Tørt" : "\(prob)%"
        case "light":    return "Lett \(prob)%"
        case "moderate": return "Mod. \(prob)%"
        default:         return "Kraftig"
        }
    }

    private var precipitationIcon: String {
        switch result.weather.precipitation {
        case "none":     return "drop"
        case "light":    return "cloud.drizzle.fill"
        case "moderate": return "cloud.rain.fill"
        default:         return "cloud.heavyrain.fill"
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

                    // Activity + temperature + wind
                    HStack(alignment: .center, spacing: 6) {
                        Image(systemName: activity.sfSymbol)
                            .font(.title3)
                            .foregroundStyle(.blue)
                        Text("\(result.weather.airTemp, specifier: "%.0f")°C")
                            .font(.headline)
                        Spacer()
                        HStack(spacing: 2) {
                            Image(systemName: "wind")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                            Text("\(result.weather.windSpeed, specifier: "%.1f") m/s")
                                .font(.caption2)
                        }
                    }

                    // Effective temp + precipitation
                    HStack {
                        Text("Eff. \(result.effectiveTemp, specifier: "%.0f")°")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Spacer()
                        HStack(spacing: 2) {
                            Image(systemName: precipitationIcon)
                                .font(.caption2)
                                .foregroundStyle(.blue.opacity(0.8))
                            Text(precipitationText)
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
                    .foregroundStyle(warningColor(warning.level))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(warningColor(warning.level).opacity(0.15), in: RoundedRectangle(cornerRadius: 8))
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
            }
            .padding()
        }
    }

    private func warningColor(_ level: WarningLevel) -> Color {
        switch level {
        case .critical: return .red
        case .high:     return .orange
        case .medium:   return .yellow
        case .low:      return .blue
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
