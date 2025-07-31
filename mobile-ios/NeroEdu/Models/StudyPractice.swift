//
//  StudyPractice.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct StudySummary {
    let content: String
}

struct KeyPoint {
    let title: String
    let description: String
}

struct Flashcard {
    let question: String
    let answer: String
}

enum TopicSuggestion: CaseIterable {
    case photosynthesis, worldWar2, calculus, shakespeare, dna
    
    var title: String {
        switch self {
        case .photosynthesis:
            return "Photosynthesis"
        case .worldWar2:
            return "World War II"
        case .calculus:
            return "Calculus"
        case .shakespeare:
            return "Shakespeare"
        case .dna:
            return "DNA Structure"
        }
    }
}

enum ContentType: CaseIterable {
    case summary, keyPoints, flashcards, all
    
    var displayName: String {
        switch self {
        case .summary:
            return "Summary"
        case .keyPoints:
            return "Key Points"
        case .flashcards:
            return "Flashcards"
        case .all:
            return "All Content"
        }
    }
    
    var description: String {
        switch self {
        case .summary:
            return "Overview text"
        case .keyPoints:
            return "Main concepts"
        case .flashcards:
            return "Q&A cards"
        case .all:
            return "Everything"
        }
    }
    
    var iconName: String {
        switch self {
        case .summary:
            return "doc.text.fill"
        case .keyPoints:
            return "star.fill"
        case .flashcards:
            return "rectangle.stack.fill"
        case .all:
            return "sparkles"
        }
    }
}

enum StudySection: CaseIterable {
    case summary, keyPoints, flashcards
    
    var displayName: String {
        switch self {
        case .summary:
            return "Summary"
        case .keyPoints:
            return "Key Points"
        case .flashcards:
            return "Flashcards"
        }
    }
    
    var iconName: String {
        switch self {
        case .summary:
            return "doc.text.fill"
        case .keyPoints:
            return "star.fill"
        case .flashcards:
            return "rectangle.stack.fill"
        }
    }
}
