import SwiftUI

struct WeatherOverrideSheet: View {
    @Binding var override: WeatherOverride
    let onApply: () -> Void
    let onReset: () -> Void

    private let precipOptions: [(value: String, label: String, icon: String)] = [
        ("none", "Ingen", "sun.max.fill"),
        ("light", "Lett", "cloud.drizzle.fill"),
        ("moderate", "Moderat", "cloud.rain.fill"),
        ("heavy", "Kraftig", "cloud.heavyrain.fill"),
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    LabeledContent {
                        Text("\(override.airTemp, specifier: "%.0f")°C")
                            .font(.headline.monospacedDigit())
                            .foregroundStyle(.primary)
                    } label: {
                        Text("Temperatur")
                    }
                    Slider(value: $override.airTemp, in: -20...40, step: 1) { editing in
                        if !editing { onApply() }
                    }
                    .tint(.blue)
                } header: {
                    Text("Temperatur")
                }

                Section {
                    LabeledContent {
                        Text("\(override.windSpeed, specifier: "%.1f") m/s")
                            .font(.headline.monospacedDigit())
                            .foregroundStyle(.primary)
                    } label: {
                        Text("Vindstyrke")
                    }
                    Slider(value: $override.windSpeed, in: 0...30, step: 0.5) { editing in
                        if !editing { onApply() }
                    }
                    .tint(.blue)
                } header: {
                    Text("Vind")
                }

                Section {
                    LabeledContent {
                        Text("\(override.humidity, specifier: "%.0f")%")
                            .font(.headline.monospacedDigit())
                            .foregroundStyle(.primary)
                    } label: {
                        Text("Fuktighet")
                    }
                    Slider(value: $override.humidity, in: 0...100, step: 5) { editing in
                        if !editing { onApply() }
                    }
                    .tint(.blue)
                } header: {
                    Text("Fuktighet")
                }

                Section {
                    ForEach(precipOptions, id: \.value) { opt in
                        Button {
                            override.precipitation = opt.value
                            onApply()
                        } label: {
                            HStack {
                                Image(systemName: opt.icon)
                                    .foregroundStyle(.blue)
                                    .frame(width: 24)
                                Text(opt.label)
                                    .foregroundStyle(.primary)
                                Spacer()
                                if override.precipitation == opt.value {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(.blue)
                                        .fontWeight(.semibold)
                                }
                            }
                        }
                    }
                } header: {
                    Text("Nedbør")
                }

                Section {
                    LabeledContent {
                        Text("\(override.precipitationProb, specifier: "%.0f")%")
                            .font(.headline.monospacedDigit())
                            .foregroundStyle(.primary)
                    } label: {
                        Text("Nedbørssannsynlighet")
                    }
                    Slider(value: $override.precipitationProb, in: 0...100, step: 5) { editing in
                        if !editing { onApply() }
                    }
                    .tint(.blue)
                } header: {
                    Text("Nedbørssannsynlighet")
                }

                Section {
                    Button(role: .destructive) {
                        onReset()
                    } label: {
                        Label("Tilbake til geo-posisjon", systemImage: "location.fill")
                    }
                }
            }
            .navigationTitle("Juster vær manuelt")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }
}
