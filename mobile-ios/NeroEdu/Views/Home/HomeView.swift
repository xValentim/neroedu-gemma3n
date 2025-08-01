//
//  HomeView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 26/07/25.
//

import SwiftUI
import Combine

struct HomeView: View {
    @State private var selectedExam: ExamType
    @StateObject private var examManager = ExamManager.shared
    @State private var animateContent = false
    @State private var currentTime = Date()
    
    init(selectedExam: ExamType = .sat) {
        self.selectedExam = selectedExam
    }
    
    // Timer to update time for dynamic greeting
    let timer = Timer.publish(every: 60, on: .main, in: .common).autoconnect()
    
    var body: some View {
        ZStack {
            // Dynamic background
            backgroundGradient
                .ignoresSafeArea()
            
            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: 32) {
                    // Header with greeting
                    headerSection
                    
                    // Motivation card
                    motivationCard
                    
                    // Main features
                    featuresSection
                    
                    // Quick stats or progress
                    //quickStatsSection
                    
                    // Bottom spacing
                    Color.clear.frame(height: 100)
                }
                .padding(.horizontal, 20)
                .padding(.top, 10)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 1.0, dampingFraction: 0.8).delay(0.2)) {
                animateContent = true
            }
        }
        .onReceive(timer) { _ in
            currentTime = Date()
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
            // Floating particles animation
            ForEach(0..<20, id: \.self) { index in
                Circle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: .random(in: 30...80))
                    .position(
                        x: .random(in: 0...400),
                        y: .random(in: 0...800)
                    )
                    .animation(
                        Animation.easeInOut(duration: .random(in: 4...8))
                            .repeatForever(autoreverses: true)
                            .delay(.random(in: 0...3)),
                        value: UUID()
                    )
                    .blur(radius: 10)
            }
        )
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text(greetingMessage)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                
                Text("Welcome back!")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.white, Color.blue.opacity(0.8)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
            }
            
            Spacer()
            
            // Profile/Settings button
            /*Button(action: {
                // Handle profile tap
            }) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.2),
                                    Color.white.opacity(0.1)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 50, height: 50)
                        .overlay(
                            Circle()
                                .stroke(Color.white.opacity(0.3), lineWidth: 1)
                        )
                    
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.white.opacity(0.9))
                }
            }
            .buttonStyle(ScaleButtonStyle())*/
        }
        .opacity(animateContent ? 1.0 : 0.0)
        .offset(y: animateContent ? 0 : -30)
    }
    
    // MARK: - Motivation Card
    private var motivationCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Ready to excel?")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Let's crush your \(selectedExam.name) preparation today!")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                        .lineLimit(2)
                }
                
                Spacer()
                
                Image(systemName: "target")
                    .font(.system(size: 30, weight: .medium))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.yellow, .orange],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
            
            // Study streak or next exam date
            HStack {
                /*VStack(alignment: .leading, spacing: 4) {
                    Text("Study Streak")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                    Text("12 days")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                }*/
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Exam Date")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.6))
                    Text(selectedExam.examDate)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                }
            }
        }
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.purple.opacity(0.3),
                            Color.blue.opacity(0.2)
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
    
    // MARK: - Features Section
    private var featuresSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("Main Features")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                Spacer()
            }
            
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 16),
                GridItem(.flexible(), spacing: 16)
            ], spacing: 16) {
                // Essay Review Feature
                NavigationLink {
                    EssayInputView()
                } label: {
                    FeatureCard(
                        feature: Feature(
                            title: "Essay Review",
                            description: "AI-powered feedback on your writing",
                            iconName: "pencil.and.outline",
                            gradientColors: [.orange, .red],
                            isLarge: false
                        )
                    )
                    .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.4), value: animateContent)
                }
                
                NavigationLink {
                    PracticeTestInputView(selectedExam: selectedExam)
                } label: {
                    // Practice Tests Feature
                    FeatureCard(
                        feature: Feature(
                            title: "Practice Tests",
                            description: "Realistic exam simulations",
                            iconName: "doc.text.fill",
                            gradientColors: [.green, .blue],
                            isLarge: false
                        )
                    )
                    .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.5), value: animateContent)
                }
                
            }
            
            // Study Materials - Full Width
            NavigationLink {
                StudyMaterialInputView(selectedExam: selectedExam)
            } label: {
                FeatureCard(
                    feature: Feature(
                        title: "Study Materials",
                        description: "Personalized flashcards, notes, and study guides generated by AI",
                        iconName: "brain.head.profile",
                        gradientColors: [.purple, .pink],
                        isLarge: true
                    )
                )
                .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.6), value: animateContent)
            }
        }
    }
    
    // MARK: - Quick Stats Section
    private var quickStatsSection: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Your Progress")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
            }
            
            HStack(spacing: 16) {
                StatCard(
                    title: "Completed",
                    value: "24",
                    subtitle: "Practice Tests",
                    color: .green
                )
                
                StatCard(
                    title: "Average Score",
                    value: "87%",
                    subtitle: "Last 5 Tests",
                    color: .blue
                )
                
                StatCard(
                    title: "Time Studied",
                    value: "42h",
                    subtitle: "This Month",
                    color: .purple
                )
            }
        }
        .scaleEffect(animateContent ? 1.0 : 0.9)
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.7), value: animateContent)
    }
    
    // MARK: - Computed Properties
    private var greetingMessage: String {
        let hour = Calendar.current.component(.hour, from: currentTime)
        
        switch hour {
        case 5..<12:
            return "Good morning ☀️"
        case 12..<18:
            return "Good afternoon 🌤️"
        case 18..<22:
            return "Good evening 🌅"
        default:
            return "Good night 🌙"
        }
    }
}

#Preview {
    HomeView()
}
