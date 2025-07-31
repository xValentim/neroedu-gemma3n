//
//  EssayInputViewModel.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI
import Combine

class EssayInputViewModel: ObservableObject {
    @Published var inputMode: InputMode = .text
    @Published var textInput = ""
    @Published var extractedText = ""
    @Published var selectedImage: UIImage?
    @Published var selectedDocument: URL?
    @Published var isProcessing = false
    @Published var showError = false
    @Published var errorMessage = ""
    
    enum InputMode {
        case text, image, pdf
    }
    
    var hasValidInput: Bool {
        return !textInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
               !extractedText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    func getFinalText() -> String {
        if !extractedText.isEmpty {
            return extractedText
        }
        return textInput
    }
    
    func processImage() {
        guard let image = selectedImage else { return }
        
        isProcessing = true
        
        // Simulate OCR processing
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            self.extractedText = "This is a sample extracted text from the image. In a real implementation, this would be the result of OCR processing using Apple's Vision framework."
            self.isProcessing = false
        }
    }
    
    func processPDF() {
        guard let documentURL = selectedDocument else { return }
        
        isProcessing = true
        
        // Simulate PDF processing
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.extractedText = "This is sample text extracted from the PDF document. Real implementation would process the PDF and extract text content."
            self.isProcessing = false
        }
    }
}

