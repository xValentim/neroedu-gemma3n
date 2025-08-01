//
//  PracticeTestViewModel.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI
import Combine

class PracticeTestViewModel: ObservableObject {
    @Published var questions: [Question] = []
    @Published var currentQuestionIndex = 0
    @Published var selectedAnswer: Int?
    @Published var showResult = false
    @Published var userAnswers: [Int?] = []
    @Published var isTestComplete = false
    @Published var testResults: TestResults?
    
    var currentQuestion: Question? {
        guard currentQuestionIndex < questions.count else { return nil }
        return questions[currentQuestionIndex]
    }
    
    var progress: CGFloat {
        guard !questions.isEmpty else { return 0 }
        return CGFloat(currentQuestionIndex + 1) / CGFloat(questions.count)
    }
    
    var totalQuestions: Int {
        return questions.count
    }
    
    var isLastQuestion: Bool {
        return currentQuestionIndex == questions.count - 1
    }
    
    func setup(questions: [Question]) {
        self.questions = questions
        self.userAnswers = Array(repeating: nil, count: questions.count)
    }
    
    func selectAnswer(_ index: Int) {
        selectedAnswer = index
    }
    
    func submitAnswer() {
        guard let selectedAnswer = selectedAnswer else { return }
        
        userAnswers[currentQuestionIndex] = selectedAnswer
        
        withAnimation(.spring()) {
            showResult = true
        }
    }
    
    func nextQuestion() {
        if isLastQuestion {
            // Complete test and generate results
            completeTest()
        } else {
            // Move to next question
            withAnimation(.spring()) {
                currentQuestionIndex += 1
                selectedAnswer = nil
                showResult = false
            }
        }
    }
    
    private func completeTest() {
        var questionResults: [QuestionResult] = []
        var correctCount = 0
        
        for (index, question) in questions.enumerated() {
            let userAnswer = userAnswers[index]
            let isCorrect = userAnswer == question.correctAnswer
            
            if isCorrect {
                correctCount += 1
            }
            
            questionResults.append(QuestionResult(
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect
            ))
        }
        
        testResults = TestResults(
            questionResults: questionResults,
            correctAnswers: correctCount,
            totalQuestions: questions.count,
            timeSpent: "5:23" // Mock time
        )
        
        withAnimation(.spring()) {
            isTestComplete = true
        }
    }
}
