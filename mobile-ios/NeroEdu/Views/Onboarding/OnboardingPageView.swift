//
//  OnboardingPageView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 26/07/25.
//

import SwiftUI

struct OnboardingPageView: View {
    let page: OnboardingPage
    @State private var animateContent = false
    
    var body: some View {
        VStack(spacing: 40) {
            Spacer()
            
            // Illustration placeholder with glassmorphism
            illustrationView
            
            Spacer()
            
            // Content
            VStack(spacing: 24) {
                Text(page.title)
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.white, Color.blue.opacity(0.8)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .multilineTextAlignment(.center)
                    .scaleEffect(animateContent ? 1.0 : 0.8)
                    .opacity(animateContent ? 1.0 : 0.0)
                
                Text(page.description)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
                    .padding(.horizontal, 20)
                    .scaleEffect(animateContent ? 1.0 : 0.8)
                    .opacity(animateContent ? 1.0 : 0.0)
            }
            
            Spacer()
        }
        .padding(.horizontal, 30)
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.2)) {
                animateContent = true
            }
        }
    }
    
    private var illustrationView: some View {
        ZStack {
            // Glassmorphism container
            RoundedRectangle(cornerRadius: 30)
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
                    RoundedRectangle(cornerRadius: 30)
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
                .blur(radius: 0.5)
                .frame(width: 280, height: 280)
            
            // Icon/Illustration placeholder
            Image(systemName: page.iconName)
                .font(.system(size: 80, weight: .light))
                .foregroundStyle(
                    LinearGradient(
                        colors: page.gradientColors,
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .scaleEffect(animateContent ? 1.0 : 0.5)
                .rotationEffect(.degrees(animateContent ? 0 : -10))
        }
        .scaleEffect(animateContent ? 1.0 : 0.8)
        .opacity(animateContent ? 1.0 : 0.0)
    }
}
#Preview {
    OnboardingPageView(page: OnboardingPage.allPages[0])
}
