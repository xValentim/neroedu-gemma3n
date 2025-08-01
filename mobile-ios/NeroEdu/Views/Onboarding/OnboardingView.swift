//
//  OnboardingView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 26/07/25.
//

import SwiftUI

struct OnboardingView: View {
    @State private var currentPage = 0
    @State private var selectedExam: ExamType? = nil
    @State private var showExamSelection = false
    
    private let pages = OnboardingPage.allPages
    
    var body: some View {
        ZStack {
            // Dynamic background gradient
            backgroundGradient
                .ignoresSafeArea()
            
            if showExamSelection {
                ExamSelectionView(selectedExam: $selectedExam)
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing),
                        removal: .move(edge: .leading)
                    ))
            } else {
                VStack(spacing: 0) {
                    // Top content area
                    TabView(selection: $currentPage) {
                        ForEach(0..<pages.count, id: \.self) { index in
                            OnboardingPageView(page: pages[index])
                                .tag(index)
                        }
                    }
                    .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
                    .animation(.easeInOut(duration: 0.6), value: currentPage)
                    
                    // Bottom navigation area
                    OnboardingNavigationView(
                        currentPage: $currentPage,
                        totalPages: pages.count,
                        onNext: nextPage,
                        onSkip: skipToExamSelection
                    )
                }
            }
        }
        .animation(.spring(response: 0.8, dampingFraction: 0.8), value: showExamSelection)
    }
    
    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(red: 0.1, green: 0.1, blue: 0.2),
                Color(red: 0.2, green: 0.1, blue: 0.3),
                Color(red: 0.1, green: 0.2, blue: 0.4)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            // Animated background particles
            ForEach(0..<15, id: \.self) { _ in
                Circle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: .random(in: 20...100))
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
                    .blur(radius: 20)
            }
        )
    }
    
    private func nextPage() {
        if currentPage < pages.count - 1 {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                currentPage += 1
            }
        } else {
            skipToExamSelection()
        }
    }
    
    private func skipToExamSelection() {
        withAnimation(.spring(response: 0.8, dampingFraction: 0.7)) {
            showExamSelection = true
        }
    }
}

#Preview {
    OnboardingView()
}
