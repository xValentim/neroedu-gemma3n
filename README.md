# 🎓 NeroEdu - Democratizing Global Education with AI

[![Kaggle Competition](https://img.shields.io/badge/Kaggle-Gemma%203n%20Challenge-blue.svg)](https://www.kaggle.com/competitions/google-gemma-3n-hackathon)
[![Category](https://img.shields.io/badge/Category-Revolutionize%20Education-green.svg)](https://www.kaggle.com/competitions/google-gemma-3n-hackathon)
[![Gemma 3n](https://img.shields.io/badge/Powered%20by-Gemma%203n-orange.svg)](https://ai.google.dev/gemma/docs/gemma-3n)

**NeroEdu democratizes global education with autonomous AI agents powered by Gemma 3n, providing personalized essay evaluation, study materials, and practice exams across multiple countries - all running privately on-device.**

## 🌟 The Mission: Revolutionizing Education Through AI

Access to high-quality exam preparation remains highly unequal worldwide. Students from privileged backgrounds have tutors, personalized feedback, and comprehensive resources, while millions in underserved communities lack structured preparation, especially in remote areas with limited connectivity.

**NeroEdu bridges this gap using Gemma 3n's groundbreaking on-device AI capabilities**, offering the same level of personalized, intelligent support traditionally available only to elite students — but accessible to everyone, anywhere, even offline.

### 🎯 Built for Impact
- **🌍 Global Reach**: Support for 6 major standardized exams across different countries
- **📱 On-Device Privacy**: Powered by Gemma 3n for secure, offline-first learning
- **🏠 Accessibility**: Works without internet connection in remote areas
- **💡 Personalized**: AI agents adapt to each student's learning needs
- **🆓 Democratic**: Free access to premium-quality educational support

## 🚀 Powered by Gemma 3n: The Future of On-Device Education

### Why Gemma 3n Changes Everything for Education:

🔒 **Privacy-First Learning**
- All AI processing happens locally on the device
- Student data never leaves their phone/computer
- Perfect for sensitive educational content and personal feedback

📱 **Mobile-Optimized Performance**
- Runs efficiently on phones, tablets, and laptops
- Memory footprint optimized for resource-constrained devices
- Real-time AI responses without cloud dependency

🌐 **Offline-Ready Education**
- Functions reliably without internet connection
- Critical for students in areas with poor connectivity
- Enables learning in remote or underserved regions

🗣️ **Multilingual Capabilities**
- Strong performance across multiple languages
- Breaks down communication barriers in global education
- Supports local language nuances for each exam system

## 🎬 Educational Content Database: 1000+ curated videos

Our curated educational database spans multiple languages and exam systems:

### 🇧🇷 ENEM (Brazil) 
- Portuguese, Mathematics, Natural Sciences, Human Sciences
- Essay writing techniques and evaluation criteria
- Comprehensive coverage of all ENEM competencies

### 🇺🇸 SAT (USA) 
- Math, Reading & Writing, Digital SAT preparation
- Test-taking strategies and time management

### 🇨🇴 ICFES (Colombia)
- Mathematics, Social Sciences, Natural Sciences
- Critical reading and analytical thinking

### 🇮🇳 CUET (India)
- General Aptitude, English preparation
- Subject-specific content for university entrance

### 🇵🇹 Exames Nacionais (Portugal)
- Portuguese grammar and literature
- Mathematics and sciences preparation

### 🇲🇽 Exani-II (Mexico)
- Mathematical thinking, writing skills
- Mexican history and administration

## ✨ Revolutionary AI Features

### 📝 Intelligent Essay Evaluation
- **5-Competency Analysis**: Comprehensive evaluation based on official criteria
- **Detailed Feedback**: Personalized improvement suggestions with scoring
- **AI-Powered Insights**: Grammar, argumentation, cohesion, and content analysis
- **On-Device Processing**: Private, instant feedback without data sharing
- **Competency-Based Evaluation (ENEM)**: Evaluates texts using Brazil's official 5-competency rubric (norm usage, theme comprehension, argumentation, cohesion, and intervention). This analysis is structured and returned in JSON for programmatic interpretation and feedback visualization.


### 🧠 Adaptive Practice Generation
- **Dynamic Questions**: AI creates contextually relevant practice problems
- **Difficulty Adaptation**: Adjusts to student's performance level
- **RAG-Enhanced**: Uses curated educational content for realistic scenarios
- **Offline Capability**: Generates unlimited practice materials without internet

### 🎯 Personalized Study Materials
- **Smart Flashcards**: AI-generated cards with duplicate avoidance
- **Key Concepts**: Automatically extracts essential topics for focused learning

## 🤖 AI Agents Architecture

NeroEdu is powered by three specialized agents, each with unique pipelines:

### 1. ✍️ Essay Grader
- Evaluates essays using official exam rubrics (ENEM, SAT, etc.)
- Uses temperature=0 for deterministic grading
- Returns structured JSON with grade, feedback, and justification

### 2. 📚 Simulated Test Generator
- Generates 5-question sets or individual questions from any theme
- Uses seed and temperature tuning for controlled variability
- Enriched via RAG with relevant educational content

### 3. 🔖 Flashcard & Key Concepts Agent
- Creates non-redundant flashcards personalized to student's progress
- Includes a key topic extractor that summarizes essential points by exam type

## 🏗️ Technical Architecture

### Multi-Platform Ecosystem
- **🔧 Backend API**: FastAPI with LangChain + Ollama integration
- **📱 Mobile iOS**: SwiftUI with on-device Gemma 3n processing
- **💻 Desktop**: Electron-based cross-platform application
- **📊 Analytics**: Privacy-preserving learning insights
  
### Core AI Stack
- **🤖 Gemma 3n**: On-device multimodal AI processing
- **🦙 Ollama**: Local LLM runtime for serving Gemma 3n models efficiently
- **🔗 LangChain**: Advanced framework to connect with LLM's providers
- **📚 RAG System**: TF-IDF vectorstores for content retrieval
  
### 🔄 Backend Orchestration

The FastAPI backend orchestrates all AI agents and connects to the Ollama server running Gemma 3n locally. Each endpoint (essay, flashcard, mock exam) triggers specific retrieval + generation flows, ensuring that:

- Contextual content is fetched via TF-IDF
- Multilingual input is handled via translation (if needed)
- Gemma 3n receives structured, augmented prompts
  
<img src="./assets/arch-gemma-hacka.png" alt="Architecture Diagram" width="800"/>
<p align="center"><i>Architecture Diagram for NeroEdu</i></p>


### 🔎 Lite RAG with TF-IDF for Offline Efficiency

To ensure fast and lightweight retrieval on low-end devices, NeroEdu uses a TF-IDF-based vector store instead of dense embeddings. This decision enables:

- Minimal memory and compute usage
- Fast document similarity search via cosine similarity
- Effective contextual grounding for language models without internet

Each exam (ENEM, SAT, etc.) has its own dedicated TF-IDF vector store, enabling specialized context retrieval for every use case.

The retrieved passages are dynamically injected into prompts during question generation, essay evaluation, or flashcard creation — enabling the system to provide accurate, grounded responses even offline.


## 🛠️ Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+ (for desktop app)
- Xcode (for iOS development)
- Ollama with Gemma 3n models

### Quick Setup
```bash
# Clone the repository
git clone <repository-url>
cd neroedu-gemma3n

# Backend setup
pip install -r requirements.txt
python main.py

# Desktop application
cd neroedu-desktop 
npm install 
npm run build:dll
npm start
```

*Detailed installation and configuration instructions coming soon.*

## 🏆 Kaggle Gemma 3n Challenge

This project represents our submission to the **Kaggle Gemma 3n Challenge** in the **"Revolutionize Education"** category. We're leveraging Gemma 3n's unique capabilities to create meaningful, positive change in global education access.

### Why This Matters
- **Real-World Impact**: Addresses education inequality affecting millions of students
- **Technical Innovation**: Demonstrates Gemma 3n's potential for social good  
- **Scalable Solution**: Architecture designed for global deployment
- **Privacy-Centric**: Aligns with modern data protection requirements
  
---

## 📄 License

This project is open-source and available under the MIT License. We believe education should be free and accessible to all.

---

**Built with ❤️ for global education equity**  
*Empowering students worldwide through innovative AI technology*

> *"Education is the most powerful weapon which you can use to change the world."* - Nelson Mandela
