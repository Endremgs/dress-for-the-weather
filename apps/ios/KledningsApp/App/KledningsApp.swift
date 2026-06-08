import SwiftUI

@main
struct KledningsApp: App {
    @StateObject private var locationService = LocationService.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(locationService)
        }
    }
}
