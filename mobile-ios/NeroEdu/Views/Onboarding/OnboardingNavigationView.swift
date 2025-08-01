//
//  OnboardingNavigationView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 26/07/25.
//

import SwiftUI

struct OnboardingNavigationView: View {
    @Binding var currentPage: Int
    let totalPages: Int
    let onNext: () -> Void
    let onSkip: () -> Void
    
    var body: some View {
        VStack(spacing: 30) {
            // Page indicator
            HStack(spacing: 8) {
                ForEach(0..<totalPages, id: \.self) { index in
                    Circle()
                        .fill(currentPage == index ? Color.white : Color.white.opacity(0.3))
                        .frame(width: currentPage == index ? 12 : 8, height: currentPage == index ? 12 : 8)
                        .animation(.easeInOut(duration: 0.3), value: currentPage)
                }
            }
            
            // Buttons
            HStack(spacing: 20) {
                // Skip button
                Button(action: onSkip) {
                    Text("Skip")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                }
                
                Spacer()
                
                // Next/Get Started button
                Button(action: onNext) {
                    HStack(spacing: 8) {
                        Text(currentPage == totalPages - 1 ? "Get Started" : "Next")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                        
                        if currentPage < totalPages - 1 {
                            Image(systemName: "arrow.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                        }
                    }
                    .padding(.horizontal, 28)
                    .padding(.vertical, 16)
                    .background(
                        LinearGradient(
                            colors: [
                                Color.blue.opacity(0.8),
                                Color.purple.opacity(0.6)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 25)
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 25))
                }
                .buttonStyle(ScaleButtonStyle())
            }
            .padding(.horizontal, 30)
        }
        .padding(.bottom, 50)
    }
}

#Preview {
    OnboardingNavigationView(
        currentPage: .constant(1), totalPages: 5, onNext: {}, onSkip: {})
}
