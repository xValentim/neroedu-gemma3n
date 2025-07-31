//
//  EssayInputView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 28/07/25.
//

import SwiftUI

struct EssayInputView: View {
    @StateObject private var viewModel = EssayInputViewModel()
    @State private var showImagePicker = false
    @State private var showDocumentPicker = false
    @State private var showCamera = false
    @State private var animateContent = false
    @State private var navigateToOutput = false
    @StateObject private var examManager = ExamManager.shared
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                backgroundGradient
                    .ignoresSafeArea()
                
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 32) {
                        // Header
                        headerSection
                        
                        // Input Options
                        inputOptionsSection
                        
                        // Text Input Area
                        if viewModel.inputMode == .text {
                            textInputSection
                        }
                        
                        // Extracted Text Display
                        if !viewModel.extractedText.isEmpty {
                            extractedTextSection
                        }
                        
                        // Processing Indicator
                        if viewModel.isProcessing {
                            processingSection
                        }
                        
                        // Continue Button
                        continueButtonSection
                        
                        // Bottom spacing
                        Color.clear.frame(height: 100)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 10)
                }
            }
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(image: $viewModel.selectedImage)
        }
        .sheet(isPresented: $showDocumentPicker) {
            DocumentPicker(selectedDocument: $viewModel.selectedDocument)
        }
        .sheet(isPresented: $showCamera) {
            CameraView(image: $viewModel.selectedImage)
        }
        .onChange(of: viewModel.selectedImage) { _ in
            if viewModel.selectedImage != nil {
                viewModel.processImage()
            }
        }
        .onChange(of: viewModel.selectedDocument) { _ in
            if viewModel.selectedDocument != nil {
                viewModel.processPDF()
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.2)) {
                animateContent = true
            }
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK") { }
        } message: {
            Text(viewModel.errorMessage)
        }
        .background(
            NavigationLink(
                destination: EssayOutputView(
                    essayText: viewModel.getFinalText(),
                    selectedExam: examManager.getCurrentExam()
                ),
                isActive: $navigateToOutput
            ) {
                EmptyView()
            }
        )
    }
    
    // MARK: - Background
    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(red: 0.05, green: 0.1, blue: 0.2),
                Color(red: 0.1, green: 0.15, blue: 0.3),
                Color(red: 0.15, green: 0.1, blue: 0.25)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 16) {
            // App logo or icon
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.orange.opacity(0.3), Color.red.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 80, height: 80)
                    .overlay(
                        Circle()
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
                
                Image(systemName: "pencil.and.outline")
                    .font(.system(size: 32, weight: .medium))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.orange, .red],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
            .scaleEffect(animateContent ? 1.0 : 0.8)
            .animation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.1), value: animateContent)
            
            VStack(spacing: 8) {
                Text("Essay Input")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("Share your essay and get AI-powered feedback")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
        }
        .opacity(animateContent ? 1.0 : 0.0)
        .offset(y: animateContent ? 0 : -30)
    }
    
    // MARK: - Input Options Section
    private var inputOptionsSection: some View {
        VStack(spacing: 20) {
            HStack {
                Text("Choose Input Method")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
            }
            
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 16) {
                
                InputMethodCard(
                    title: "Type Text",
                    subtitle: "Write directly",
                    icon: "keyboard",
                    isSelected: viewModel.inputMode == .text,
                    action: {
                        withAnimation(.spring()) {
                            viewModel.inputMode = .text
                        }
                    }
                )
                
                InputMethodCard(
                    title: "Take Photo",
                    subtitle: "Capture with camera",
                    icon: "camera",
                    isSelected: false,
                    action: {
                        showCamera = true
                    }
                )
                
                InputMethodCard(
                    title: "Choose Image",
                    subtitle: "From photo library",
                    icon: "photo",
                    isSelected: false,
                    action: {
                        showImagePicker = true
                    }
                )
                
                InputMethodCard(
                    title: "Select PDF",
                    subtitle: "Import document",
                    icon: "doc.text",
                    isSelected: false,
                    action: {
                        showDocumentPicker = true
                    }
                )
            }
        }
        .scaleEffect(animateContent ? 1.0 : 0.9)
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.3), value: animateContent)
    }
    
    // MARK: - Text Input Section
    private var textInputSection: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Your Essay")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                Spacer()
                Text("\(viewModel.textInput.count) characters")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.6))
            }
            
            ZStack(alignment: .topLeading) {
                TextEditor(text: $viewModel.textInput)
                    .font(.system(size: 16))
                    .foregroundColor(.white)
                    .scrollContentBackground(.hidden)
                    .background(Color.clear)
                    .frame(minHeight: 200)
                    .padding(20)
                
                if viewModel.textInput.isEmpty {
                    Text("Start writing your essay here...")
                        .font(.system(size: 16))
                        .foregroundColor(.white.opacity(0.5))
                        .padding(.horizontal, 24)
                        .padding(.top, 28)
                        .allowsHitTesting(false)
                }
            }
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.1),
                                Color.white.opacity(0.05)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    )
            )
        }
        .transition(.opacity.combined(with: .scale))
    }
    
    // MARK: - Extracted Text Section
    private var extractedTextSection: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 16))
                    .foregroundColor(.green)
                
                Text("Text Extracted Successfully")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Button("Edit") {
                    withAnimation(.spring()) {
                        viewModel.inputMode = .text
                        viewModel.textInput = viewModel.extractedText
                    }
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.blue)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.blue.opacity(0.2))
                .cornerRadius(8)
            }
            
            ScrollView {
                Text(viewModel.extractedText)
                    .font(.system(size: 15))
                    .foregroundColor(.white.opacity(0.9))
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(20)
            }
            .frame(maxHeight: 180)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.green.opacity(0.15),
                                Color.green.opacity(0.08)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.green.opacity(0.3), lineWidth: 1)
                    )
            )
        }
        .transition(.asymmetric(
            insertion: .scale(scale: 0.8).combined(with: .opacity),
            removal: .opacity
        ))
        .animation(.spring(response: 0.6, dampingFraction: 0.8), value: !viewModel.extractedText.isEmpty)
    }
    
    // MARK: - Processing Section
    private var processingSection: some View {
        VStack(spacing: 20) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                .scaleEffect(1.5)
            
            VStack(spacing: 8) {
                Text("Processing your essay...")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                
                Text("Using AI to extract and analyze text")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
            }
        }
        .frame(height: 140)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.blue.opacity(0.2),
                            Color.purple.opacity(0.15)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
        )
        .transition(.scale.combined(with: .opacity))
    }
    
    // MARK: - Continue Button Section
    private var continueButtonSection: some View {
        VStack(spacing: 16) {
            if viewModel.hasValidInput && !viewModel.isProcessing {
                Button(action: {
                    let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedback.impactOccurred()
                    
                    withAnimation(.spring()) {
                        navigateToOutput = true
                    }
                }) {
                    HStack(spacing: 12) {
                        Text("Continue to Analysis")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                        
                        Image(systemName: "arrow.right.circle.fill")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(
                        LinearGradient(
                            colors: [.purple, .blue],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.white.opacity(0.3), lineWidth: 1)
                    )
                    .shadow(
                        color: Color.blue.opacity(0.4),
                        radius: 15,
                        x: 0,
                        y: 8
                    )
                }
                .buttonStyle(EnhancedButtonStyle())
                .transition(.asymmetric(
                    insertion: .scale(scale: 0.8).combined(with: .move(edge: .bottom)),
                    removal: .opacity
                ))
                .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.2), value: viewModel.hasValidInput)
            }
        }
    }
}

struct InputMethodCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 24, weight: .medium))
                    .foregroundColor(isSelected ? .blue : .white.opacity(0.8))
                
                VStack(spacing: 4) {
                    Text(title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(isSelected ? .blue : .white)
                    
                    Text(subtitle)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(isSelected ? .blue.opacity(0.8) : .white.opacity(0.6))
                }
                .multilineTextAlignment(.center)
            }
            .frame(height: 100)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(
                        LinearGradient(
                            colors: isSelected ? [
                                Color.blue.opacity(0.3),
                                Color.blue.opacity(0.1)
                            ] : [
                                Color.white.opacity(0.1),
                                Color.white.opacity(0.05)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(
                                isSelected ? Color.blue.opacity(0.6) : Color.white.opacity(0.2),
                                lineWidth: isSelected ? 2 : 1
                            )
                    )
            )
        }
        .buttonStyle(ScaleButtonStyle())
    }
}


#Preview {
    EssayInputView()
}
