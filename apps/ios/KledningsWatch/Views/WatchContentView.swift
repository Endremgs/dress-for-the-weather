import SwiftUI

@MainActor
final class WatchViewModel: ObservableObject {
    @Published var selectedActivity: ActivityType = .rusling
    @Published var durationMinutes: Int = 60
    @Published var result: RecommendationResult?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isManualMode = false
    @Published var showOverride = false
    @Published var tempOverride: Double = 10

    // Oslo fallback — Watch has no independent location API
    // WatchConnectivity could push the iPhone's location here in a future update
    let locationName = "Oslo"
    private let lat = 59.9139
    private let lon = 10.7522

    func fetch(weatherOverride: WeatherOverride? = nil) async {
        isLoading = true
        errorMessage = nil
        do {
            result = try await APIService.shared.fetchRecommendation(
                lat: lat, lon: lon,
                activity: selectedActivity,
                durationMinutes: durationMinutes,
                weatherOverride: weatherOverride
            )
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func openTempOverride() {
        tempOverride = result?.weather.airTemp ?? 10
        showOverride = true
    }

    func applyTempOverride() async {
        isManualMode = true
        let base = result?.weather
        let override = WeatherOverride(
            airTemp: tempOverride,
            windSpeed: base?.windSpeed ?? 3,
            humidity: base?.humidity ?? 70,
            precipitation: base?.precipitation ?? "none",
            precipitationProb: base?.precipitationProb ?? 0
        )
        await fetch(weatherOverride: override)
    }

    func resetToOsloWeather() async {
        isManualMode = false
        showOverride = false
        await fetch()
    }
}

struct WatchContentView: View {
    @StateObject private var vm = WatchViewModel()
    @State private var showPicker = false

    var body: some View {
        Group {
            if vm.isLoading {
                VStack(spacing: 8) {
                    ProgressView()
                        .controlSize(.regular)
                    Text("Beregner...")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            } else if let result = vm.result {
                WatchRecommendationView(
                    result: result,
                    activity: vm.selectedActivity,
                    locationName: vm.isManualMode ? "Manuell modus" : vm.locationName,
                    onChangeTap: { showPicker = true }
                )
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button {
                            if vm.isManualMode {
                                Task { await vm.resetToOsloWeather() }
                            } else {
                                vm.openTempOverride()
                            }
                        } label: {
                            Image(systemName: vm.isManualMode ? "location.fill" : "thermometer.medium")
                                .font(.caption)
                                .foregroundStyle(vm.isManualMode ? .yellow : .blue)
                        }
                    }
                }
            } else if let error = vm.errorMessage {
                VStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(.orange)
                        .font(.title3)
                    Text(error)
                        .font(.caption2)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.secondary)
                    Button("Prøv igjen") { Task { await vm.fetch() } }
                        .font(.caption.weight(.medium))
                        .buttonStyle(.borderedProminent)
                        .tint(.blue)
                }
                .padding()
            } else {
                WatchActivityPickerView(
                    selectedActivity: $vm.selectedActivity,
                    durationMinutes: $vm.durationMinutes,
                    onConfirm: { Task { await vm.fetch() } }
                )
            }
        }
        .sheet(isPresented: $showPicker) {
            WatchActivityPickerView(
                selectedActivity: $vm.selectedActivity,
                durationMinutes: $vm.durationMinutes,
                onConfirm: {
                    showPicker = false
                    Task { await vm.fetch(weatherOverride: vm.isManualMode ? nil : nil) }
                }
            )
        }
        .sheet(isPresented: $vm.showOverride) {
            WatchOverrideView(
                tempOverride: $vm.tempOverride,
                onApply: {
                    vm.showOverride = false
                    Task { await vm.applyTempOverride() }
                },
                onReset: { Task { await vm.resetToOsloWeather() } }
            )
        }
    }
}
