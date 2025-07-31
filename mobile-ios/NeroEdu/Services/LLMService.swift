//
//  LLMService.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 29/07/25.
//

import Foundation
import MediaPipeTasksGenAI
import MediaPipeTasksGenAIC
import Combine

class LLMService: ObservableObject {
    private var llmInference: LlmInference?
    private let queue = DispatchQueue(label: "com.neroedu.llm", qos: .userInitiated)
    
    @Published var isInitialized = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isOfflineMode = false
    
    static let shared = LLMService()
    
    private init() {
        setupLLM()
    }
    
    func retryInitialization() {
        isInitialized = false
        isLoading = false
        errorMessage = nil
        isOfflineMode = false
        llmInference = nil
        setupLLM()
    }
    
    private func setupLLM() {
        isLoading = true
        queue.async { [weak self] in
            do {
                self?.llmInference = try self?.createLLMInference()
                
                DispatchQueue.main.async {
                    self?.isInitialized = true
                    self?.isLoading = false
                    print("✅ LLM initialized successfully")
                }
            } catch {
                DispatchQueue.main.async {
                    self?.errorMessage = "Failed to initialize LLM: \(error.localizedDescription)"
                    self?.isLoading = false
                    self?.isOfflineMode = true
                    self?.isInitialized = true // Allow app to continue in offline mode
                    print("❌ LLM initialization failed: \(error)")
                    print("🔄 Switching to offline mode")
                }
            }
        }
    }
    
    private func createLLMInference() throws -> LlmInference {
        // Get model path from bundle
        guard let modelPath = Bundle.main.path(forResource: "gemma-3n", ofType: "task") else {
            print("❌ Model file not found in bundle")
            print("📁 Bundle path: \(Bundle.main.bundlePath)")
            print("📋 Bundle contents: \(try? FileManager.default.contentsOfDirectory(atPath: Bundle.main.bundlePath))")
            throw LLMError.modelNotFound
        }
        
        print("✅ Model found at: \(modelPath)")
        
        // Configure options
        let options = LlmInference.Options(modelPath: modelPath)
        options.maxTokens = 4096
        //options.topk = 40
        //options.temperature = 0.8
        //options.randomSeed = 101
        
        // Optional: Add LoRA model if available
        if let loraPath = Bundle.main.path(forResource: "lora_model", ofType: "bin") {
            //options.loraPath = loraPath
            print("🧠 Using LoRA model: \(loraPath)")
        }
        
        return try LlmInference(options: options)
    }
    
    func generateEssayFeedback(for text: String, examType: ExamType = .sat) async throws -> String {
        if isOfflineMode {
            return generateOfflineEssayFeedback(for: text, examType: examType)
        }
        
        guard isInitialized, let _ = llmInference else {
            throw LLMError.notInitialized
        }
        
        let prompt = createEssayFeedbackPrompt(text: text, examType: examType.name)
        return try await generateResponse(prompt: prompt)
    }
    
    /// Generate practice test questions
    func generatePracticeQuestions(subject: String, difficulty: String, count: Int = 5, examType: ExamType = .sat) async throws -> [Question] {
        if isOfflineMode {
            return generateOfflinePracticeQuestions(subject: subject, difficulty: difficulty, count: count, examType: examType)
        }
        
        guard isInitialized, let _ = llmInference else {
            throw LLMError.notInitialized
        }
        
        let prompt = createPracticeTestPrompt(subject: subject, difficulty: difficulty, count: count, examType: examType.name)
        let response = try await generateResponse(prompt: prompt)
        return parseQuestions(from: response)
    }
    
    /// Generate study materials
    func generateStudyMaterials(topic: String, examType: ExamType = .sat) async throws -> StudyMaterialsResponse {
        if isOfflineMode {
            return generateOfflineStudyMaterials(topic: topic, examType: examType)
        }
        
        guard isInitialized, let _ = llmInference else {
            throw LLMError.notInitialized
        }
        
        let prompt = createStudyMaterialsPrompt(topic: topic, examType: examType.name)
        let response = try await generateResponse(prompt: prompt)
        return parseStudyMaterials(from: response)
    }
    
    // MARK: - Core Generation
    private func generateResponse(prompt: String) async throws -> String {
        return try await withCheckedThrowingContinuation { continuation in
            queue.async { [weak self] in
                guard let self = self, let llmInference = self.llmInference else {
                    continuation.resume(throwing: LLMError.notInitialized)
                    return
                }
                
                do {
                    DispatchQueue.main.async {
                        self.isLoading = true
                    }
                    
                    let result = try llmInference.generateResponse(inputText: prompt)
                    
                    DispatchQueue.main.async {
                        self.isLoading = false
                    }
                    
                    continuation.resume(returning: result)
                } catch {
                    DispatchQueue.main.async {
                        self.isLoading = false
                        self.errorMessage = error.localizedDescription
                    }
                    continuation.resume(throwing: error)
                }
            }
        }
    }
    
