//
//  StudyMaterialInputView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct StudyMaterialInputView: View {
    @StateObject private var viewModel: StudyMaterialInputViewModel
    @State private var animateContent = false
    @State private var navigateToContent = false
    
    init(selectedExam: ExamType = .sat) {
        self._viewModel = StateObject(wrappedValue: StudyMaterialInputViewModel(examType: selectedExam))
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
                        
                        // Topic Input
                        topicInputSection
                        

                        
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
                destination: StudyMaterialView(
                    topic: viewModel.topic,
                    summary: viewModel.generatedSummary,
                    keyPoints: viewModel.generatedKeyPoints,
                    flashcards: viewModel.generatedFlashcards
                ),
                isActive: $navigateToContent
            ) {
                EmptyView()
            }
        )
        .onChange(of: viewModel.contentReady) { ready in
            if ready {
                withAnimation(.spring()) {
                    navigateToContent = true
                }
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
            // Brain icon with particles
            ZStack {
                // Floating particles
                ForEach(0..<6, id: \.self) { index in
                    Circle()
                        .fill(Color.purple.opacity(0.6))
                        .frame(width: 4, height: 4)
                        .offset(
                            x: cos(Double(index) * .pi / 3) * 50,
                            y: sin(Double(index) * .pi / 3) * 50
                        )
                        .scaleEffect(animateContent ? 1.0 : 0.3)
                        .animation(
                            Animation.easeInOut(duration: 2.0)
                                .repeatForever(autoreverses: true)
                                .delay(Double(index) * 0.3),
                            value: animateContent
                        )
                }
                
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.purple.opacity(0.3), Color.pink.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 100, height: 100)
                    .overlay(
                        Circle()
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
                
                Image(systemName: "brain.head.profile")
                    .font(.system(size: 40, weight: .medium))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.purple, .pink],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .scaleEffect(animateContent ? 1.0 : 0.8)
                    .rotationEffect(.degrees(animateContent ? 0 : -10))
            }
            .scaleEffect(animateContent ? 1.0 : 0.8)
            .animation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.1), value: animateContent)
            
            VStack(spacing: 8) {
                Text("AI Study Materials")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("AI-powered summaries and flashcards for any topic")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
                
                // AI Status Indicator
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 8, height: 8)
                    
                    Text("AI Ready")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.1))
                )
                .padding(.top, 8)
            }
        }
        .opacity(animateContent ? 1.0 : 0.0)
        .offset(y: animateContent ? 0 : -30)
    }
    

    
    // MARK: - Topic Input Section
    private var topicInputSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("What would you like to study?")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
            }
            
            VStack(spacing: 16) {
                TextField("Enter a topic (e.g., Photosynthesis, World War II, Calculus)", text: $viewModel.topic)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 18)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
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
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.white.opacity(0.3), lineWidth: 1)
                            )
                    )
                    .accentColor(.purple)
                
                // Suggestion chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(TopicSuggestion.allCases, id: \.self) { suggestion in
                            SuggestionChip(suggestion: suggestion) {
                                withAnimation(.spring()) {
                                    viewModel.topic = suggestion.title
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
        .scaleEffect(animateContent ? 1.0 : 0.9)
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.3), value: animateContent)
    }
    
    // MARK: - Generate Button Section
    private var generateButtonSection: some View {
        VStack(spacing: 16) {
            if viewModel.canGenerate && !viewModel.isGenerating {
                Button(action: {
                    let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedback.impactOccurred()
                    
                    viewModel.generateContent()
                }) {
                    HStack(spacing: 12) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                        
                        Text("Generate AI Study Materials")
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
                            colors: [.purple, .pink],
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
                        color: Color.purple.opacity(0.4),
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
        VStack(spacing: 20) {
            // Animated progress with stages
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.2), lineWidth: 4)
                        .frame(width: 80, height: 80)
                    
                    Circle()
                        .trim(from: 0, to: viewModel.generationProgress)
                        .stroke(
                            LinearGradient(colors: [.purple, .pink], startPoint: .leading, endPoint: .trailing),
                            style: StrokeStyle(lineWidth: 4, lineCap: .round)
                        )
                        .frame(width: 80, height: 80)
                        .rotationEffect(.degrees(-90))
                        .animation(.easeInOut(duration: 0.5), value: viewModel.generationProgress)
                    
                    Image(systemName: "brain.head.profile")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(.white)
                        .scaleEffect(viewModel.isGenerating ? 1.1 : 1.0)
                        .animation(.easeInOut(duration: 1).repeatForever(autoreverses: true), value: viewModel.isGenerating)
                }
                
                Text("\(Int(viewModel.generationProgress * 100))%")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
            }
            
            VStack(spacing: 8) {
                Text(viewModel.currentGenerationStage)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                    .animation(.easeInOut, value: viewModel.currentGenerationStage)
                
                Text("Creating personalized content for \(viewModel.topic)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
                

            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.purple.opacity(0.2),
                            Color.pink.opacity(0.15)
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
    StudyMaterialInputView(selectedExam: .sat)
}
