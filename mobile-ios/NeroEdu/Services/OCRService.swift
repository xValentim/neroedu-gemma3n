//
//  OCRService.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 26/07/25.
//

import UIKit
import Vision
import VisionKit
import PDFKit
import PhotosUI
import UniformTypeIdentifiers

enum OCRError: LocalizedError {
    case invalidImage
    case invalidPDF
    case noTextFound
    
    var errorDescription: String? {
        switch self {
        case .invalidImage:
            return "Invalid image format"
        case .invalidPDF:
            return "Invalid PDF document"
        case .noTextFound:
            return "No text found in the document"
        }
    }
}

class OCRService {
    func extractText(from image: UIImage, completion: @escaping (Result<String, Error>) -> Void) {
        guard let cgImage = image.cgImage else {
            completion(.failure(OCRError.invalidImage))
            return
        }
        
        let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        let request = VNRecognizeTextRequest { request, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let observations = request.results as? [VNRecognizedTextObservation] else {
                completion(.failure(OCRError.noTextFound))
                return
            }
            
            let recognizedStrings = observations.compactMap { observation in
                observation.topCandidates(1).first?.string
            }
            
            let fullText = recognizedStrings.joined(separator: "\n")
            print("FULL EXTRACTED TEXT: \(fullText)")
            completion(.success(fullText))
        }
        
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["en-US", "pt-BR"]
        request.usesLanguageCorrection = true
        
        do {
            try requestHandler.perform([request])
        } catch {
            completion(.failure(error))
        }
    }
    
    func extractText(from pdfURL: URL, completion: @escaping (Result<String, Error>) -> Void) {
        guard let pdfDocument = PDFDocument(url: pdfURL) else {
            completion(.failure(OCRError.invalidPDF))
            return
        }
        
        var fullText = ""
        
        for pageIndex in 0..<pdfDocument.pageCount {
            guard let page = pdfDocument.page(at: pageIndex) else { continue }
            
            // Try to extract text directly first
            if let pageText = page.string {
                fullText += pageText + "\n"
            } else {
                // If no text, try OCR on the page image
                let pageRect = page.bounds(for: .mediaBox)
                let renderer = UIGraphicsImageRenderer(size: pageRect.size)
                
                let pageImage = renderer.image { context in
                    UIColor.white.set()
                    context.fill(pageRect)
                    
                    context.cgContext.translateBy(x: 0, y: pageRect.size.height)
                    context.cgContext.scaleBy(x: 1.0, y: -1.0)
                    
                    page.draw(with: .mediaBox, to: context.cgContext)
                }
                
                // Perform OCR on the page image (simplified for this example)
                if let cgImage = pageImage.cgImage {
                    let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
                    let request = VNRecognizeTextRequest()
                    request.recognitionLevel = .accurate
                    
                    do {
                        try requestHandler.perform([request])
                        if let results = request.results {
                            let pageText = results.compactMap { observation in
                                observation.topCandidates(1).first?.string
                            }.joined(separator: "\n")
                            fullText += pageText + "\n"
                        }
                    } catch {
                        // Continue with next page
                    }
                }
            }
        }
        
        completion(.success(fullText))
    }
}
