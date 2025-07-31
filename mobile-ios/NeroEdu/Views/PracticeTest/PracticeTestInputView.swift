//
//  PracticeTestInputView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct PracticeTestInputView: View {
    @StateObject private var viewModel: PracticeTestInputViewModel
    @State private var animateContent = false
    @State private var navigateToTest = false
    
    init(selectedExam: ExamType = .sat) {
        self._viewModel = StateObject(wrappedValue: PracticeTestInputViewModel(examType: selectedExam))
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                backgroundGradient
                    .ignoresSafeArea()
                
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 32) {
                        // Header
                        headerSection
                        
                        // Subject Selection
                        subjectSelectionSection
                        
                        // Custom Topic Input
                        if viewModel.selectedSubject == .custom {
                            customTopicSection
                        }
                        
                        // Difficulty Selection
                        difficultySelectionSection
                        
                        // Generate Button
                        generateButtonSection
                        
                        // Processing
                        if viewModel.isGenerating {
                            generatingSection
                        }
                        
                        // Bottom spacing
                        Color.clear.frame(height: 100)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 10)
                }
            }
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.2)) {
                animateContent = true
            }
        }
        .background(
            NavigationLink(
                destination: PracticeTestView(questions: viewModel.generatedQuestions,
                                              subject: viewModel.selectedSubject.displayName,
                                              difficulty: viewModel.selectedDifficulty),
                isActive: $navigateToTest
            ) {
                EmptyView()
            }
        )
        .onChange(of: viewModel.questionsReady) { ready in
            if ready {
                withAnimation(.spring()) {
                    navigateToTest = true
                }
            }
        }
    }
    
    // MARK: - Background
    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(red: 0.05, green: 0.15, blue: 0.25),
                Color(red: 0.1, green: 0.2, blue: 0.35),
                Color(red: 0.15, green: 0.15, blue: 0.3)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 16) {
            // Quiz icon with animation
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.green.opacity(0.3), Color.blue.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 90, height: 90)
                    .overlay(
                        Circle()
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
                
                Image(systemName: "doc.text.fill")
                    .font(.system(size: 36, weight: .medium))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.green, .blue],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .rotationEffect(.degrees(animateContent ? 0 : -10))
            }
            .scaleEffect(animateContent ? 1.0 : 0.8)
            .animation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.1), value: animateContent)
            
            VStack(spacing: 8) {
                Text("Practice Test")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("Generate AI-powered questions for any subject")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
            }
        }
        .opacity(animateContent ? 1.0 : 0.0)
        .offset(y: animateContent ? 0 : -30)
    }
    
    // MARK: - Subject Selection Section
    private var subjectSelectionSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("Choose Subject")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
            }
            
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 16) {
                
                ForEach(Subject.allCases, id: \.self) { subject in
                    SubjectCard(
                        subject: subject,
                        isSelected: viewModel.selectedSubject == subject
                    ) {
                        withAnimation(.spring()) {
                            viewModel.selectedSubject = subject
                        }
                    }
                }
            }
        }
        .scaleEffect(animateContent ? 1.0 : 0.9)
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.3), value: animateContent)
    }
    
    // MARK: - Custom Topic Section
    private var customTopicSection: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Custom Topic")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
            }
            
            TextField("Enter your topic (e.g., Photosynthesis, World War II)", text: $viewModel.customTopic)
                .font(.system(size: 16))
                .foregroundColor(.white)
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.1),
                                    Color.white.opacity(0.05)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )
                )
                .accentColor(.blue)
        }
        .transition(.opacity.combined(with: .scale))
    }
    
    // MARK: - Difficulty Selection Section
    private var difficultySelectionSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("Difficulty Level")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
            }
            
            HStack(spacing: 12) {
                ForEach(Difficulty.allCases, id: \.self) { difficulty in
                    DifficultyButton(
                        difficulty: difficulty,
                        isSelected: viewModel.selectedDifficulty == difficulty
                    ) {
                        withAnimation(.spring()) {
                            viewModel.selectedDifficulty = difficulty
                        }
                    }
                }
            }
        }
        .scaleEffect(animateContent ? 1.0 : 0.9)
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.5), value: animateContent)
    }
    
    // MARK: - Generate Button Section
    private var generateButtonSection: some View {
        VStack(spacing: 16) {
            if viewModel.canGenerate && !viewModel.isGenerating {
                Button(action: {
                    let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedback.impactOccurred()
                    
                    viewModel.generateQuestions()
                }) {
                    HStack(spacing: 12) {
                        Image(systemName: "brain.head.profile")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                        
                        Text("Generate 5 Questions")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                        
                        Image(systemName: "arrow.right.circle.fill")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(
                        LinearGradient(
                            colors: [.green, .blue],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.white.opacity(0.3), lineWidth: 1)
                    )
                    .shadow(
                        color: Color.green.opacity(0.4),
                        radius: 15,
                        x: 0,
                        y: 8
                    )
                }
                .buttonStyle(EnhancedButtonStyle())
                .transition(.asymmetric(
                    insertion: .scale(scale: 0.8).combined(with: .move(edge: .bottom)),
                    removal: .opacity
                ))
                .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.7), value: viewModel.canGenerate)
            }
        }
    }
    
    // MARK: - Generating Section
    private var generatingSection: some View {
        VStack(spacing: 8) {
            Text("Generating Questions...")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(.white)
            
            Text("AI is creating personalized questions for \(viewModel.getSubjectTitle())")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding()
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.green.opacity(0.2),
                            Color.blue.opacity(0.15)
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
        .transition(.scale.combined(with: .opacity))
    }
}


#Preview {
    PracticeTestInputView(selectedExam: .sat)
}
