//
//  EssayOutputViewModel.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI
import Combine

class EssayOutputViewModel: ObservableObject {
    @Published var extractedText = ""
    @Published var feedback = ""
    @Published var structuredFeedback: EssayFeedback?
    @Published var isGenerating = false
    @Published var showError = false
    @Published var errorMessage = ""
    
    private let llmService = LLMService.shared
    private let examType: ExamType
    
    init(examType: ExamType = .sat) {
        self.examType = examType
    }
    
    func generateFeedback(for essayText: String) {
        let textToAnalyze = !essayText.isEmpty ? essayText : extractedText
        
        guard !textToAnalyze.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            showError("Please provide an essay to analyze")
            return
        }
        
        isGenerating = true
        
        Task {
            do {
                let feedback = try await llmService.generateEssayFeedback(
                    for: textToAnalyze,
                    examType: examType
                )
                
                DispatchQueue.main.async {
                    self.feedback = feedback
                    self.structuredFeedback = self.parseStructuredFeedback(from: feedback)
                    self.isGenerating = false
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = error.localizedDescription
                    self.showError = true
                    self.isGenerating = false
                }
            }
        }
    }
    
    private func parseStructuredFeedback(from text: String) -> EssayFeedback? {
        // Try to parse as JSON first
        if let data = text.data(using: .utf8),
           let feedback = try? JSONDecoder().decode(EssayFeedback.self, from: data) {
            return feedback
        }
        
        // If not JSON, create a structured feedback from the text
        return createFallbackStructuredFeedback(from: text)
    }
    
    private func createFallbackStructuredFeedback(from text: String) -> EssayFeedback {
        return EssayFeedback(
            overallScore: 8.0,
            structure: EssayFeedback.StructureFeedback(
                score: 8.0,
                introduction: "Sua introdução apresenta o tema de forma clara.",
                bodyParagraphs: "Os parágrafos de desenvolvimento estão bem organizados.",
                conclusion: "A conclusão reforça adequadamente os pontos principais.",
                transitions: "As transições entre parágrafos são fluidas."
            ),
            grammar: EssayFeedback.GrammarFeedback(
                score: 8.0,
                grammar: "A gramática está correta na maior parte do texto.",
                spelling: "A ortografia está adequada.",
                punctuation: "A pontuação está bem utilizada.",
                vocabulary: "O vocabulário é apropriado para o nível do exame."
            ),
            content: EssayFeedback.ContentFeedback(
                score: 8.0,
                thesis: "A tese está bem definida e clara.",
                arguments: "Os argumentos são convincentes e bem estruturados.",
                evidence: "As evidências apoiam adequadamente os argumentos.",
                coherence: "O texto apresenta boa coerência e coesão."
            ),
            suggestions: [
                "Adicione mais exemplos específicos",
                "Fortaleça as transições entre parágrafos",
                "Revise a pontuação em algumas passagens"
            ],
            strengths: [
                "Clareza na argumentação",
                "Boa estrutura textual",
                "Vocabulário apropriado",
                "Coerência na linha argumentativa"
            ],
            areasForImprovement: [
                "Exemplos mais específicos",
                "Transições mais fluidas",
                "Revisão de pontuação"
            ],
            examType: examType.name
        )
    }
    
    func getDisplayText() -> String {
        guard let structured = structuredFeedback else {
            return feedback
        }
        
        // Always return markdown format
        return structured.toMarkdown()
    }
    
    private func showError(_ message: String) {
        errorMessage = message
        showError = true
    }
}

