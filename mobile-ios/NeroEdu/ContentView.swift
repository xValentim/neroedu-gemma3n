//
//  ContentView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 25/07/25.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var llmService = LLMService.shared
    
    var body: some View {
        Group {
            if llmService.isInitialized {
                NavigationStack {
                    OnboardingView()
                }
            } else {
                InitializationView()
            }
        }
    }
}

#Preview {
    ContentView()
}
