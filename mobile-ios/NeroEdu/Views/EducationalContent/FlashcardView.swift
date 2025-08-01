//
//  FlashcardView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct FlashcardView: View {
    let flashcard: Flashcard
    @State private var isFlipped = false
    @State private var dragOffset = CGSize.zero
    
    var body: some View {
        ZStack {
            // Back side (Answer)
            if isFlipped {
                VStack(spacing: 20) {
                    HStack {
                        Image(systemName: "lightbulb.fill")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.yellow)
                        
                        Text("Answer")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white.opacity(0.7))
                        
                        Spacer()
                        
                        Button("Flip") {
                            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                                isFlipped.toggle()
                            }
                        }
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.blue)
                    }
                    
                    Text(flashcard.answer)
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.white)
                        .lineSpacing(6)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .padding(32)
                .frame(height: 250)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.green.opacity(0.2),
                                    Color.teal.opacity(0.15)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(Color.green.opacity(0.3), lineWidth: 1)
                        )
                )
                .rotation3DEffect(.degrees(isFlipped ? 0 : 180), axis: (x: 0, y: 1, z: 0))
            }
            
            // Front side (Question)
            if !isFlipped {
                VStack(spacing: 20) {
                    HStack {
                        Image(systemName: "questionmark.circle.fill")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.blue)
                        
                        Text("Question")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white.opacity(0.7))
                        
                        Spacer()
                        
                        Button("Flip") {
                            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                                isFlipped.toggle()
                            }
                        }
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.blue)
                    }
                    
                    Text(flashcard.question)
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.white)
                        .lineSpacing(6)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .padding(32)
                .frame(height: 250)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.blue.opacity(0.2),
                                    Color.purple.opacity(0.15)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(Color.blue.opacity(0.3), lineWidth: 1)
                        )
                )
                .rotation3DEffect(.degrees(isFlipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))
            }
        }
        .offset(dragOffset)
        .scaleEffect(1.0 - abs(dragOffset.width) / 1000)
        .rotation3DEffect(.degrees(Double(dragOffset.width / 10)), axis: (x: 0, y: 1, z: 0))
        .gesture(
            DragGesture()
                .onChanged { value in
                    dragOffset = value.translation
                }
                .onEnded { value in
                    withAnimation(.spring()) {
                        if abs(value.translation.width) > 100 {
                            isFlipped.toggle()
                        }
                        dragOffset = .zero
                    }
                }
        )
        .onTapGesture {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                isFlipped.toggle()
            }
        }
    }
}

#Preview {
    FlashcardView(flashcard: .init(question: "1+1?", answer: "2"))
}
