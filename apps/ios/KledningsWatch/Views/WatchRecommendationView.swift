import SwiftUI

struct WatchRecommendationView: View {
    let result: RecommendationResult
    let activity: ActivityType
    let onChangeTap: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                // Header
                HStack {
                    Text(activity.icon).font(.title3)
                    VStack(alignment: .leading, spacing: 1) {
                        Text("\(result.weather.airTemp, specifier: "%.0f")°C")
                            .font(.headline)
                        Text("Føles \(result.effectiveTemp, specifier: "%.0f")°")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Button(action: onChangeTap) {
                        Image(systemName: "arrow.triangle.2.circlepath")
                            .font(.caption)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(.blue)
                }

                // Safety warnings
                ForEach(result.safetyWarnings.prefix(2)) { warning in
                    Label(warning.message, systemImage: warning.level.icon)
                        .font(.caption2)
                        .foregroundStyle(warning.level == .critical ? .red : .orange)
                        .lineLimit(2)
                }

                Divider()

                // Summary
                Text(result.summary)
                    .font(.caption.weight(.semibold))

                Divider()

                // Layers
                WatchLayerRow(label: "Hode", item: result.garments.head.item, required: result.garments.head.required)
                WatchLayerRow(label: "Overkropp", item: result.garments.upperBody.baseLayer.item, required: true)
                if let mid = result.garments.upperBody.midLayer {
                    WatchLayerRow(label: "+", item: mid.item, required: mid.required)
                }
                if let outer = result.garments.upperBody.outerLayer {
                    WatchLayerRow(label: "+", item: outer.item, required: outer.required)
                }
                WatchLayerRow(label: "Bein", item: result.garments.lowerBody.outerLayer.item, required: true)
                WatchLayerRow(label: "Hender", item: result.garments.hands.item, required: result.garments.hands.required)

                // Backpack extras
                if !result.garments.backpackExtras.isEmpty {
                    Divider()
                    Text("Sekken:")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.secondary)
                    ForEach(result.garments.backpackExtras.prefix(2), id: \.self) { extra in
                        Text("• \(extra)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
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
                .font(.caption2)
                .foregroundStyle(.secondary)
                .frame(width: 44, alignment: .leading)
            Text(item)
                .font(.caption2)
                .lineLimit(2)
                .opacity(required ? 1 : 0.5)
        }
    }
}
