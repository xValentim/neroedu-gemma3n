//
//  InitializationView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 29/07/25.
//

import SwiftUI

struct InitializationView: View {
    @StateObject private var llmService = LLMService.shared
    @State private var animateContent = false
    @State private var showError = false
    
    var body: some View {
        ZStack {
            // Background
            backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 40) {
                Spacer()
                
                // Logo and Title
                VStack(spacing: 24) {
                    // Animated logo
                    ZStack {
                        // Outer glow
                        Circle()
                            .fill(
                                RadialGradient(
                                    colors: [
                                        Color.blue.opacity(0.3),
                                        Color.purple.opacity(0.2),
                                        Color.clear
                                    ],
                                    center: .center,
                                    startRadius: 20,
                                    endRadius: 80
                                )
                            )
                            .frame(width: 160, height: 160)
                            .scaleEffect(animateContent ? 1.2 : 0.8)
                            .opacity(animateContent ? 0.6 : 0.3)
                            .animation(.easeInOut(duration: 2.0).repeatForever(autoreverses: true), value: animateContent)
                        
                        // Main circle
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.blue.opacity(0.8),
                                        Color.purple.opacity(0.6)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 120, height: 120)
                            .overlay(
                                Circle()
                                    .stroke(Color.white.opacity(0.3), lineWidth: 2)
                            )
                        
                        // Brain icon
                        Image(systemName: "brain.head.profile")
                            .font(.system(size: 50, weight: .medium))
                            .foregroundColor(.white)
                            .scaleEffect(animateContent ? 1.1 : 0.9)
                            .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: animateContent)
                    }
                    
                    VStack(spacing: 12) {
                        Text("NeroEdu")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [.white, .blue.opacity(0.8)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                        
                        Text("AI-Powered Learning")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
                
                Spacer()
                
                // Loading Section
                VStack(spacing: 24) {
                    // Loading animation
                    ZStack {
                        Circle()
                            .stroke(Color.white.opacity(0.2), lineWidth: 4)
                            .frame(width: 60, height: 60)
                        
                        Circle()
                            .trim(from: 0, to: 0.7)
                            .stroke(
                                LinearGradient(
                                    colors: [.blue, .purple],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                ),
                                style: StrokeStyle(lineWidth: 4, lineCap: .round)
                            )
                            .frame(width: 60, height: 60)
                            .rotationEffect(.degrees((llmService.isLoading && !llmService.isOfflineMode) ? 360 : 0))
                            .animation(.linear(duration: 1.5).repeatForever(autoreverses: false), value: llmService.isLoading && !llmService.isOfflineMode)
                    }
                    
                    VStack(spacing: 8) {
                        Text(llmService.isInitialized ? (llmService.isOfflineMode ? "Offline Mode" : "Ready!") : "Initializing AI Engine...")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundColor(.white)
                        
                        Text(llmService.isInitialized ? (llmService.isOfflineMode ? "App will function with limited AI features" : "AI model loaded successfully") : "Loading language model for content generation")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                            .multilineTextAlignment(.center)
                        
                        if !llmService.isInitialized {
                            Text("This may take a few moments on first launch")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.white.opacity(0.5))
                                .multilineTextAlignment(.center)
                                .padding(.top, 4)
                        }
                    }
                }
                
                Spacer()
                
                // Status indicator
                HStack(spacing: 8) {
                    Circle()
                        .fill(llmService.isInitialized ? (llmService.isOfflineMode ? Color.orange : Color.green) : (llmService.isLoading ? Color.yellow : Color.red))
                        .frame(width: 8, height: 8)
                    
                    Text(llmService.isInitialized ? (llmService.isOfflineMode ? "Offline Mode" : "AI Ready") : (llmService.isLoading ? "Loading..." : "Error"))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.1))
                )
            }
            .padding(.horizontal, 40)
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.3)) {
                animateContent = true
            }
        }
        .alert("Initialization Error", isPresented: $showError) {
            Button("Retry") {
                llmService.retryInitialization()
            }
            Button("Continue Offline") {
                llmService.isOfflineMode = true
                llmService.isInitialized = true
            }
        } message: {
            if let error = llmService.errorMessage {
                Text(error)
            }
        }
        .onChange(of: llmService.errorMessage) { error in
            if error != nil {
                showError = true
            }
        }
    }
    
    // MARK: - Background
    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(red: 0.05, green: 0.1, blue: 0.2),
                Color(red: 0.1, green: 0.15, blue: 0.3),
                Color(red: 0.15, green: 0.1, blue: 0.25)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            // Floating particles
            ForEach(0..<20, id: \.self) { index in
                Circle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: .random(in: 20...60))
                    .position(
                        x: .random(in: 0...400),
                        y: .random(in: 0...800)
                    )
                    .animation(
                        Animation.easeInOut(duration: .random(in: 3...6))
                            .repeatForever(autoreverses: true)
                            .delay(.random(in: 0...2)),
                        value: UUID()
                    )
                    .blur(radius: 15)
            }
        )
    }
}

#Preview {
    InitializationView()
} 