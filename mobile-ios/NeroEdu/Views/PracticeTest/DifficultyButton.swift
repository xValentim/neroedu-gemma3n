//
//  DifficultyButton.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct DifficultyButton: View {
    let difficulty: Difficulty
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Text(difficulty.displayName)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(isSelected ? .blue : .white)
                
                Text(difficulty.description)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(isSelected ? .blue.opacity(0.8) : .white.opacity(0.6))
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(
                        LinearGradient(
                            colors: isSelected ? [
                                Color.blue.opacity(0.3),
                                Color.blue.opacity(0.1)
                            ] : [
                                Color.white.opacity(0.1),
                                Color.white.opacity(0.05)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(
                                isSelected ? Color.blue.opacity(0.6) : Color.white.opacity(0.2),
                                lineWidth: isSelected ? 2 : 1
                            )
                    )
            )
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

#Preview {
    DifficultyButton(difficulty: .easy, isSelected: true, action: {})
}
