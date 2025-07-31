//
//  MarkdownView.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 29/07/25.
//

import SwiftUI

struct MarkdownView: View {
    let markdownText: String
    let textColor: Color
    let backgroundColor: Color
    
    init(markdownText: String, textColor: Color = .white, backgroundColor: Color = .clear) {
        self.markdownText = markdownText
        self.textColor = textColor
        self.backgroundColor = backgroundColor
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ForEach(parseMarkdown(), id: \.id) { element in
                    renderElement(element)
                }
            }
            .padding(24)
        }
    }
    
    private func renderElement(_ element: MarkdownElement) -> AnyView {
        switch element.type {
        case .heading1:
            AnyView(
                Text(element.content)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(textColor)
                    .padding(.top, 8)
                    .padding(.bottom, 4)
            )
                
        case .heading2:
            AnyView(
                Text(element.content)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(textColor)
                    .padding(.top, 16)
                    .padding(.bottom, 4)
            )
                
        case .heading3:
            AnyView(
                Text(element.content)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(textColor.opacity(0.9))
                    .padding(.top, 12)
                    .padding(.bottom, 2)
            )
                
        case .paragraph:
            AnyView(
                Text(element.content)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(textColor.opacity(0.8))
                    .lineSpacing(4)
            )
                
        case .listItem:
            AnyView(
                HStack(alignment: .top, spacing: 8) {
                    Text("•")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(textColor.opacity(0.7))
                        .padding(.top, 2)
                    
                    Text(element.content)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(textColor.opacity(0.8))
                        .lineSpacing(2)
                }
                .padding(.leading, 8)
            )
            
        case .numberedItem:
            AnyView(
                HStack(alignment: .top, spacing: 8) {
                    Text("\(element.number).")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(textColor.opacity(0.7))
                        .frame(width: 20, alignment: .leading)
                        .padding(.top, 2)
                    
                    Text(element.content)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(textColor.opacity(0.8))
                        .lineSpacing(2)
                }
                .padding(.leading, 8)
            )
            
        case .divider:
            AnyView(
                Rectangle()
                    .fill(textColor.opacity(0.2))
                    .frame(height: 1)
                    .padding(.vertical, 16)
            )
                
        case .emphasis:
            AnyView(
                Text(element.content)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(textColor.opacity(0.7))
            )
        }
    }
    
    private func parseMarkdown() -> [MarkdownElement] {
        let lines = markdownText.components(separatedBy: .newlines)
        var elements: [MarkdownElement] = []
        var listCounter = 1
        
        for line in lines {
            let trimmedLine = line.trimmingCharacters(in: .whitespaces)
            
            if trimmedLine.isEmpty {
                continue
            }
            
            if trimmedLine.hasPrefix("---") {
                elements.append(MarkdownElement(type: .divider, content: "", number: 0))
            } else if trimmedLine.hasPrefix("# ") {
                elements.append(MarkdownElement(type: .heading1, content: String(trimmedLine.dropFirst(2)), number: 0))
            } else if trimmedLine.hasPrefix("## ") {
                elements.append(MarkdownElement(type: .heading2, content: String(trimmedLine.dropFirst(3)), number: 0))
            } else if trimmedLine.hasPrefix("### ") {
                elements.append(MarkdownElement(type: .heading3, content: String(trimmedLine.dropFirst(4)), number: 0))
            } else if trimmedLine.hasPrefix("• ") {
                elements.append(MarkdownElement(type: .listItem, content: String(trimmedLine.dropFirst(2)), number: 0))
            } else if isNumberedListItem(trimmedLine) {
                let content = extractNumberedItemContent(trimmedLine)
                elements.append(MarkdownElement(type: .numberedItem, content: content, number: listCounter))
                listCounter += 1
            } else if trimmedLine.hasPrefix("*") && trimmedLine.hasSuffix("*") {
                let content = String(trimmedLine.dropFirst().dropLast())
                elements.append(MarkdownElement(type: .emphasis, content: content, number: 0))
            } else {
                elements.append(MarkdownElement(type: .paragraph, content: trimmedLine, number: 0))
            }
        }
        
        return elements
    }
    
    private func isNumberedListItem(_ line: String) -> Bool {
        // Check if line starts with a number followed by a dot and space
        let pattern = #/^\d+\.\s/#
        return line.matches(of: pattern).count > 0
    }
    
    private func extractNumberedItemContent(_ line: String) -> String {
        // Find the first occurrence of ". " and remove everything before it
        if let range = line.range(of: ". ") {
            return String(line[range.upperBound...]).trimmingCharacters(in: .whitespaces)
        }
        return line
    }
}

struct MarkdownElement {
    let type: ElementType
    let content: String
    let number: Int
    let id = UUID()
    
    enum ElementType {
        case heading1, heading2, heading3, paragraph, listItem, numberedItem, divider, emphasis
    }
}

#Preview {
    MarkdownView(markdownText: """
    # 📝 Análise da Redação - ENEM
    
    ## 📊 Pontuação Geral: 8.5/10
    
    ---
    
    ## 🏗️ Estrutura (8.0/10)
    
    ### Introdução
    Sua introdução apresenta claramente o tema e estabelece uma tese bem definida.
    
    ### Parágrafos do Desenvolvimento
    Os argumentos são bem organizados e apresentam uma progressão lógica.
    
    ---
    
    ## ✅ Pontos Fortes
    
    • Clareza na argumentação
    • Boa estrutura textual
    • Vocabulário apropriado
    
    ---
    
    ## 💡 Sugestões Específicas
    
    1. Adicione mais exemplos específicos
    2. Fortaleça as transições entre parágrafos
    3. Revise a pontuação
    
    ---
    
    *Análise gerada especificamente para o formato do ENEM*
    """)
    .background(Color.black)
} 
