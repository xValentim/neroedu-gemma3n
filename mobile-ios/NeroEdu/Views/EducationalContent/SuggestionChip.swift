//
//  SuggestionChip.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct SuggestionChip: View {
    let suggestion: TopicSuggestion
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(suggestion.title)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.15))
                        .overlay(
                            Capsule()
                                .stroke(Color.white.opacity(0.3), lineWidth: 1)
                        )
                )
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

#Preview {
    SuggestionChip(suggestion: .calculus, action: {})
}
