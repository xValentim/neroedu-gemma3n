//
//  ExamType.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 26/07/25.
//

import SwiftUI
import Combine

enum ExamType: CaseIterable {
    case enem, sat, icfes, cuet, port, exani
    
    var name: String {
        switch self {
        case .enem: return "ENEM"
        case .sat: return "SAT"
        case .icfes: return "ICFES"
        case .cuet: return "CUET"
        case .port: return "Portugal"
        case .exani: return "Exani-II"
        }
    }
    
    var description: String {
        switch self {
        case .enem: return "Brazilian National Exam"
        case .sat: return "Scholastic Assessment Test"
        case .icfes: return "Instituto Colombiano para la Evaluación de la Educación"
        case .cuet: return "Central University Entrance Test"
        case .port: return "Exames nacionais de Portugal"
        case .exani: return "Exame Nacional do México"
        }
    }
    
    var iconName: String {
        switch self {
        case .enem: return "flag.fill"
        case .sat: return "star.fill"
        case .icfes: return "a.circle.fill"
        case .cuet: return "book.fill"
        case .port: return "m.circle.fill"
        case .exani: return "bookmark.fill"
        }
    }
    
    var gradientColors: [Color] {
        switch self {
        case .enem: return [.green, .yellow]
        case .sat: return [.blue, .cyan]
        case .icfes: return [.red, .orange]
        case .cuet: return [.blue, .white]
        case .port: return [.purple, .blue]
        case .exani: return [.yellow, .red]
        }
    }
    
    var examDate: String {
        switch self {
        case .enem: return "November 12nd"
        case .sat: return "March 13th"
        case .icfes: return "March 14th"
        case .cuet: return "Aug 22nd"
        case .port: return "Aug 25th"
        case .exani: return "May 1st"
        }
    }
}

// MARK: - Global Exam Manager
class ExamManager: ObservableObject {
    static let shared = ExamManager()
    
    @Published var selectedExam: ExamType = .sat
    
    private init() {}
    
    func setExam(_ exam: ExamType) {
        selectedExam = exam
    }
    
    func getCurrentExam() -> ExamType {
        return selectedExam
    }
}
