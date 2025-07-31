//
//  StudyMaterialView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct StudyMaterialView: View {
    let topic: String
    let summary: StudySummary
    let keyPoints: [KeyPoint]
    let flashcards: [Flashcard]
    
    @State private var animateContent = false
    @State private var currentSection: StudySection = .summary
    @State private var currentFlashcardIndex = 0
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        ZStack {
            // Background
            backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                headerSection
                
                // Content navigation
                contentNavigationSection
                
                // Main content
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 24) {
                        switch currentSection {
                        case .summary:
                            summarySection
                        case .keyPoints:
                            keyPointsSection
                        case .flashcards:
                            flashcardsSection
                        }
                        
                        // Bottom spacing
                        Color.clear.frame(height: 100)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                }
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.2)) {
                animateContent = true
            }
        }
    }
    
    // MARK: - Background
    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(red: 0.1, green: 0.05, blue: 0.2),
                Color(red: 0.15, green: 0.1, blue: 0.3),
                Color(red: 0.2, green: 0.15, blue: 0.35)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 16) {
            VStack(spacing: 8) {
                Text(topic)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 10)
        .opacity(animateContent ? 1.0 : 0.0)
        .offset(y: animateContent ? 0 : -20)
    }
    
    // MARK: - Content Navigation Section
    private var contentNavigationSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(StudySection.allCases, id: \.self) { section in
                    ContentNavButton(
                        section: section,
                        isSelected: currentSection == section
                    ) {
                        withAnimation(.spring()) {
                            currentSection = section
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
        }
        .padding(.top, 16)
    }
    
    // MARK: - Summary Section
    private var summarySection: some View {
        VStack(spacing: 24) {
            // Main summary
            VStack(spacing: 16) {
                HStack {
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.purple)
                    
                    Text("Summary")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                }
                
                Text(summary.content)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                    .lineSpacing(6)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(24)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.15),
                                Color.white.opacity(0.08)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
            )
            .scaleEffect(animateContent ? 1.0 : 0.9)
            .opacity(animateContent ? 1.0 : 0.0)
            .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.3), value: animateContent)
        }
    }
    
    // MARK: - Key Points Section
    private var keyPointsSection: some View {
        VStack(spacing: 20) {
            HStack {
                Image(systemName: "star.fill")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.yellow)
                
                Text("Key Points")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                
                Spacer()
            }
            
            VStack(spacing: 16) {
                ForEach(Array(keyPoints.enumerated()), id: \.offset) { index, keyPoint in
                    KeyPointCard(keyPoint: keyPoint, index: index + 1)
                        .scaleEffect(animateContent ? 1.0 : 0.9)
                        .opacity(animateContent ? 1.0 : 0.0)
                        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.3 + Double(index) * 0.1), value: animateContent)
                }
            }
        }
    }
    
    // MARK: - Flashcards Section
    private var flashcardsSection: some View {
        VStack(spacing: 24) {
            // Header with counter
            HStack {
                Image(systemName: "rectangle.stack.fill")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.blue)
                
                Text("Flashcards")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("\(currentFlashcardIndex + 1) of \(flashcards.count)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        Capsule()
                            .fill(Color.white.opacity(0.1))
                    )
            }
            
            // Current flashcard
            if currentFlashcardIndex < flashcards.count {
                FlashcardView(flashcard: flashcards[currentFlashcardIndex])
                    .scaleEffect(animateContent ? 1.0 : 0.9)
                    .opacity(animateContent ? 1.0 : 0.0)
                    .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.3), value: animateContent)
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: currentFlashcardIndex)
            }
            
            // Navigation buttons
            HStack(spacing: 16) {
                Button(action: {
                    if currentFlashcardIndex > 0 {
                        withAnimation(.spring()) {
                            currentFlashcardIndex -= 1
                        }
                    }
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 14, weight: .semibold))
                        Text("Previous")
                            .font(.system(size: 16, weight: .medium))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(currentFlashcardIndex > 0 ? 0.15 : 0.05))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
                            )
                    )
                }
                .disabled(currentFlashcardIndex == 0)
                .buttonStyle(ScaleButtonStyle())
                
                Button(action: {
                    if currentFlashcardIndex < flashcards.count - 1 {
                        withAnimation(.spring()) {
                            currentFlashcardIndex += 1
                        }
                    }
                }) {
                    HStack(spacing: 8) {
                        Text("Next")
                            .font(.system(size: 16, weight: .medium))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(currentFlashcardIndex < flashcards.count - 1 ? 0.15 : 0.05))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
                            )
                    )
                }
                .disabled(currentFlashcardIndex == flashcards.count - 1)
                .buttonStyle(ScaleButtonStyle())
            }
        }
    }
}

#Preview {
    StudyMaterialView(topic: "World War II", summary: .init(content: "Hello"), keyPoints: [], flashcards: [])
}
