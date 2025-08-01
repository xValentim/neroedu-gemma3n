//
//  PracticeTestInputViewModel.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI
import Combine

class PracticeTestInputViewModel: ObservableObject {
    @Published var selectedSubject: Subject = .math
    @Published var customTopic = ""
    @Published var selectedDifficulty: Difficulty = .medium
    @Published var isGenerating = false
    @Published var generationProgress: CGFloat = 0.0
    @Published var generatedQuestions: [Question] = []
    @Published var questionsReady = false
    
    private let llmService = LLMService.shared
    private let examType: ExamType
    
    init(examType: ExamType = .sat) {
        self.examType = examType
    }
    
    var canGenerate: Bool {
        return selectedSubject != .custom || !customTopic.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    func getSubjectTitle() -> String {
        return selectedSubject == .custom ? customTopic : selectedSubject.displayName
    }
    
    func generateQuestions() {
        guard canGenerate else { return }
        
        isGenerating = true
        generationProgress = 0.0
        questionsReady = false
        
        // Simulate progressive generation for UI
        let progressTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { timer in
            self.generationProgress += 0.2
            if self.generationProgress >= 1.0 {
                timer.invalidate()
            }
        }
        
        Task {
            do {
                let questions = try await llmService.generatePracticeQuestions(
                    subject: getSubjectTitle(),
                    difficulty: selectedDifficulty.displayName,
                    count: 5,
                    examType: examType
                )
                
                DispatchQueue.main.async {
                    progressTimer.invalidate()
                    self.generatedQuestions = questions
                    self.generationProgress = 1.0
                    self.isGenerating = false
                    self.questionsReady = true
                }
            } catch {
                DispatchQueue.main.async {
                    progressTimer.invalidate()
                    self.isGenerating = false
                    print("❌ Failed to generate questions: \(error)")
                    // Fallback to mock questions
                    self.generateMockQuestions()
                }
            }
        }
    }
    
    private func generateMockQuestions() {
        // Fallback method from original implementation
        generatedQuestions = [
            Question(
                question: "Sample question for \(getSubjectTitle()) (\(examType.name))",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0,
                explanation: "This is a fallback question for \(examType.name)."
            )
        ]
        generationProgress = 1.0
        isGenerating = false
        questionsReady = true
    }
}
