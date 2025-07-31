//
//  PracticeTest.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct Question {
    let question: String
    let options: [String]
    let correctAnswer: Int
    let explanation: String
}

struct QuestionResult {
    let question: String
    let userAnswer: Int?
    let correctAnswer: Int
    let isCorrect: Bool
}

struct TestResults {
    let questionResults: [QuestionResult]
    let correctAnswers: Int
    let totalQuestions: Int
    let timeSpent: String
    
    var incorrectAnswers: Int {
        return totalQuestions - correctAnswers
    }
    
    var percentage: Int {
        return Int((Double(correctAnswers) / Double(totalQuestions)) * 100)
    }
    
    var performanceMessage: String {
        switch percentage {
        case 90...100:
            return "Excellent! Outstanding performance!"
        case 80..<90:
            return "Great job! You're doing very well!"
        case 70..<80:
            return "Good work! Keep practicing!"
        case 60..<70:
            return "Not bad! Room for improvement!"
        default:
            return "Keep studying! You'll get better!"
        }
    }
    
    var scoreColor: Color {
        switch percentage {
        case 90...100:
            return .green
        case 70..<90:
            return .blue
        case 50..<70:
            return .orange
        default:
            return .red
        }
    }
    
    var scoreIcon: String {
        switch percentage {
        case 90...100:
            return "trophy.fill"
        case 70..<90:
            return "medal.fill"
        case 50..<70:
            return "star.fill"
        default:
            return "book.fill"
        }
    }
}

enum Subject: CaseIterable {
    case math, science, history, english, geography, custom
    
    var displayName: String {
        switch self {
        case .math:
            return "Mathematics"
        case .science:
            return "Science"
        case .history:
            return "History"
        case .english:
            return "English"
        case .geography:
            return "Geography"
        case .custom:
            return "Custom Topic"
        }
    }
    
    var iconName: String {
        switch self {
        case .math:
            return "function"
        case .science:
            return "flask.fill"
        case .history:
            return "building.columns.fill"
        case .english:
            return "book.pages"
        case .geography:
            return "globe"
        case .custom:
            return "pencil.and.outline"
        }
    }
}

enum Difficulty: CaseIterable {
    case easy, medium, hard
    
    var displayName: String {
        switch self {
        case .easy:
            return "Easy"
        case .medium:
            return "Medium"
        case .hard:
            return "Hard"
        }
    }
    
    var description: String {
        switch self {
        case .easy:
            return "Basic concepts"
        case .medium:
            return "Intermediate level"
        case .hard:
            return "Advanced topics"
        }
    }
}

struct QuestionsResponse: Codable {
    let questions: [QuestionData]
}

struct QuestionData: Codable {
    let question: String
    let options: [String]
    let correct_answer: Int
    let explanation: String
}

struct StudyMaterialsData: Codable {
    let summary: String
    let key_points: [KeyPointData]
    let flashcards: [FlashcardData]
}

struct KeyPointData: Codable {
    let title: String
    let description: String
}

struct FlashcardData: Codable {
    let question: String
    let answer: String
}

struct StudyMaterialsResponse {
    let summary: StudySummary
    let keyPoints: [KeyPoint]
    let flashcards: [Flashcard]
}
