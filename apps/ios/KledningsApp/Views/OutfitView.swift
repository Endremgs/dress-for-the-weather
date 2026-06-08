import SwiftUI

struct OutfitView: View {
    let result: RecommendationResult

    var body: some View {
        VStack(spacing: 12) {
            // Summary
            Text(result.summary)
                .font(.headline)
                .multilineTextAlignment(.center)
                .padding()
                .frame(maxWidth: .infinity)
                .background(.blue.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))

            // Head & neck
            OutfitSection(title: "Hode og hals", systemImage: "person.crop.circle") {
                ZoneRow(zone: result.garments.head, label: "Hode")
                ZoneRow(zone: result.garments.neck, label: "Hals")
            }

            // Upper body
            OutfitSection(title: "Overkropp", systemImage: "tshirt") {
                LayerRow(layer: result.garments.upperBody.baseLayer, label: "Grunnlag")
                if let mid = result.garments.upperBody.midLayer {
                    LayerRow(layer: mid, label: "Mellomlag")
                }
                if let outer = result.garments.upperBody.outerLayer {
                    LayerRow(layer: outer, label: "Ytterlag")
                }
            }

            // Lower body
            OutfitSection(title: "Underkropp", systemImage: "figure.stand") {
                if let base = result.garments.lowerBody.baseLayer {
                    LayerRow(layer: base, label: "Grunnlag")
                }
                LayerRow(layer: result.garments.lowerBody.outerLayer, label: "Ytterlag")
            }

            // Hands & feet
            OutfitSection(title: "Hender og føtter", systemImage: "hand.raised") {
                ZoneRow(zone: result.garments.hands, label: "Hender")
                LayerRow(layer: result.garments.feet, label: "Føtter")
            }

            // Backpack extras
            if !result.garments.backpackExtras.isEmpty {
                OutfitSection(title: "I sekken / vesken", systemImage: "backpack") {
                    ForEach(result.garments.backpackExtras, id: \.self) { extra in
                        HStack {
                            Image(systemName: "plus.circle.fill")
                                .foregroundStyle(.green)
                                .font(.caption)
                            Text(extra)
                                .font(.subheadline)
                            Spacer()
                        }
                        .padding(.vertical, 6)
                        .overlay(alignment: .bottom) {
                            Divider()
                        }
                    }
                }
            }

            // Notes
            if !result.notes.isEmpty {
                OutfitSection(title: "Merknader", systemImage: "note.text") {
                    ForEach(result.notes, id: \.self) { note in
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "lightbulb")
                                .foregroundStyle(.yellow)
                                .font(.caption)
                                .padding(.top, 2)
                            Text(note)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Spacer()
                        }
                        .padding(.vertical, 6)
                        .overlay(alignment: .bottom) {
                            Divider()
                        }
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
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Label(title, systemImage: systemImage)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.secondary)
                .padding(.horizontal)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(.systemGray6))

            VStack(spacing: 0) {
                content
            }
            .padding(.horizontal)
        }
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.05), radius: 6, y: 2)
    }
}

struct ZoneRow: View {
    let zone: ZoneRecommendation
    let label: String

    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(width: 70, alignment: .leading)
            Text(zone.item)
                .font(.subheadline)
            Spacer()
            if !zone.required {
                Text("valgfri")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.vertical, 8)
        .opacity(zone.required ? 1 : 0.6)
        .overlay(alignment: .bottom) { Divider() }
    }
}

struct LayerRow: View {
    let layer: LayerRecommendation
    let label: String

    var body: some View {
        HStack(alignment: .top) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(width: 70, alignment: .leading)
                .padding(.top, 1)
            VStack(alignment: .leading, spacing: 2) {
                Text(layer.item)
                    .font(.subheadline)
                if let material = layer.material {
                    Text(material)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            if !layer.required {
                Text("valgfri")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.vertical, 8)
        .opacity(layer.required ? 1 : 0.6)
        .overlay(alignment: .bottom) { Divider() }
    }
}
