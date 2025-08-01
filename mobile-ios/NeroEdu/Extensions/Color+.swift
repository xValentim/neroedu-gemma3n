//
//  Color+.swift
//  NeroEdu
//
//  Created by Giovanna Moeller on 25/07/25.
//

import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(.sRGB,
                  red: Double(r) / 255,
                  green: Double(g) / 255,
                  blue: Double(b) / 255,
                  opacity: Double(a) / 255)
    }
    
    // MARK: - Predefined Beautiful Gradients
    
    // Violet to Purple
    static let violetGradient = LinearGradient(
        colors: [Color(hex: "7C3AED"), Color(hex: "9333EA")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    // Blue to Indigo
    static let blueGradient = LinearGradient(
        colors: [Color(hex: "2563EB"), Color(hex: "4F46E5")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    // Pink to Purple
    static let pinkGradient = LinearGradient(
        colors: [Color(hex: "DB2777"), Color(hex: "7C3AED")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Ocean Blue to Teal
    static let oceanGradient = LinearGradient(
        colors: [Color(hex: "667eea"), Color(hex: "764ba2")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Sunset Orange to Pink
    static let sunsetGradient = LinearGradient(
        colors: [Color(hex: "f093fb"), Color(hex: "f5576c")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Sky Blue to Cyan
    static let skyGradient = LinearGradient(
        colors: [Color(hex: "4facfe"), Color(hex: "00f2fe")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Mint to Pink (Pastel)
    static let mintGradient = LinearGradient(
        colors: [Color(hex: "a8edea"), Color(hex: "fed6e3")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Purple to Blue (Deep)
    static let deepGradient = LinearGradient(
        colors: [Color(hex: "667eea"), Color(hex: "764ba2"), Color(hex: "f093fb")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Green to Blue (Fresh)
    static let freshGradient = LinearGradient(
        colors: [Color(hex: "11998e"), Color(hex: "38ef7d")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Orange to Red (Fire)
    static let fireGradient = LinearGradient(
        colors: [Color(hex: "ff9a9e"), Color(hex: "fecfef")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Dark Blue to Purple (Night)
    static let nightGradient = LinearGradient(
        colors: [Color(hex: "2C5364"), Color(hex: "203A43"), Color(hex: "0F2027")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Gold to Orange (Warm)
    static let goldGradient = LinearGradient(
        colors: [Color(hex: "FFB75E"), Color(hex: "ED8F03")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
