import SwiftUI

struct OutfitView: View {
    let result: RecommendationResult

    var body: some View {
        VStack(spacing: 12) {
            // Summary card
            HStack(spacing: 12) {
                Image(systemName: "checkmark.seal.fill")
                    .font(.title2)
                    .foregroundStyle(.blue)
                Text(result.summary)
                    .font(.subheadline.weight(.semibold))
                    .multilineTextAlignment(.leading)
                Spacer()
            }
            .padding(14)
            .background(
                LinearGradient(colors: [.blue.opacity(0.1), .indigo.opacity(0.07)], startPoint: .leading, endPoint: .trailing),
                in: RoundedRectangle(cornerRadius: 14)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(.blue.opacity(0.2), lineWidth: 1)
            )

            if !result.forecastAlerts.isEmpty {
                VStack(alignment: .leading, spacing: 0) {
                    HStack(spacing: 8) {
                        Image(systemName: "clock.badge.exclamationmark")
                            .foregroundStyle(.orange)
                            .font(.subheadline)
                        Text("Varsler for turen")
                            .font(.subheadline.weight(.semibold))
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 11)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.orange.opacity(0.08))

                    VStack(spacing: 0) {
                        ForEach(result.forecastAlerts) { alert in
                            HStack(alignment: .top, spacing: 10) {
                                Image(systemName: alert.type.icon)
                                    .foregroundStyle(alert.severity == "advarsel" ? .orange : .blue)
                                    .font(.subheadline)
                                    .padding(.top, 1)
                                Text(alert.message)
                                    .font(.subheadline)
                                    .foregroundStyle(.primary)
                                Spacer()
                                if alert.severity == "advarsel" {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .foregroundStyle(.orange)
                                        .font(.caption)
                                }
                            }
                            .padding(.vertical, 9)
                            .overlay(alignment: .bottom) { Divider() }
                        }
                    }
                    .padding(.horizontal, 14)
                }
                .background(.background, in: RoundedRectangle(cornerRadius: 14))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.orange.opacity(0.3), lineWidth: 1)
                )
                .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
            }

            OutfitSection(title: "Hode og hals", systemImage: "person.crop.circle", accentColor: .purple) {
                ZoneRow(zone: result.garments.head, label: "Hode")
                ZoneRow(zone: result.garments.neck, label: "Hals")
            }

            OutfitSection(title: "Overkropp", systemImage: "tshirt.fill", accentColor: .blue) {
                LayerRow(layer: result.garments.upperBody.baseLayer, label: "Grunnlag")
                if let mid = result.garments.upperBody.midLayer {
                    LayerRow(layer: mid, label: "Mellomlag")
                }
                if let outer = result.garments.upperBody.outerLayer {
                    LayerRow(layer: outer, label: "Ytterlag")
                }
            }

            OutfitSection(title: "Underkropp", systemImage: "figure.stand", accentColor: .indigo) {
                if let base = result.garments.lowerBody.baseLayer {
                    LayerRow(layer: base, label: "Grunnlag")
                }
                LayerRow(layer: result.garments.lowerBody.outerLayer, label: "Ytterlag")
            }

            OutfitSection(title: "Hender og føtter", systemImage: "hand.raised.fill", accentColor: .teal) {
                ZoneRow(zone: result.garments.hands, label: "Hender")
                LayerRow(layer: result.garments.feet, label: "Føtter")
            }

            if !result.garments.backpackExtras.isEmpty {
                OutfitSection(title: "I sekken / vesken", systemImage: "backpack.fill", accentColor: .green) {
                    ForEach(result.garments.backpackExtras, id: \.self) { extra in
                        HStack(spacing: 10) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundStyle(.green)
                                .font(.subheadline)
                            Text(extra)
                                .font(.subheadline)
                            Spacer()
                        }
                        .padding(.vertical, 8)
                        .overlay(alignment: .bottom) { Divider() }
                    }
                }
            }

            if !result.notes.isEmpty {
                OutfitSection(title: "Tips og merknader", systemImage: "lightbulb.fill", accentColor: .orange) {
                    ForEach(result.notes, id: \.self) { note in
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "lightbulb.fill")
                                .foregroundStyle(.orange)
                                .font(.subheadline)
                                .padding(.top, 1)
                            Text(note)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Spacer()
                        }
                        .padding(.vertical, 8)
                        .overlay(alignment: .bottom) { Divider() }
                    }
                }
            }
        }
    }
}

// MARK: - Sub-components

struct OutfitSection<Content: View>: View {
    let title: String
    let systemImage: String
    let accentColor: Color
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: systemImage)
                    .foregroundStyle(accentColor)
                    .font(.subheadline)
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 11)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(accentColor.opacity(0.07))

            VStack(spacing: 0) {
                content
            }
            .padding(.horizontal, 14)
        }
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color(.systemGray5), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
    }
}

struct RequiredBadge: View {
    let required: Bool

    var body: some View {
        if required {
            Text("Påkrevd")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(.green)
                .padding(.horizontal, 7)
                .padding(.vertical, 3)
                .background(.green.opacity(0.12), in: Capsule())
        } else {
            Text("Valgfri")
                .font(.caption2.weight(.medium))
                .foregroundStyle(.secondary)
                .padding(.horizontal, 7)
                .padding(.vertical, 3)
                .background(Color(.systemGray6), in: Capsule())
        }
    }
}

struct ZoneRow: View {
    let zone: ZoneRecommendation
    let label: String

    var body: some View {
        HStack(spacing: 10) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(width: 64, alignment: .leading)
            Text(zone.item)
                .font(.subheadline)
                .opacity(zone.required ? 1 : 0.65)
            Spacer()
            RequiredBadge(required: zone.required)
        }
        .padding(.vertical, 9)
        .overlay(alignment: .bottom) { Divider() }
    }
}

struct LayerRow: View {
    let layer: LayerRecommendation
    let label: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(width: 64, alignment: .leading)
                .padding(.top, 1)
            VStack(alignment: .leading, spacing: 2) {
                Text(layer.item)
                    .font(.subheadline)
                    .opacity(layer.required ? 1 : 0.65)
                if let material = layer.material {
                    Text(material)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            RequiredBadge(required: layer.required)
        }
        .padding(.vertical, 9)
        .overlay(alignment: .bottom) { Divider() }
    }
}
