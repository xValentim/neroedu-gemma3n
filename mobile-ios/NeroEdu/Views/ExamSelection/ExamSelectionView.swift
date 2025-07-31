//
//  ExamSelectionView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 26/07/25.
//

import SwiftUI

struct ExamSelectionView: View {
    @Binding var selectedExam: ExamType?
    @StateObject private var examManager = ExamManager.shared
    @State private var animateCards = false
    
    var body: some View {
        VStack(spacing: 40) {
            VStack(spacing: 16) {
                Text("Choose Your Exam")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("Select the exam you're preparing for")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(.top, 60)
            
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 16),
                GridItem(.flexible(), spacing: 16)
            ], spacing: 20) {
                ForEach(ExamType.allCases, id: \.self) { exam in
                    ExamSelectionCard(
                        exam: exam,
                        isSelected: selectedExam == exam
                    ) {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.6)) {
                            selectedExam = exam
                            examManager.setExam(exam)
                        }
                    }
                    .scaleEffect(animateCards ? 1.0 : 0.8)
                    .opacity(animateCards ? 1.0 : 0.0)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(Double(ExamType.allCases.firstIndex(of: exam) ?? 0) * 0.1), value: animateCards)
                }
            }
            .padding(.horizontal, 20)
            
            Spacer()
            
            // Continue button
            NavigationLink(destination: {
                HomeView(selectedExam: selectedExam ?? .sat)
            }) {
                Text("Continue")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(
                        LinearGradient(
                            colors: selectedExam != nil ? [
                                Color.green.opacity(0.8),
                                Color.blue.opacity(0.6)
                            ] : [
                                Color.gray.opacity(0.3),
                                Color.gray.opacity(0.2)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
            }
            .disabled(selectedExam == nil)
            .buttonStyle(ScaleButtonStyle())
            .padding(.horizontal, 30)
            .padding(.bottom, 50)
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.3)) {
                animateCards = true
            }
        }
    }
}

#Preview {
    ExamSelectionView(selectedExam: .constant(.enem))
}
