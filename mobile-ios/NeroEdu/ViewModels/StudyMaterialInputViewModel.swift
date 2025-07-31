//
//  StudyMaterialInputViewModel.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI
import Combine

class StudyMaterialInputViewModel: ObservableObject {
    @Published var topic = ""
    @Published var isGenerating = false
    @Published var generationProgress: CGFloat = 0.0
    @Published var currentGenerationStage = "Analyzing topic..."
    @Published var contentReady = false
    
    @Published var generatedSummary: StudySummary = StudySummary(content: "")
    @Published var generatedKeyPoints: [KeyPoint] = []
    @Published var generatedFlashcards: [Flashcard] = []
    
    private let llmService = LLMService.shared
    private let examType: ExamType
    
    init(examType: ExamType = .sat) {
        self.examType = examType
    }
    
    var canGenerate: Bool {
        return !topic.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    func generateContent() {
        guard canGenerate else { return }
        
        isGenerating = true
        generationProgress = 0.0
        contentReady = false
        
        let stages = [
            "Analyzing topic...",
            "Researching content...",
            "Creating summary...",
            "Generating key points...",
            "Building flashcards...",
            "Finalizing materials..."
        ]
        
        var currentStageIndex = 0
        
        let progressTimer = Timer.scheduledTimer(withTimeInterval: 0.8, repeats: true) { timer in
            if currentStageIndex < stages.count {
                self.currentGenerationStage = stages[currentStageIndex]
                self.generationProgress = CGFloat(currentStageIndex + 1) / CGFloat(stages.count)
                currentStageIndex += 1
            } else {
                timer.invalidate()
            }
        }
        
        Task {
            do {
                let materials = try await llmService.generateStudyMaterials(
                    topic: topic,
                    examType: examType
                )
                
                DispatchQueue.main.async {
                    progressTimer.invalidate()
                    self.generatedSummary = materials.summary
                    self.generatedKeyPoints = materials.keyPoints
                    self.generatedFlashcards = materials.flashcards
                    self.generationProgress = 1.0
                    self.isGenerating = false
                    self.contentReady = true
                }
            } catch {
                DispatchQueue.main.async {
                    progressTimer.invalidate()
                    self.isGenerating = false
                    print("❌ Failed to generate study materials: \(error)")
                    // Fallback to mock content
                    self.generateMockContent()
                }
            }
        }
    }
    
    private func generateMockContent() {
        // Fallback method from original implementation
        generatedSummary = StudySummary(
            content: "This is fallback content for \(topic) tailored for \(examType.name)."
        )
        generatedKeyPoints = [
            KeyPoint(title: "Key Point 1", description: "Fallback description for \(examType.name)"),
            KeyPoint(title: "Key Point 2", description: "Fallback description for \(examType.name)"),
            KeyPoint(title: "Key Point 3", description: "Fallback description for \(examType.name)")
        ]
        generatedFlashcards = [
            Flashcard(question: "Fallback question for \(examType.name)?", answer: "Fallback answer")
        ]
        generationProgress = 1.0
        isGenerating = false
        contentReady = true
    }
}