    /// Generate streaming response (for real-time feedback)
    func generateStreamingResponse(prompt: String) -> AsyncThrowingStream<String, Error> {
        return AsyncThrowingStream { continuation in
            queue.async { [weak self] in
                guard let self = self, let llmInference = self.llmInference else {
                    continuation.finish(throwing: LLMError.notInitialized)
                    return
                }
                
                do {
                    DispatchQueue.main.async {
                        self.isLoading = true
                    }
                    
                    let resultStream = llmInference.generateResponseAsync(inputText: prompt)
                    
                    Task {
                        do {
                            for try await partialResult in resultStream {
                                continuation.yield(partialResult)
                            }
                            
                            DispatchQueue.main.async {
                                self.isLoading = false
                            }
                            
                            continuation.finish()
                        } catch {
                            DispatchQueue.main.async {
                                self.isLoading = false
                                self.errorMessage = error.localizedDescription
                            }
                            continuation.finish(throwing: error)
                        }
                    }
                } catch {
                    DispatchQueue.main.async {
                        self.isLoading = false
                        self.errorMessage = error.localizedDescription
                    }
                    continuation.finish(throwing: error)
                }
            }
        }
    }
}


// MARK: - Prompt Creation
extension LLMService {
    
    private func createEssayFeedbackPrompt(text: String, examType: String) -> String {
        return """
        Analyze the following essay for \(examType) exam format. Provide a comprehensive analysis in JSON format with the following structure:
        
        {
          "overallScore": 8.5,
          "structure": {
            "score": 8.0,
            "introduction": "Analysis of the introduction...",
            "bodyParagraphs": "Analysis of body paragraphs...",
            "conclusion": "Analysis of the conclusion...",
            "transitions": "Analysis of transitions..."
          },
          "grammar": {
            "score": 8.5,
            "grammar": "Grammar analysis...",
            "spelling": "Spelling analysis...",
            "punctuation": "Punctuation analysis...",
            "vocabulary": "Vocabulary analysis..."
          },
          "content": {
            "score": 8.0,
            "thesis": "Thesis analysis...",
            "arguments": "Arguments analysis...",
            "evidence": "Evidence analysis...",
            "coherence": "Coherence analysis..."
          },
          "suggestions": [
            "Specific suggestion 1",
            "Specific suggestion 2",
            "Specific suggestion 3"
          ],
          "strengths": [
            "Strength 1",
            "Strength 2",
            "Strength 3"
          ],
          "areasForImprovement": [
            "Area 1",
            "Area 2",
            "Area 3"
          ],
          "examType": "\(examType)"
        }
        
        Essay to analyze:
        \(text)
        
        Provide detailed, constructive feedback that is specific to \(examType) requirements. Focus on structure, grammar, content quality, and provide actionable suggestions for improvement.
        """
    }
    
    private func createPracticeTestPrompt(subject: String, difficulty: String, count: Int = 5, examType: String) -> String {
        return """
        You're an expert in \(examType) exam. 
        Create \(count) multiple choice questions for \(subject) at \(difficulty) difficulty level.
        
        Format your response as JSON:
        {
          "questions": [
            {
              "question": "Question text here",
              "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
              "correct_answer": 0,
              "explanation": "Detailed explanation of why this answer is correct"
            }
          ]
        }
        
        Requirements:
        - Questions should be appropriate for \(difficulty) level
        - Each question should have exactly 4 options
        - Provide clear, educational explanations
        - Ensure questions test understanding, not just memorization
        - Make options plausible but clearly distinguishable
        
        Subject: \(subject)
        Difficulty: \(difficulty)
        """
    }
    
    private func createStudyMaterialsPrompt(topic: String, examType: String) -> String {
        return """
        You're an expert in \(examType) exam. 
        Create comprehensive study materials for the topic "\(topic)".
        
        Format your response as JSON:
        {
          "summary": "A comprehensive 150-200 word summary explaining the main concepts",
          "key_points": [
            {
              "title": "Key Point 1 Title",
              "description": "Detailed explanation of this key point"
            },
            {
              "title": "Key Point 2 Title", 
              "description": "Detailed explanation of this key point"
            },
            {
              "title": "Key Point 3 Title",
              "description": "Detailed explanation of this key point"
            }
          ],
          "flashcards": [
            {
              "question": "Question about the topic",
              "answer": "Comprehensive answer with explanation"
            }
          ]
        }
        
        Requirements:
        - Summary should be engaging and informative
        - Key points should cover the most important concepts
        - Create exactly 4 flashcards with meaningful questions
        - Use clear, educational language
        
        Topic: \(topic)
        """
    }
}

