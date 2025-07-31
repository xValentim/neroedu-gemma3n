//
//  PracticeTestResultsView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct PracticeTestResultsView: View {
    let results: TestResults
    let subject: String
    let difficulty: Difficulty
    
    @State private var animateContent = false
    @State private var animateScore = false
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        ZStack {
            // Background
            backgroundGradient
                .ignoresSafeArea()
            
            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: 32) {
                    // Header
                    headerSection
                    
                    // Score section
                    scoreSection
                    
                    // Performance breakdown
                    performanceSection
                    
                    // Question review
                    questionReviewSection
                    
                    // Action buttons
                    actionButtonsSection
                    
                    // Bottom spacing
                    Color.clear.frame(height: 100)
                }
                .padding(.horizontal, 20)
                .padding(.top, 10)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.2)) {
                animateContent = true
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                withAnimation(.spring(response: 1.2, dampingFraction: 0.6)) {
                    animateScore = true
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
            // Trophy/Medal icon
            ZStack {
                Circle()
                    .fill(
                        /*LinearGradient(
                            colors: results.scoreColor.opacity(0.3) + [results.scoreColor.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )*/
                    )
                    .frame(width: 100, height: 100)
                    .overlay(
                        Circle()
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
                
                Image(systemName: results.scoreIcon)
                    .font(.system(size: 40, weight: .medium))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [results.scoreColor, results.scoreColor.opacity(0.7)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .scaleEffect(animateScore ? 1.0 : 0.8)
                    .rotationEffect(.degrees(animateScore ? 0 : -10))
            }
            .scaleEffect(animateContent ? 1.0 : 0.8)
            .animation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.1), value: animateContent)
            
            VStack(spacing: 8) {
                Text("Test Complete!")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("\(subject) • \(difficulty.displayName)")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
            }
        }
        .opacity(animateContent ? 1.0 : 0.0)
        .offset(y: animateContent ? 0 : -30)
    }
    
    // MARK: - Score Section
    private var scoreSection: some View {
        VStack(spacing: 20) {
            // Main score display
            VStack(spacing: 12) {
                Text("\(results.correctAnswers)/\(results.totalQuestions)")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [results.scoreColor, results.scoreColor.opacity(0.8)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .scaleEffect(animateScore ? 1.0 : 0.5)
                
                Text("\(results.percentage)%")
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundColor(.white)
                
                Text(results.performanceMessage)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                    .multilineTextAlignment(.center)
            }
            .padding(.vertical, 30)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 24)
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
                        RoundedRectangle(cornerRadius: 24)
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
            )
        }
        .scaleEffect(animateContent ? 1.0 : 0.9)
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.3), value: animateContent)
    }
    
    // MARK: - Performance Section
    private var performanceSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("Performance Breakdown")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
            }
            
            HStack(spacing: 16) {
                StatCard(
                    title: "Correct",
                    value: "\(results.correctAnswers)",
                    color: .green,
                    icon: "checkmark.circle.fill"
                )
                
                StatCard(
                    title: "Incorrect",
                    value: "\(results.incorrectAnswers)",
                    color: .red,
                    icon: "xmark.circle.fill"
                )
                
                StatCard(
                    title: "Time",
                    value: results.timeSpent,
                    color: .blue,
                    icon: "clock.fill"
                )
            }
        }
        .scaleEffect(animateContent ? 1.0 : 0.9)
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.5), value: animateContent)
    }
    
    // MARK: - Question Review Section
    private var questionReviewSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("Question Review")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
            }
            
            VStack(spacing: 12) {
                ForEach(Array(results.questionResults.enumerated()), id: \.offset) { index, result in
                    QuestionResultRow(
                        questionNumber: index + 1,
                        result: result
                    )
                    .animation(.spring().delay(Double(index) * 0.1), value: animateContent)
                }
            }
        }
        .scaleEffect(animateContent ? 1.0 : 0.9)
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.7), value: animateContent)
    }
    
    // MARK: - Action Buttons Section
    private var actionButtonsSection: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                // Try Again Button
                NavigationLink {
                    PracticeTestInputView()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 16, weight: .semibold))
                        Text("Try Again")
                            .font(.system(size: 16, weight: .semibold))
                    }
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
                
                
                // Share Results Button
                /*Button(action: {
                    // Share functionality
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 16, weight: .semibold))
                        Text("Share")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        LinearGradient(
                            colors: [.green, .teal],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(EnhancedButtonStyle())*/
            }
        }
        .scaleEffect(animateContent ? 1.0 : 0.9)
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.9), value: animateContent)
    }
}

#Preview {
    PracticeTestResultsView(results: .init(questionResults: [], correctAnswers: 0, totalQuestions: 5, timeSpent: "30"), subject: "History", difficulty: .easy)
}
