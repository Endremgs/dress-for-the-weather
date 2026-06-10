import SwiftUI
import WatchKit

private struct ChecklistItem: Identifiable, Hashable {
    let id: String
    let zone: String
    let label: String
    let required: Bool
}

struct WatchDressingChecklistView: View {
    let result: RecommendationResult
    let onDone: () -> Void

    @State private var checked: Set<String> = []
    @State private var celebrated = false

    private var items: [ChecklistItem] {
        var list: [ChecklistItem] = []

        let head = result.garments.head
        list.append(ChecklistItem(id: "head", zone: "Hode", label: head.item, required: head.required))

        let base = result.garments.upperBody.baseLayer
        list.append(ChecklistItem(id: "base", zone: "Base", label: base.item, required: true))

        if let mid = result.garments.upperBody.midLayer {
            list.append(ChecklistItem(id: "mid", zone: "Mellom", label: mid.item, required: mid.required))
        }
        if let outer = result.garments.upperBody.outerLayer {
            list.append(ChecklistItem(id: "outer", zone: "Ytter", label: outer.item, required: outer.required))
        }

        list.append(ChecklistItem(id: "legs", zone: "Bein", label: result.garments.lowerBody.outerLayer.item, required: true))

        let feet = result.garments.feet
        list.append(ChecklistItem(id: "feet", zone: "Føtter", label: feet.item, required: feet.required))

        let hands = result.garments.hands
        list.append(ChecklistItem(id: "hands", zone: "Hender", label: hands.item, required: hands.required))

        let neck = result.garments.neck
        if neck.required || !neck.item.isEmpty {
            list.append(ChecklistItem(id: "neck", zone: "Hals", label: neck.item, required: neck.required))
        }

        return list
    }

    private var requiredItems: [ChecklistItem] { items.filter { $0.required } }
    private var requiredChecked: Int { requiredItems.filter { checked.contains($0.id) }.count }
    private var totalRequired: Int { requiredItems.count }
    private var progress: Double {
        guard totalRequired > 0 else { return 1 }
        return Double(requiredChecked) / Double(totalRequired)
    }
    private var allDone: Bool { requiredChecked >= totalRequired && totalRequired > 0 }

    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                header

                VStack(spacing: 6) {
                    ForEach(items) { item in
                        ChecklistRow(
                            item: item,
                            isChecked: checked.contains(item.id),
                            onToggle: { toggle(item) }
                        )
                    }
                }

                if !result.garments.backpackExtras.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 4) {
                            Image(systemName: "backpack.fill")
                                .font(.caption2)
                                .foregroundStyle(.green)
                            Text("I sekken")
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(.secondary)
                        }
                        ForEach(result.garments.backpackExtras.prefix(3), id: \.self) { extra in
                            ExtraRow(
                                label: extra,
                                isChecked: checked.contains("extra-\(extra)"),
                                onToggle: { toggleExtra(extra) }
                            )
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, 4)
                }

                if allDone {
                    Button(action: {
                        WKInterfaceDevice.current().play(.success)
                        onDone()
                    }) {
                        Label("Ut på tur!", systemImage: "figure.walk.motion")
                            .font(.caption.weight(.semibold))
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)
                    .padding(.top, 4)
                }
            }
            .padding(.horizontal, 4)
            .padding(.vertical, 6)
        }
        .navigationTitle("Kle på deg")
        .onChange(of: allDone) { _, done in
            if done && !celebrated {
                celebrated = true
                WKInterfaceDevice.current().play(.success)
            }
            if !done {
                celebrated = false
            }
        }
    }

    private var header: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .stroke(.gray.opacity(0.25), lineWidth: 5)
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        allDone ? Color.green : Color.blue,
                        style: StrokeStyle(lineWidth: 5, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.35, dampingFraction: 0.7), value: progress)

                if allDone {
                    Image(systemName: "checkmark")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(.green)
                } else {
                    VStack(spacing: 0) {
                        Text("\(requiredChecked)/\(totalRequired)")
                            .font(.caption.weight(.bold))
                            .monospacedDigit()
                        Text("klar")
                            .font(.system(size: 8))
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .frame(width: 54, height: 54)

            if allDone {
                Text("Klar for tur!")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.green)
            } else {
                Text("\(result.weather.airTemp, specifier: "%.0f")° • Eff. \(result.effectiveTemp, specifier: "%.0f")°")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .monospacedDigit()
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.bottom, 2)
    }

    private func toggle(_ item: ChecklistItem) {
        let wasChecked = checked.contains(item.id)
        if wasChecked {
            checked.remove(item.id)
        } else {
            checked.insert(item.id)
            WKInterfaceDevice.current().play(.click)
        }
    }

    private func toggleExtra(_ extra: String) {
        let key = "extra-\(extra)"
        if checked.contains(key) {
            checked.remove(key)
        } else {
            checked.insert(key)
            WKInterfaceDevice.current().play(.click)
        }
    }
}

private struct ChecklistRow: View {
    let item: ChecklistItem
    let isChecked: Bool
    let onToggle: () -> Void

    var body: some View {
        Button(action: onToggle) {
            HStack(alignment: .top, spacing: 8) {
                Image(systemName: isChecked ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(isChecked ? Color.green : (item.required ? Color.blue : Color.gray))
                    .symbolRenderingMode(.hierarchical)
                    .animation(.spring(response: 0.25, dampingFraction: 0.6), value: isChecked)

                VStack(alignment: .leading, spacing: 1) {
                    Text(item.zone)
                        .font(.system(size: 9, weight: .medium))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)
                    Text(item.label)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(isChecked ? Color.secondary : Color.primary)
                        .strikethrough(isChecked, color: .secondary)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                }
                Spacer(minLength: 0)
            }
            .padding(.vertical, 4)
            .padding(.horizontal, 6)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(isChecked ? Color.green.opacity(0.12) : Color.white.opacity(0.05))
            )
        }
        .buttonStyle(.plain)
    }
}

private struct ExtraRow: View {
    let label: String
    let isChecked: Bool
    let onToggle: () -> Void

    var body: some View {
        Button(action: onToggle) {
            HStack(spacing: 6) {
                Image(systemName: isChecked ? "checkmark.circle.fill" : "circle")
                    .font(.caption)
                    .foregroundStyle(isChecked ? .green : .green.opacity(0.7))
                Text(label)
                    .font(.caption2)
                    .strikethrough(isChecked, color: .secondary)
                    .foregroundStyle(isChecked ? .secondary : .primary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                Spacer(minLength: 0)
            }
            .padding(.vertical, 2)
        }
        .buttonStyle(.plain)
    }
}