// MARK: - Response Parsing
extension LLMService {
    
    private func parseQuestions(from response: String) -> [Question] {
        do {
            // Try to extract JSON from response
            guard let jsonData = extractJSON(from: response)?.data(using: .utf8) else {
                throw LLMError.invalidResponse
            }
            
            let decoder = JSONDecoder()
            let questionsResponse = try decoder.decode(QuestionsResponse.self, from: jsonData)
            
            return questionsResponse.questions.map { questionData in
                Question(
                    question: questionData.question,
                    options: questionData.options,
                    correctAnswer: questionData.correct_answer,
                    explanation: questionData.explanation
                )
            }
        } catch {
            print("⚠️ Failed to parse questions JSON, using fallback: \(error)")
            return createFallbackQuestions()
        }
    }
    
    private func parseStudyMaterials(from response: String) -> StudyMaterialsResponse {
        do {
            guard let jsonData = extractJSON(from: response)?.data(using: .utf8) else {
                throw LLMError.invalidResponse
            }
            
            let decoder = JSONDecoder()
            let materialsData = try decoder.decode(StudyMaterialsData.self, from: jsonData)
            
            let summary = StudySummary(content: materialsData.summary)
            
            let keyPoints = materialsData.key_points.map { point in
                KeyPoint(title: point.title, description: point.description)
            }
            
            let flashcards = materialsData.flashcards.map { card in
                Flashcard(question: card.question, answer: card.answer)
            }
            
            return StudyMaterialsResponse(
                summary: summary,
                keyPoints: keyPoints,
                flashcards: flashcards
            )
        } catch {
            print("⚠️ Failed to parse study materials JSON, using fallback: \(error)")
            return createFallbackStudyMaterials()
        }
    }
    
