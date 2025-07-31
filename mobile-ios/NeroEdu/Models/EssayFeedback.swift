//
//  EssayFeedback.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 29/07/25.
//

import Foundation

struct EssayFeedback: Codable {
    let overallScore: Double
    let structure: StructureFeedback
    let grammar: GrammarFeedback
    let content: ContentFeedback
    let suggestions: [String]
    let strengths: [String]
    let areasForImprovement: [String]
    let examType: String
    
    struct StructureFeedback: Codable {
        let score: Double
        let introduction: String
        let bodyParagraphs: String
        let conclusion: String
        let transitions: String
    }
    
    struct GrammarFeedback: Codable {
        let score: Double
        let grammar: String
        let spelling: String
        let punctuation: String
        let vocabulary: String
    }
    
    struct ContentFeedback: Codable {
        let score: Double
        let thesis: String
        let arguments: String
        let evidence: String
        let coherence: String
    }
}

// MARK: - Markdown Formatter
extension EssayFeedback {
    func toMarkdown() -> String {
        return """
        # 📝 Análise da Redação - \(examType)
        
        ## 📊 Pontuação Geral: \(String(format: "%.1f", overallScore))/10
        
        ---
        
        ## 🏗️ Estrutura (\(String(format: "%.1f", structure.score))/10)
        
        ### Introdução
        \(structure.introduction)
        
        ### Parágrafos do Desenvolvimento
        \(structure.bodyParagraphs)
        
        ### Conclusão
        \(structure.conclusion)
        
        ### Transições
        \(structure.transitions)
        
        ---
        
        ## ✍️ Gramática e Linguagem (\(String(format: "%.1f", grammar.score))/10)
        
        ### Gramática
        \(grammar.grammar)
        
        ### Ortografia
        \(grammar.spelling)
        
        ### Pontuação
        \(grammar.punctuation)
        
        ### Vocabulário
        \(grammar.vocabulary)
        
        ---
        
        ## 🎯 Conteúdo (\(String(format: "%.1f", content.score))/10)
        
        ### Tese
        \(content.thesis)
        
        ### Argumentos
        \(content.arguments)
        
        ### Evidências
        \(content.evidence)
        
        ### Coerência
        \(content.coherence)
        
        ---
        
        ## ✅ Pontos Fortes
        
        \(strengths.map { "• \($0)" }.joined(separator: "\n"))
        
        ---
        
        ## 🔧 Áreas para Melhoria
        
        \(areasForImprovement.map { "• \($0)" }.joined(separator: "\n"))
        
        ---
        
        ## 💡 Sugestões Específicas
        
        \(suggestions.enumerated().map { "\($0 + 1). \($1)" }.joined(separator: "\n"))
        
        ---
        
        *Análise gerada especificamente para o formato do \(examType)*
        """
    }
    
    func toStructuredText() -> String {
        return """
        📝 ANÁLISE DA REDAÇÃO - \(examType)
        
        📊 PONTUAÇÃO GERAL: \(String(format: "%.1f", overallScore))/10
        
        ────────────────────────────────────────
        
        🏗️ ESTRUTURA (\(String(format: "%.1f", structure.score))/10)
        
        📍 Introdução:
        \(structure.introduction)
        
        📍 Parágrafos do Desenvolvimento:
        \(structure.bodyParagraphs)
        
        📍 Conclusão:
        \(structure.conclusion)
        
        📍 Transições:
        \(structure.transitions)
        
        ────────────────────────────────────────
        
        ✍️ GRAMÁTICA E LINGUAGEM (\(String(format: "%.1f", grammar.score))/10)
        
        📍 Gramática:
        \(grammar.grammar)
        
        📍 Ortografia:
        \(grammar.spelling)
        
        📍 Pontuação:
        \(grammar.punctuation)
        
        📍 Vocabulário:
        \(grammar.vocabulary)
        
        ────────────────────────────────────────
        
        🎯 CONTEÚDO (\(String(format: "%.1f", content.score))/10)
        
        📍 Tese:
        \(content.thesis)
        
        📍 Argumentos:
        \(content.arguments)
        
        📍 Evidências:
        \(content.evidence)
        
        📍 Coerência:
        \(content.coherence)
        
        ────────────────────────────────────────
        
        ✅ PONTOS FORTES:
        \(strengths.map { "• \($0)" }.joined(separator: "\n"))
        
        ────────────────────────────────────────
        
        🔧 ÁREAS PARA MELHORIA:
        \(areasForImprovement.map { "• \($0)" }.joined(separator: "\n"))
        
        ────────────────────────────────────────
        
        💡 SUGESTÕES ESPECÍFICAS:
        \(suggestions.enumerated().map { "\($0 + 1). \($1)" }.joined(separator: "\n"))
        
        ────────────────────────────────────────
        
        Análise gerada especificamente para o formato do \(examType)
        """
    }
} 