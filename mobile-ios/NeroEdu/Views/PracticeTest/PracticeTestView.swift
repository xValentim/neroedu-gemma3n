//
//  PracticeTestView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct PracticeTestView: View {
    let questions: [Question]
    let subject: String
    let difficulty: Difficulty
    
    @StateObject private var viewModel = PracticeTestViewModel()
    @State private var animateContent = false
    @State private var navigateToResults = false
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        ZStack {
            // Background
            backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header with progress
                headerSection
                
                // Question content
                questionContentSection
                
                // Answer options
                answerOptionsSection
                
                // Navigation buttons
                navigationButtonsSection
            }
            .padding(.horizontal, 20)
        }
        .onAppear {
            viewModel.setup(questions: questions)
            withAnimation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.2)) {
                animateContent = true
            }
        }
        .background(
            Group {
                if let testResults = viewModel.testResults {
                    NavigationLink(
                        destination: PracticeTestResultsView(
                            results: testResults,
                            subject: subject,
                            difficulty: difficulty
                        ),
                        isActive: $navigateToResults
                    ) {
                        EmptyView()
                    }
                } else {
                    EmptyView()
                }
            }
        )
        .onChange(of: viewModel.isTestComplete) { complete in
            if complete {
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    navigateToResults = true
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
            // Progress bar
            VStack(spacing: 8) {
                HStack {
                    Text("Question \(viewModel.currentQuestionIndex + 1) of \(viewModel.totalQuestions)")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Text(subject)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                }
                
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.white.opacity(0.2))
                            .frame(height: 6)
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(
                                LinearGradient(
                                    colors: [.green, .blue],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(
                                width: geometry.size.width * viewModel.progress,
                                height: 6
                            )
                            .animation(.spring(), value: viewModel.progress)
                    }
                }
                .frame(height: 6)
            }
        }
        .padding(.top, 10)
        .opacity(animateContent ? 1.0 : 0.0)
        .offset(y: animateContent ? 0 : -20)
    }
    
    // MARK: - Question Content Section
    private var questionContentSection: some View {
        VStack(spacing: 20) {
            if let currentQuestion = viewModel.currentQuestion {
                Text(currentQuestion.question)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
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
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))
            }
        }
        .padding(.top, 20)
        .animation(.spring(response: 0.6, dampingFraction: 0.8), value: viewModel.currentQuestionIndex)
    }
    
    // MARK: - Answer Options Section
    private var answerOptionsSection: some View {
        VStack(spacing: 16) {
            if let currentQuestion = viewModel.currentQuestion {
                ForEach(Array(currentQuestion.options.enumerated()), id: \.offset) { index, option in
                    AnswerOptionView(
                        option: option,
                        index: index,
                        isSelected: viewModel.selectedAnswer == index,
                        isCorrect: viewModel.showResult ? index == currentQuestion.correctAnswer : nil,
                        showResult: viewModel.showResult
                    ) {
                        if !viewModel.showResult {
                            withAnimation(.spring()) {
                                viewModel.selectAnswer(index)
                            }
                        }
                    }
                    .transition(.asymmetric(
                        insertion: .scale(scale: 0.8).combined(with: .opacity).animation(.spring().delay(Double(index) * 0.1)),
                        removal: .opacity
                    ))
                }
            }
        }
        .padding(.top, 20)
    }
    
    // MARK: - Navigation Buttons Section
    private var navigationButtonsSection: some View {
        VStack(spacing: 16) {
            if !viewModel.showResult {
                // Submit Answer Button
                if viewModel.selectedAnswer != nil {
                    Button(action: {
                        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                        impactFeedback.impactOccurred()
                        
                        viewModel.submitAnswer()
                    }) {
                        Text("Submit Answer")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(
                                    colors: [.blue, .purple],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    .buttonStyle(EnhancedButtonStyle())
                    .transition(.scale.combined(with: .opacity))
                }
            } else {
                // Next Question Button
                Button(action: {
                    viewModel.nextQuestion()
                }) {
                    HStack(spacing: 8) {
                        Text(viewModel.isLastQuestion ? "View Results" : "Next Question")
                            .font(.system(size: 18, weight: .semibold))
                        
                        Image(systemName: viewModel.isLastQuestion ? "chart.bar.fill" : "arrow.right")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        LinearGradient(
                            colors: viewModel.isLastQuestion ? [.orange, .red] : [.green, .teal],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(EnhancedButtonStyle())
                .transition(.scale.combined(with: .opacity))
            }
        }
        .padding(.top, 20)
        .padding(.bottom, 40)
    }
}

#Preview {
    PracticeTestView(questions: [], subject: "History", difficulty: .easy)
}
