//
//  FeatureCard.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 26/07/25.
//

import SwiftUI

struct FeatureCard: View {
    let feature: Feature
    
    var body: some View {
        VStack(alignment: .leading, spacing: feature.isLarge ? 16 : 12) {
            HStack {
                // Icon
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: feature.gradientColors.map { $0.opacity(0.3) },
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: feature.isLarge ? 50 : 40, height: feature.isLarge ? 50 : 40)
                    
                    Image(systemName: feature.iconName)
                        .font(.system(size: feature.isLarge ? 24 : 20, weight: .medium))
                        .foregroundStyle(
                            LinearGradient(
                                colors: feature.gradientColors,
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                }
                
                if !feature.isLarge {
                    Spacer()
                }
            }
            
            VStack(alignment: .leading, spacing: 6) {
                Text(feature.title)
                    .font(.system(size: feature.isLarge ? 20 : 16, weight: .bold))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.leading)
                
                Text(feature.description)
                    .multilineTextAlignment(.leading)
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.white.opacity(0.7))
                    .lineLimit(3)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            if feature.isLarge {
                Spacer()
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
       // .frame(height: feature.isLarge ? 120 : 100)
        .padding(feature.isLarge ? 20 : 16)
        .background(
            RoundedRectangle(cornerRadius: 16)
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
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
        )
    }
}

#Preview {
    FeatureCard(feature: .init(title: "Essay Corrector", description: "Essay", iconName: "book", gradientColors: [.accentColor, .blue], isLarge: true))
}
    