    private func extractJSON(from text: String) -> String? {
        // Look for JSON between ```json and ``` or { and }
        let patterns = [
            "```json\\s*([\\s\\S]*?)```",
            "```\\s*([\\s\\S]*?)```",
            "(\\{[\\s\\S]*\\})"
        ]
        
        for pattern in patterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: []),
               let match = regex.firstMatch(in: text, options: [], range: NSRange(location: 0, length: text.count)) {
                let range = match.range(at: 1)
                if let swiftRange = Range(range, in: text) {
                    return String(text[swiftRange]).trimmingCharacters(in: .whitespacesAndNewlines)
                }
            }
        }
        
        return nil
    }
    
    // MARK: - Fallback Methods
    private func createFallbackQuestions() -> [Question] {
        return [
            Question(
                question: "What is the main topic we're studying?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0,
                explanation: "This is a fallback question when parsing fails."
            )
        ]
    }
    
    private func createFallbackStudyMaterials() -> StudyMaterialsResponse {
        return StudyMaterialsResponse(
            summary: StudySummary(content: "This is fallback content when parsing fails."),
            keyPoints: [
                KeyPoint(title: "Key Point 1", description: "Fallback description"),
                KeyPoint(title: "Key Point 2", description: "Fallback description"),
                KeyPoint(title: "Key Point 3", description: "Fallback description")
            ],
            flashcards: [
                Flashcard(question: "Fallback question?", answer: "Fallback answer")
            ]
        )
    }
    
    // MARK: - Offline Generation Methods
    private func generateOfflineEssayFeedback(for text: String, examType: ExamType) -> String {
        let feedback = EssayFeedback(
            overallScore: 8.5,
            structure: EssayFeedback.StructureFeedback(
                score: 8.0,
                introduction: "Sua introdução apresenta o tema de forma clara e estabelece uma tese bem definida. O contexto inicial é adequado para o formato do \(examType.name).",
                bodyParagraphs: "Os parágrafos de desenvolvimento estão bem organizados com uma progressão lógica. Os argumentos são apresentados de forma coerente.",
                conclusion: "A conclusão reforça adequadamente os pontos principais e retoma a tese de forma efetiva.",
                transitions: "As transições entre parágrafos são fluidas e contribuem para a coesão textual."
            ),
            grammar: EssayFeedback.GrammarFeedback(
                score: 8.5,
                grammar: "A gramática está correta na maior parte do texto, com poucos desvios que não comprometem a compreensão.",
                spelling: "A ortografia está adequada, demonstrando bom domínio das regras ortográficas.",
                punctuation: "A pontuação está bem utilizada, contribuindo para a clareza e fluidez do texto.",
                vocabulary: "O vocabulário é apropriado para o nível do \(examType.name), com boa variedade lexical."
            ),
            content: EssayFeedback.ContentFeedback(
                score: 8.0,
                thesis: "A tese está bem definida e clara, apresentando uma posição consistente ao longo do texto.",
                arguments: "Os argumentos são convincentes e bem estruturados, com boa fundamentação.",
                evidence: "As evidências apoiam adequadamente os argumentos, embora possam ser mais específicas.",
                coherence: "O texto apresenta boa coerência e coesão, com ideias bem conectadas."
            ),
            suggestions: [
                "Adicione exemplos mais específicos para fortalecer os argumentos",
                "Fortaleça as transições entre parágrafos para melhor fluidez",
                "Revise a pontuação em algumas passagens para maior clareza",
                "Considere expandir um dos argumentos com mais detalhes"
            ],
            strengths: [
                "Clareza na argumentação e apresentação das ideias",
                "Boa estrutura textual com introdução, desenvolvimento e conclusão",
                "Vocabulário apropriado para o nível do exame",
                "Coerência na linha argumentativa mantida ao longo do texto"
            ],
            areasForImprovement: [
                "Exemplos mais específicos e concretos",
                "Transições mais fluidas entre parágrafos",
                "Revisão de pontuação em algumas passagens",
                "Ampliação de um dos argumentos principais"
            ],
            examType: examType.name
        )
        
        // Return as JSON string
        if let jsonData = try? JSONEncoder().encode(feedback),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            return jsonString
        }
        
        // Fallback to structured text if JSON encoding fails
        return feedback.toStructuredText()
    }
    
    private func generateOfflinePracticeQuestions(subject: String, difficulty: String, count: Int, examType: ExamType) -> [Question] {
        var questions: [Question] = []
        
        for i in 1...count {
            let question = Question(
                question: "Sample \(subject) question \(i) for \(examType.name) (\(difficulty) level)",
                options: [
                    "Option A - Correct answer",
                    "Option B",
                    "Option C", 
                    "Option D"
                ],
                correctAnswer: 0,
                explanation: "This is a sample question generated in offline mode for \(examType.name). The correct answer is Option A. In a real scenario, this would be a detailed explanation of the concept being tested."
            )
            questions.append(question)
        }
        
        return questions
    }
    
    private func generateOfflineStudyMaterials(topic: String, examType: ExamType) -> StudyMaterialsResponse {
        let summary = StudySummary(
            content: """
            📚 Study Summary for \(topic)
            
            This is a comprehensive overview of \(topic) tailored for \(examType.name) preparation. The topic covers fundamental concepts and key principles that are commonly tested in this exam format.
            
            Key areas covered:
            • Core concepts and definitions
            • Important formulas and equations
            • Common applications and examples
            • Typical question formats
            
            This summary was generated in offline mode to provide you with immediate study materials while the AI model loads.
            """
        )
        
        let keyPoints = [
            KeyPoint(
                title: "Fundamental Concepts",
                description: "Understanding the basic principles of \(topic) is essential for \(examType.name) success."
            ),
            KeyPoint(
                title: "Key Applications",
                description: "Real-world applications and examples that demonstrate practical use of \(topic) concepts."
            ),
            KeyPoint(
                title: "Common Mistakes",
                description: "Frequently encountered errors and misconceptions when studying \(topic) for \(examType.name)."
            ),
            KeyPoint(
                title: "Study Strategies",
                description: "Effective approaches to mastering \(topic) content for optimal \(examType.name) performance."
            )
        ]
        
        let flashcards = [
            Flashcard(
                question: "What is the main concept of \(topic)?",
                answer: "The main concept involves understanding the fundamental principles and applications relevant to \(examType.name) requirements."
            ),
            Flashcard(
                question: "How does \(topic) relate to \(examType.name)?",
                answer: "This topic is commonly tested in \(examType.name) and understanding it is crucial for achieving a high score."
            ),
            Flashcard(
                question: "What are the key formulas in \(topic)?",
                answer: "Key formulas include fundamental equations and relationships that are essential for solving \(examType.name) problems."
            )
        ]
        
        return StudyMaterialsResponse(
            summary: summary,
            keyPoints: keyPoints,
            flashcards: flashcards
        )
    }
}

// MARK: - Error Types
enum LLMError: LocalizedError {
    case modelNotFound
    case notInitialized
    case invalidResponse
    case generationFailed(String)
    
    var errorDescription: String? {
        switch self {
        case .modelNotFound:
            return "LLM model file not found in app bundle"
        case .notInitialized:
            return "LLM service not initialized"
        case .invalidResponse:
            return "Invalid response format from LLM"
        case .generationFailed(let message):
            return "Text generation failed: \(message)"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .modelNotFound:
            return "Make sure gemma-3n.task is added to your Xcode project bundle"
        case .notInitialized:
            return "Wait for LLM to finish initializing or restart the app"
        case .invalidResponse:
            return "Try again with a different prompt"
        case .generationFailed:
            return "Check your internet connection and try again"
        }
    }
}
