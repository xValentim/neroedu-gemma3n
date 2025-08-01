//
//  Onboarding.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 25/07/25.
//

import SwiftUI

struct OnboardingPage {
    let title: String
    let description: String
    let iconName: String
    let gradientColors: [Color]
    
    static let allPages = [
        OnboardingPage(
            title: "Welcome to NeroEdu",
            description: "Your AI-powered companion for acing any standardized exam. Get personalized study plans and real-time feedback.",
            iconName: "graduationcap.fill",
            gradientColors: [.blue, .purple]
        ),
        OnboardingPage(
            title: "AI-Powered Learning",
            description: "Advanced machine learning analyzes your strengths and weaknesses to create a tailored study experience just for you.",
            iconName: "brain.head.profile",
            gradientColors: [.purple, .pink]
        ),
        OnboardingPage(
            title: "Smart Practice Tests",
            description: "Take realistic practice exams with instant scoring and detailed explanations for every question.",
            iconName: "doc.text.fill",
            gradientColors: [.green, .blue]
        ),
        OnboardingPage(
            title: "Essay Review & Feedback",
            description: "Upload your essays and get instant AI feedback on structure, grammar, and content to improve your writing.",
            iconName: "pencil.and.outline",
            gradientColors: [.orange, .red]
        )
    ]
}
