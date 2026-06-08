import SwiftUI

@MainActor
final class ContentViewModel: ObservableObject {
    @Published var selectedActivity: ActivityType = .rusling
    @Published var durationMinutes: Int = 60
    @Published var sensitivity: Int = 0
    @Published var result: RecommendationResult?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isManualMode = false
    @Published var showOverrideSheet = false
    @Published var currentOverride = WeatherOverride(
        airTemp: 10, windSpeed: 3, humidity: 70, precipitation: "none", precipitationProb: 0
    )

    private let locationService = LocationService.shared
    private var locationTask: Task<Void, Never>?

    func onAppear() {
        locationService.requestLocation()
        observeLocation()
    }

    private func observeLocation() {
        locationTask?.cancel()
        locationTask = Task {
            for await location in locationService.$location.values {
                guard !Task.isCancelled else { return }
                guard let loc = location else { continue }
                await fetchRecommendation(lat: loc.coordinate.latitude, lon: loc.coordinate.longitude)
                break
            }
        }
    }

    func fetchRecommendation(lat: Double, lon: Double, weatherOverride: WeatherOverride? = nil) async {
        isLoading = true
        errorMessage = nil
        do {
            result = try await APIService.shared.fetchRecommendation(
                lat: lat, lon: lon,
                activity: selectedActivity,
                durationMinutes: durationMinutes,
                sensitivity: sensitivity,
                weatherOverride: weatherOverride
            )
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func activityChanged() {
        guard let loc = locationService.location else { return }
        Task {
            await fetchRecommendation(
                lat: loc.coordinate.latitude,
                lon: loc.coordinate.longitude,
                weatherOverride: isManualMode ? currentOverride : nil
            )
        }
    }

    func openOverrideSheet() {
        if let r = result {
            currentOverride = WeatherOverride(
                airTemp: r.weather.airTemp,
                windSpeed: r.weather.windSpeed,
                humidity: r.weather.humidity,
                precipitation: r.weather.precipitation,
                precipitationProb: r.weather.precipitationProb
            )
        }
        showOverrideSheet = true
    }

    func applyOverride() async {
        isManualMode = true
        guard let loc = locationService.location else { return }
        await fetchRecommendation(
            lat: loc.coordinate.latitude,
            lon: loc.coordinate.longitude,
            weatherOverride: currentOverride
        )
    }

    func resetToGeoWeather() async {
        isManualMode = false
        showOverrideSheet = false
        guard let loc = locationService.location else { return }
        await fetchRecommendation(lat: loc.coordinate.latitude, lon: loc.coordinate.longitude)
    }
}

struct ContentView: View {
    @EnvironmentObject private var locationService: LocationService
    @StateObject private var vm = ContentViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    ActivityPickerView(
                        selected: $vm.selectedActivity,
                        duration: $vm.durationMinutes,
                        sensitivity: $vm.sensitivity
                    )
                    .onChange(of: vm.selectedActivity) { _, _ in vm.activityChanged() }
                    .onChange(of: vm.durationMinutes) { _, _ in vm.activityChanged() }
                    .onChange(of: vm.sensitivity) { _, _ in vm.activityChanged() }

                    if vm.isLoading {
                        LoadingView(activity: vm.selectedActivity)
                    } else if let error = vm.errorMessage {
                        ErrorView(message: error) { vm.activityChanged() }
                    } else if let result = vm.result {
                        WeatherHeaderView(
                            result: result,
                            locationName: locationService.locationName,
                            isManualMode: vm.isManualMode,
                            onToggleManual: {
                                if vm.isManualMode {
                                    Task { await vm.resetToGeoWeather() }
                                } else {
                                    vm.openOverrideSheet()
                                }
                            }
                        )
                        .transition(.opacity.combined(with: .scale(scale: 0.97)))
                        if !result.weather.forecastWindow.isEmpty {
                            ForecastTimelineView(
                                weather: result.weather,
                                forecastWindow: result.weather.forecastWindow,
                                durationMinutes: vm.durationMinutes
                            )
                            .transition(.opacity)
                        }
                        if !result.safetyWarnings.isEmpty {
                            SafetyWarningsView(warnings: result.safetyWarnings)
                                .transition(.opacity)
                        }
                        OutfitView(result: result)
                            .transition(.opacity)
                    }
                }
                .padding()
                .animation(.easeInOut(duration: 0.25), value: vm.isLoading)
                .animation(.easeInOut(duration: 0.25), value: vm.result == nil)
            }
            .navigationTitle("Kle deg riktig")
            .navigationBarTitleDisplayMode(.large)
        }
        .onAppear { vm.onAppear() }
        .sheet(isPresented: $vm.showOverrideSheet) {
            WeatherOverrideSheet(
                override: $vm.currentOverride,
                onApply: { Task { await vm.applyOverride() } },
                onReset: { Task { await vm.resetToGeoWeather() } }
            )
        }
    }
}

struct LoadingView: View {
    let activity: ActivityType

    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .controlSize(.large)
                .tint(.blue)
            VStack(spacing: 4) {
                Text("Henter vær og beregner...")
                    .font(.subheadline.weight(.medium))
                Text(activity.label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity)
        .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 20))
    }
}

struct ErrorView: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(.orange.opacity(0.12))
                    .frame(width: 64, height: 64)
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.title)
                    .foregroundStyle(.orange)
            }
            VStack(spacing: 6) {
                Text("Noe gikk galt")
                    .font(.headline)
                Text(message)
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            Button(action: retry) {
                Label("Prøv igjen", systemImage: "arrow.clockwise")
                    .font(.subheadline.weight(.semibold))
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.regular)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(.background, in: RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(.orange.opacity(0.3), lineWidth: 1)
        )
        .shadow(color: .orange.opacity(0.1), radius: 10, y: 4)
    }
}
