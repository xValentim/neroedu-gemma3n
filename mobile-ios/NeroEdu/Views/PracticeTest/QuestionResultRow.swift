//
//  QuestionResultRow.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct QuestionResultRow: View {
    let questionNumber: Int
    let result: QuestionResult
    
    var body: some View {
        HStack(spacing: 16) {
            // Question number
            Text("\(questionNumber)")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
                .frame(width: 32, height: 32)
                .background(
                    Circle()
                        .fill(Color.white.opacity(0.2))
                )
            
            // Question text (truncated)
            Text(result.question)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white)
                .lineLimit(2)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Result icon
            Image(systemName: result.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(result.isCorrect ? .green : .red)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: result.isCorrect ? [
                            Color.green.opacity(0.15),
                            Color.green.opacity(0.05)
                        ] : [
                            Color.red.opacity(0.15),
                            Color.red.opacity(0.05)
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(
                            result.isCorrect ? Color.green.opacity(0.3) : Color.red.opacity(0.3),
                            lineWidth: 1
                        )
                )
        )
    }
}


#Preview {
    QuestionResultRow(questionNumber: 0, result: .init(question: "Question", userAnswer: 0, correctAnswer: 0, isCorrect: true))
}
