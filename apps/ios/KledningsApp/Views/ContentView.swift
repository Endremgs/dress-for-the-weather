import SwiftUI

@MainActor
final class ContentViewModel: ObservableObject {
    @Published var selectedActivity: ActivityType = .rusling
    @Published var durationMinutes: Int = 60
    @Published var sensitivity: Int = 0
    @Published var result: RecommendationResult?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let locationService = LocationService.shared

    func onAppear() {
        locationService.requestLocation()
        observeLocation()
    }

    private func observeLocation() {
        Task {
            for await location in locationService.$location.values {
                guard let loc = location else { continue }
                await fetchRecommendation(lat: loc.coordinate.latitude, lon: loc.coordinate.longitude)
                break
            }
        }
    }

    func fetchRecommendation(lat: Double, lon: Double) async {
        isLoading = true
        errorMessage = nil
        do {
            result = try await APIService.shared.fetchRecommendation(
                lat: lat, lon: lon,
                activity: selectedActivity,
                durationMinutes: durationMinutes,
                sensitivity: sensitivity
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
                lon: loc.coordinate.longitude
            )
        }
    }
}

struct ContentView: View {
    @EnvironmentObject private var locationService: LocationService
    @StateObject private var vm = ContentViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    ActivityPickerView(
                        selected: $vm.selectedActivity,
                        duration: $vm.durationMinutes,
                        sensitivity: $vm.sensitivity
                    )
                    .onChange(of: vm.selectedActivity) { _, _ in vm.activityChanged() }
                    .onChange(of: vm.durationMinutes) { _, _ in vm.activityChanged() }
                    .onChange(of: vm.sensitivity) { _, _ in vm.activityChanged() }

                    if vm.isLoading {
                        ProgressView("Henter vær og beregner...")
                            .padding()
                    } else if let error = vm.errorMessage {
                        ErrorView(message: error) { vm.activityChanged() }
                    } else if let result = vm.result {
                        WeatherHeaderView(result: result, locationName: locationService.locationName)
                        if !result.safetyWarnings.isEmpty {
                            SafetyWarningsView(warnings: result.safetyWarnings)
                        }
                        OutfitView(result: result)
                    }
                }
                .padding()
            }
            .navigationTitle("Kle deg riktig")
            .navigationBarTitleDisplayMode(.large)
        }
        .onAppear { vm.onAppear() }
    }
}

struct ErrorView: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundStyle(.orange)
            Text(message)
                .font(.callout)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            Button("Prøv igjen", action: retry)
                .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(.orange.opacity(0.1), in: RoundedRectangle(cornerRadius: 16))
    }
}
