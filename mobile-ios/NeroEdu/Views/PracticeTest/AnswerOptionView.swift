//
//  AnswerOptionView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct AnswerOptionView: View {
    let option: String
    let index: Int
    let isSelected: Bool
    let isCorrect: Bool?
    let showResult: Bool
    let action: () -> Void
    
    private var optionLetter: String {
        return String(UnicodeScalar(65 + index)!)
    }
    
    private var backgroundColor: LinearGradient {
        if showResult {
            if isCorrect == true {
                return LinearGradient(colors: [.green.opacity(0.3), .green.opacity(0.1)], startPoint: .leading, endPoint: .trailing)
            } else if isSelected && isCorrect == false {
                return LinearGradient(colors: [.red.opacity(0.3), .red.opacity(0.1)], startPoint: .leading, endPoint: .trailing)
            }
        } else if isSelected {
            return LinearGradient(colors: [.blue.opacity(0.3), .blue.opacity(0.1)], startPoint: .leading, endPoint: .trailing)
        }
        
        return LinearGradient(colors: [Color.white.opacity(0.1), Color.white.opacity(0.05)], startPoint: .leading, endPoint: .trailing)
    }
    
    private var borderColor: Color {
        if showResult {
            if isCorrect == true {
                return .green
            } else if isSelected && isCorrect == false {
                return .red
            }
        } else if isSelected {
            return .blue
        }
        
        return Color.white.opacity(0.2)
    }
    
    private var iconName: String? {
        if showResult {
            if isCorrect == true {
                return "checkmark.circle.fill"
            } else if isSelected && isCorrect == false {
                return "xmark.circle.fill"
            }
        }
        return nil
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Option letter
                Text(optionLetter)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 32, height: 32)
                    .background(
                        Circle()
                            .fill(Color.white.opacity(0.2))
                    )
                
                // Option text
                Text(option)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                // Result icon
                if let iconName = iconName {
                    Image(systemName: iconName)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(isCorrect == true ? .green : .red)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(backgroundColor)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(borderColor, lineWidth: isSelected || showResult ? 2 : 1)
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isSelected ? 1.02 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
        .animation(.spring(response: 0.4, dampingFraction: 0.6), value: showResult)
    }
}

#Preview {
    AnswerOptionView(option: "A", index: 0, isSelected: true, isCorrect: false, showResult: true, action: {})
}
