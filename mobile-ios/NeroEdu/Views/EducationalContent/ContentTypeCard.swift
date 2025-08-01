//
//  ContentTypeCard.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct ContentTypeCard: View {
    let contentType: ContentType
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: contentType.iconName)
                    .font(.system(size: 24, weight: .medium))
                    .foregroundColor(isSelected ? .purple : .white.opacity(0.8))
                
                Text(contentType.displayName)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(isSelected ? .purple : .white)
                    .multilineTextAlignment(.center)
                
                Text(contentType.description)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(isSelected ? .purple.opacity(0.8) : .white.opacity(0.6))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .frame(height: 100)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(
                        LinearGradient(
                            colors: isSelected ? [
                                Color.purple.opacity(0.3),
                                Color.purple.opacity(0.1)
                            ] : [
                                Color.white.opacity(0.1),
                                Color.white.opacity(0.05)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(
                                isSelected ? Color.purple.opacity(0.6) : Color.white.opacity(0.2),
                                lineWidth: isSelected ? 2 : 1
                            )
                    )
            )
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

#Preview {
    ContentTypeCard(contentType: .all, isSelected: true, action: {})
}
