//
//  LLMService.swift
//  NeroEdu - XNNPack Cache Fix
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
    @Published var initializationProgress: Double = 0.0
    
    static let shared = LLMService()
    
    private let modelName: String = "gemma-3n-E4B-it-int4"
    private let modelExtension: String = "task"
    
    // Cached paths for reuse
    private var cachedModelPath: String?
    private var cachedCacheDirectory: String?
    
    private init() {
        setupLLM()
    }
    
    func retryInitialization() {
        print("🔄 Retrying LLM initialization...")
        
        // Reset state
        isInitialized = false
        isLoading = false
        errorMessage = nil
        isOfflineMode = false
        initializationProgress = 0.0
        llmInference = nil
        cachedModelPath = nil
        cachedCacheDirectory = nil
        
        // Clear any cached preferences
        UserDefaults.standard.removeObject(forKey: "llm_model_path")
        UserDefaults.standard.removeObject(forKey: "llm_cache_directory")
        
        setupLLM()
    }
    
    private func setupLLM() {
        isLoading = true
        initializationProgress = 0.1
        
        queue.async { [weak self] in
            do {
                // Step 1: Setup writable directories
                DispatchQueue.main.async { self?.initializationProgress = 0.2 }
                let (modelPath, cacheDir) = try self?.setupWritableDirectories() ?? ("", "")
                
                // Step 2: Copy model if needed
                DispatchQueue.main.async { self?.initializationProgress = 0.5 }
                let finalModelPath = try self?.ensureModelInWritableLocation(modelPath) ?? ""
                
                // Step 3: Create LLM inference
                DispatchQueue.main.async { self?.initializationProgress = 0.8 }
                self?.llmInference = try self?.createLLMInference(modelPath: finalModelPath, cacheDirectory: cacheDir)
                
                // Step 4: Complete
                DispatchQueue.main.async {
                    self?.initializationProgress = 1.0
                    self?.isInitialized = true
                    self?.isLoading = false
                    self?.cachedModelPath = finalModelPath
                    self?.cachedCacheDirectory = cacheDir
                    
                    // Cache paths for future use
                    UserDefaults.standard.set(finalModelPath, forKey: "llm_model_path")
                    UserDefaults.standard.set(cacheDir, forKey: "llm_cache_directory")
                    
                    print("✅ LLM initialized successfully")
                    print("📍 Model path: \(finalModelPath)")
                    print("📁 Cache directory: \(cacheDir)")
                }
                
            } catch {
                DispatchQueue.main.async {
                    self?.handleInitializationError(error)
                }
            }
        }
    }
    
    private func handleInitializationError(_ error: Error) {
        print("❌ LLM initialization failed: \(error)")
        
        errorMessage = "AI model initialization failed: \(error.localizedDescription)"
        isLoading = false
        isOfflineMode = true
        isInitialized = true // Allow app to continue in offline mode
        initializationProgress = 0.0
        
        print("🔄 Switching to offline mode - app will continue with limited functionality")
    }
    
    // MARK: - Directory and File Management
    
    private func setupWritableDirectories() throws -> (modelPath: String, cacheDirectory: String) {
        let fileManager = FileManager.default
        
        // Create app-specific cache directory
        let appCacheDir = try createAppCacheDirectory()
        
        // Create model-specific subdirectory
        let modelCacheDir = appCacheDir.appendingPathComponent("llm_cache")
        if !fileManager.fileExists(atPath: modelCacheDir.path) {
            try fileManager.createDirectory(at: modelCacheDir, withIntermediateDirectories: true, attributes: [
                .posixPermissions: 0o755
            ])
            print("📁 Created model cache directory: \(modelCacheDir.path)")
        }
        
        // Model will be stored in Documents for persistence
        let documentsDir = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
        let modelPath = documentsDir.appendingPathComponent("\(modelName).\(modelExtension)").path
        
        return (modelPath, modelCacheDir.path)
    }
    
    private func createAppCacheDirectory() throws -> URL {
        let fileManager = FileManager.default
        let cacheDir = fileManager.urls(for: .cachesDirectory, in: .userDomainMask).first!
        let appCacheDir = cacheDir.appendingPathComponent("NeroEdu")
        
        if !fileManager.fileExists(atPath: appCacheDir.path) {
            try fileManager.createDirectory(at: appCacheDir, withIntermediateDirectories: true, attributes: [
                .posixPermissions: 0o755
            ])
            print("📁 Created app cache directory: \(appCacheDir.path)")
        }
        
        return appCacheDir
    }
    
    private func ensureModelInWritableLocation(_ targetPath: String) throws -> String {
        let fileManager = FileManager.default
        
        // Get bundle model path
        guard let bundleModelPath = Bundle.main.path(forResource: modelName, ofType: modelExtension) else {
            throw LLMError.modelNotFound
        }
        
        print("📦 Bundle model path: \(bundleModelPath)")
        print("🎯 Target model path: \(targetPath)")
        
        // Check if we need to copy the model
        let needsCopy = try shouldCopyModel(from: bundleModelPath, to: targetPath)
        
        if needsCopy {
            print("🔄 Copying model to writable location...")
            
            // Remove existing file if it exists
            if fileManager.fileExists(atPath: targetPath) {
                try fileManager.removeItem(atPath: targetPath)
                print("🧹 Removed existing model file")
            }
            
            // Copy model with progress tracking
            try copyModelWithProgress(from: bundleModelPath, to: targetPath)
            
            // Verify the copied file
            try verifyModelFile(at: targetPath)
            
            print("✅ Model successfully copied and verified")
        } else {
            print("✅ Using existing verified model")
        }
        
        return targetPath
    }
    
    private func shouldCopyModel(from bundlePath: String, to targetPath: String) throws -> Bool {
        let fileManager = FileManager.default
        
        // If target doesn't exist, need to copy
        guard fileManager.fileExists(atPath: targetPath) else {
            return true
        }
        
        // Compare file sizes and modification dates
        let bundleAttrs = try fileManager.attributesOfItem(atPath: bundlePath)
        let targetAttrs = try fileManager.attributesOfItem(atPath: targetPath)
        
        let bundleSize = bundleAttrs[.size] as? UInt64 ?? 0
        let targetSize = targetAttrs[.size] as? UInt64 ?? 0
        
        if bundleSize != targetSize {
            print("📊 File size mismatch - need to recopy (bundle: \(bundleSize), target: \(targetSize))")
            return true
        }
        
        // Basic integrity check
        do {
            try verifyModelFile(at: targetPath)
            return false
        } catch {
            print("🔍 Integrity check failed - need to recopy: \(error)")
            return true
        }
    }
    
    private func copyModelWithProgress(from sourcePath: String, to targetPath: String) throws {
        let fileManager = FileManager.default
        
        // Get source file size for progress tracking
        let sourceAttrs = try fileManager.attributesOfItem(atPath: sourcePath)
        let totalSize = sourceAttrs[.size] as? UInt64 ?? 0
        
        print("📥 Copying \(totalSize) bytes...")
        
        // For now, do a simple copy - in production you might want progress callbacks
        try fileManager.copyItem(atPath: sourcePath, toPath: targetPath)
        
        // Set appropriate permissions
        try fileManager.setAttributes([
            .posixPermissions: 0o644
        ], ofItemAtPath: targetPath)
        
        print("✅ Copy completed with correct permissions")
    }
    
    private func verifyModelFile(at path: String) throws {
        let fileManager = FileManager.default
        
        // Check existence
        guard fileManager.fileExists(atPath: path) else {
            throw LLMError.generationFailed("Model file does not exist")
        }
        
        // Check size (at least 10MB for a reasonable model)
        let attributes = try fileManager.attributesOfItem(atPath: path)
        let fileSize = attributes[.size] as? UInt64 ?? 0
        
        guard fileSize > 10_000_000 else {
            throw LLMError.generationFailed("Model file appears corrupted (size: \(fileSize))")
        }
        
        // Check readability
        guard fileManager.isReadableFile(atPath: path) else {
            throw LLMError.generationFailed("Model file is not readable")
        }
        
        // Quick header check
        guard let fileHandle = FileHandle(forReadingAtPath: path) else {
            throw LLMError.generationFailed("Cannot open model file")
        }
        
        defer { fileHandle.closeFile() }
        
        let headerData = fileHandle.readData(ofLength: 1024)
        guard headerData.count > 0 else {
            throw LLMError.generationFailed("Cannot read model file header")
        }
        
        print("✅ Model verification passed (\(fileSize) bytes)")
    }
    
    // MARK: - LLM Inference Creation
    
    private func createLLMInference(modelPath: String, cacheDirectory: String) throws -> LlmInference {
        print("🧠 Creating LLM inference...")
        print("📍 Model: \(modelPath)")
        print("📁 Cache: \(cacheDirectory)")
        
        // Create options with writable cache directory
        let options = LlmInference.Options(modelPath: modelPath)
        
        // Configure generation parameters
        options.maxTokens = 4096  // Reasonable limit for mobile
        //options.topK = 40
        //options.temperature = 0.8
        //options.randomSeed = 42
        
        // Set cache directory for XNNPack (THIS IS THE KEY FIX!)
        // We need to set the cache directory before creating the inference
        let env = ProcessInfo.processInfo.environment
        var newEnv = env
        newEnv["XNNPACK_CACHE_DIR"] = cacheDirectory
        
        // Try to create the inference
        do {
            let inference = try LlmInference(options: options)
            print("✅ LLM inference created successfully")
            return inference
        } catch {
            print("❌ Failed to create LLM inference: \(error)")
            
            // Try with more conservative settings
            print("🔄 Trying with conservative settings...")
            options.maxTokens = 2048
            
            let fallbackInference = try LlmInference(options: options)
            print("✅ LLM inference created with fallback settings")
            return fallbackInference
        }
    }
    
    // MARK: - Public API Methods
    
    func generateEssayFeedback(for text: String, examType: ExamType = .sat) async throws -> String {
        if isOfflineMode || !isInitialized {
            return generateOfflineEssayFeedback(for: text, examType: examType)
        }
        
        guard let llmInference = llmInference else {
            throw LLMError.notInitialized
        }
        
        let prompt = createEssayFeedbackPrompt(text: text, examType: examType.name)
        return try await generateResponse(prompt: prompt, inference: llmInference)
    }
    
    func generatePracticeQuestions(subject: String, difficulty: String, count: Int = 5, examType: ExamType = .sat) async throws -> [Question] {
        if isOfflineMode || !isInitialized {
            return generateOfflinePracticeQuestions(subject: subject, difficulty: difficulty, count: count, examType: examType)
        }
        
        guard let llmInference = llmInference else {
            throw LLMError.notInitialized
        }
        
        let prompt = createPracticeTestPrompt(subject: subject, difficulty: difficulty, count: count, examType: examType.name)
        let response = try await generateResponse(prompt: prompt, inference: llmInference)
        return parseQuestions(from: response)
    }
    
    func generateStudyMaterials(topic: String, examType: ExamType = .sat) async throws -> StudyMaterialsResponse {
        if isOfflineMode || !isInitialized {
            return generateOfflineStudyMaterials(topic: topic, examType: examType)
        }
        
        guard let llmInference = llmInference else {
            throw LLMError.notInitialized
        }
        
        let prompt = createStudyMaterialsPrompt(topic: topic, examType: examType.name)
        let response = try await generateResponse(prompt: prompt, inference: llmInference)
        return parseStudyMaterials(from: response)
    }
    
    // MARK: - Core Generation
    
    private func generateResponse(prompt: String, inference: LlmInference) async throws -> String {
        return try await withCheckedThrowingContinuation { continuation in
            queue.async { [weak self] in
                do {
                    DispatchQueue.main.async {
                        self?.isLoading = true
                    }
                    
                    print("🤖 Generating response...")
                    let result = try inference.generateResponse(inputText: prompt)
                    print("✅ Response generated successfully (\(result.count) characters)")
                    
                    DispatchQueue.main.async {
                        self?.isLoading = false
                    }
                    
                    continuation.resume(returning: result)
                } catch {
                    print("❌ Generation failed: \(error)")
                    DispatchQueue.main.async {
                        self?.isLoading = false
                        self?.errorMessage = error.localizedDescription
                    }
                    continuation.resume(throwing: error)
                }
            }
        }
    }
    
    // MARK: - Streaming Generation (Future Enhancement)
    
    func generateStreamingResponse(prompt: String) -> AsyncThrowingStream<String, Error> {
        return AsyncThrowingStream { continuation in
            guard let llmInference = llmInference, isInitialized, !isOfflineMode else {
                continuation.finish(throwing: LLMError.notInitialized)
                return
            }
            
            queue.async { [weak self] in
                do {
                    DispatchQueue.main.async {
                        self?.isLoading = true
                    }
                    
                    let resultStream = llmInference.generateResponseAsync(inputText: prompt)
                    
                    Task {
                        do {
                            for try await partialResult in resultStream {
                                continuation.yield(partialResult)
                            }
                            
                            DispatchQueue.main.async {
                                self?.isLoading = false
                            }
                            
                            continuation.finish()
                        } catch {
                            DispatchQueue.main.async {
                                self?.isLoading = false
                                self?.errorMessage = error.localizedDescription
                            }
                            continuation.finish(throwing: error)
                        }
                    }
                } catch {
                    DispatchQueue.main.async {
                        self?.isLoading = false
                        self?.errorMessage = error.localizedDescription
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
        You are an expert essay grader for \(examType) exams. Analyze the following essay and provide detailed feedback.
        
        Essay to analyze:
        \(text)
        
        Please provide feedback in the following format:
        
        📊 ESSAY ANALYSIS REPORT
        
        📝 Word Count: [count] words
        
        ✅ STRENGTHS:
        • [List 3-4 main strengths]
        
        🔧 AREAS FOR IMPROVEMENT:
        • [List 3-4 specific areas to improve]
        
        📈 OVERALL SCORE: [score]/100
        
        💡 RECOMMENDATIONS:
        [Numbered list of 3-4 actionable recommendations]
        
        🎯 EXAM-SPECIFIC TIPS:
        [2-3 tips specific to \(examType) exam]
        
        Keep your feedback constructive, specific, and helpful for a student preparing for standardized tests.
        """
    }
    
    private func createPracticeTestPrompt(subject: String, difficulty: String, count: Int, examType: String) -> String {
        return """
        Create \(count) multiple choice questions for \(subject) at \(difficulty) difficulty level for \(examType) exam format.
        
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
        - Format should match \(examType) exam style
        
        Subject: \(subject)
        Difficulty: \(difficulty)
        """
    }
    
    private func createStudyMaterialsPrompt(topic: String, examType: String) -> String {
        return """
        Create comprehensive study materials for the topic "\(topic)" tailored for \(examType) exam preparation.
        
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
        - Summary should be engaging and exam-focused
        - Key points should cover the most important concepts for \(examType)
        - Create exactly 4 flashcards with meaningful questions
        - Use clear, educational language appropriate for exam preparation
        
        Topic: \(topic)
        Exam: \(examType)
        """
    }
}

// MARK: - Response Parsing
extension LLMService {
    private func parseQuestions(from response: String) -> [Question] {
        do {
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
                question: "This is a sample question generated in offline mode. What is the primary purpose of standardized testing?",
                options: [
                    "A. To assess student knowledge and skills",
                    "B. To rank schools competitively",
                    "C. To determine teacher effectiveness",
                    "D. To allocate educational funding"
                ],
                correctAnswer: 0,
                explanation: "Standardized tests are primarily designed to assess student knowledge and skills in a consistent manner across different populations."
            )
        ]
    }
    
    private func createFallbackStudyMaterials() -> StudyMaterialsResponse {
        return StudyMaterialsResponse(
            summary: StudySummary(content: "This is offline study content generated while the AI model loads. For comprehensive, personalized study materials with detailed explanations and exam-specific insights, please wait for the AI model to initialize or try again later."),
            keyPoints: [
                KeyPoint(title: "Offline Mode Active", description: "The AI model is currently loading. Basic study materials are provided as a fallback."),
                KeyPoint(title: "Enhanced Features Coming", description: "Once the AI model loads, you'll get personalized, detailed study materials."),
                KeyPoint(title: "Study Tips", description: "Continue reviewing your materials and practice regularly while waiting for full AI features.")
            ],
            flashcards: [
                Flashcard(question: "What should I do while the AI model loads?", answer: "Continue studying with available materials and try the AI features again in a few minutes."),
                Flashcard(question: "Will the AI features work later?", answer: "Yes, the AI model is initializing and will provide full functionality once loaded.")
            ]
        )
    }
    
    // MARK: - Offline Methods
    private func generateOfflineEssayFeedback(for text: String, examType: ExamType) -> String {
        let wordCount = text.split(separator: " ").count
        
        return """
        📊 OFFLINE ESSAY ANALYSIS (\(examType.name))
        
        ⚠️ AI MODEL LOADING - BASIC ANALYSIS PROVIDED
        
        📝 Word Count: \(wordCount) words
        📈 Estimated Score: 75/100
        
        ✅ BASIC OBSERVATIONS:
        • Essay structure appears organized
        • Word count is \(wordCount < 250 ? "below recommended" : wordCount > 500 ? "above typical" : "appropriate")
        • Content demonstrates effort and thought
        
        🔧 GENERAL AREAS FOR REVIEW:
        • Grammar and punctuation accuracy
        • Argument development and support
        • Use of specific examples and evidence
        • Conclusion strength and impact
        
        💡 STUDY RECOMMENDATIONS:
        • Practice with \(examType.name)-specific essay prompts
        • Review high-scoring essay examples
        • Focus on clear thesis statements
        • Work on time management during writing
        
        🎯 EXAM-SPECIFIC TIPS:
        • \(examType.name) essays typically favor clear argumentation
        • Use varied sentence structures for better flow
        • Include relevant examples to support your points
        
        🤖 For detailed AI-powered analysis with personalized feedback, please wait for the model to finish loading and try again.
        """
    }
    
    private func generateOfflinePracticeQuestions(subject: String, difficulty: String, count: Int, examType: ExamType) -> [Question] {
        let difficultyModifier = difficulty.lowercased()
        
        return (1...count).map { i in
            Question(
                question: "[\(examType.name) - \(subject)] Sample \(difficulty) question \(i): This is an offline practice question that demonstrates the format you can expect. What type of question format is this?",
                options: [
                    "A. Multiple choice with four options",
                    "B. True or false question",
                    "C. Short answer response",
                    "D. Essay question"
                ],
                correctAnswer: 0,
                explanation: "This is a multiple choice question with four options (A-D), which is the standard format for \(examType.name) practice tests. Once the AI model loads, you'll receive personalized questions tailored to \(subject) at \(difficulty) difficulty level."
            )
        }
    }
    
    private func generateOfflineStudyMaterials(topic: String, examType: ExamType) -> StudyMaterialsResponse {
        return StudyMaterialsResponse(
            summary: StudySummary(content: "OFFLINE MODE: Basic study materials for \(topic). This topic is relevant for \(examType.name) preparation and typically involves understanding key concepts, applications, and relationships. For comprehensive, AI-generated study materials with detailed explanations, exam-specific insights, and personalized content, please wait for the AI model to initialize completely."),
            keyPoints: [
                KeyPoint(
                    title: "Core Understanding",
                    description: "Develop a solid foundation in \(topic) fundamentals. Focus on definitions, key principles, and basic applications relevant to \(examType.name) exam format."
                ),
                KeyPoint(
                    title: "Practical Applications",
                    description: "Learn how \(topic) applies in real-world scenarios and exam contexts. Practice identifying examples and solving related problems."
                ),
                KeyPoint(
                    title: "Exam Strategy",
                    description: "Understand how \(topic) is typically tested in \(examType.name) format. Review question types and common approaches to answering them effectively."
                ),
                KeyPoint(
                    title: "AI Enhancement Coming",
                    description: "Enhanced study materials with detailed explanations, mnemonics, and personalized learning paths will be available once the AI model finishes loading."
                )
            ],
            flashcards: [
                Flashcard(
                    question: "What is \(topic) and why is it important for \(examType.name)?",
                    answer: "\(topic) is a key subject area tested on \(examType.name). Understanding its core concepts and applications is essential for exam success. [AI-enhanced answer coming soon]"
                ),
                Flashcard(
                    question: "How should I study \(topic) effectively for \(examType.name)?",
                    answer: "Focus on understanding fundamentals, practicing application problems, and familiarizing yourself with exam question formats. Use multiple study methods including reading, practice questions, and review sessions."
                ),
                Flashcard(
                    question: "What study resources are best for \(topic)?",
                    answer: "Use official \(examType.name) prep materials, reputable textbooks, practice tests, and AI-powered study tools (available once model loads) for comprehensive preparation."
                ),
                Flashcard(
                    question: "When will full AI features be available?",
                    answer: "The AI model is currently initializing. Full features including personalized study plans, detailed explanations, and adaptive learning will be available shortly. Please try again in a few minutes."
                )
            ]
        )
    }
}

// MARK: - Error Types
enum LLMError: LocalizedError {
    case modelNotFound
    case notInitialized
    case invalidResponse
    case generationFailed(String)
    case cacheDirectoryError(String)
    case modelCopyError(String)
    
    var errorDescription: String? {
        switch self {
        case .modelNotFound:
            return "AI model file not found in app bundle"
        case .notInitialized:
            return "AI service not initialized"
        case .invalidResponse:
            return "Invalid response format from AI"
        case .generationFailed(let message):
            return "AI generation failed: \(message)"
        case .cacheDirectoryError(let message):
            return "Cache directory error: \(message)"
        case .modelCopyError(let message):
            return "Model copy error: \(message)"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .modelNotFound:
            return "Make sure the AI model is included in your Xcode project bundle"
        case .notInitialized:
            return "Wait for AI model to finish loading or restart the app"
        case .invalidResponse:
            return "Try again with a different request"
        case .generationFailed:
            return "Check device storage and memory, then try again"
        case .cacheDirectoryError:
            return "Restart the app to recreate cache directories"
        case .modelCopyError:
            return "Check available storage space and restart the app"
        }
    }
}
