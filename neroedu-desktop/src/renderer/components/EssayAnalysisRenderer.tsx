import React from 'react';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface EssayAnalysisData {
  reading?: number;
  analysis?: number;
  writing?: number;
  justifications?: {
    reading?: string;
    analysis?: string;
    writing?: string;
  };
  feedback?: string;
}

interface EssayAnalysisRendererProps {
  response: string;
}

export const EssayAnalysisRenderer: React.FC<EssayAnalysisRendererProps> = ({ response }) => {
  // Try to extract JSON from the response
  const extractJsonFromResponse = (text: string): EssayAnalysisData | null => {
    try {
      // Method 1: Look for JSON code block
      const jsonMatch = text.match(/```json\s*\n(.*?)\n```/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Method 2: Look for JSON object in the text
      const jsonStartIndex = text.indexOf('{');

      if (jsonStartIndex !== -1) {
        let braceCount = 0;
        let inString = false;
        let escaped = false;

        for (let i = jsonStartIndex; i < text.length; i++) {
          const char = text[i];

          if (escaped) {
            escaped = false;
            continue;
          }

          if (char === '\\') {
            escaped = true;
            continue;
          }

          if (char === '"' && !escaped) {
            inString = !inString;
            continue;
          }

          if (!inString) {
            if (char === '{') {
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                const jsonStr = text.substring(jsonStartIndex, i + 1);
                return JSON.parse(jsonStr);
              }
            }
          }
        }
      }

      return null;
    } catch (e) {
      console.warn('Failed to parse JSON from essay analysis:', e);
      return null;
    }
  };

  const analysisData = extractJsonFromResponse(response);

  // If we can't parse JSON, fall back to plain text
  if (!analysisData) {
    return (
      <div className="essay-analysis-fallback">
        <div className="feedback-content">
          <MarkdownRenderer content={response} />
        </div>
      </div>
    );
  }

  // Render structured analysis
  return (
    <div className="essay-analysis-structured">
      {/* Scores Section */}
      {(analysisData.reading !== undefined || analysisData.analysis !== undefined || analysisData.writing !== undefined) && (
        <div className="analysis-scores-section">
          <h3>📊 Scores</h3>
          <div className="scores-grid">
            {analysisData.reading !== undefined && (
              <div className="score-card">
                <div className="score-label">Reading</div>
                <div className="score-value">{analysisData.reading}/4</div>
              </div>
            )}
            {analysisData.analysis !== undefined && (
              <div className="score-card">
                <div className="score-label">Analysis</div>
                <div className="score-value">{analysisData.analysis}/4</div>
              </div>
            )}
            {analysisData.writing !== undefined && (
              <div className="score-card">
                <div className="score-label">Writing</div>
                <div className="score-value">{analysisData.writing}/4</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Justifications Section */}
      {analysisData.justifications && (
        <div className="analysis-justifications-section">
          <h3>📝 Detailed Analysis</h3>
          <div className="justifications-grid">
            {analysisData.justifications.reading && (
              <div className="justification-card">
                <h4>📚 Reading Comprehension</h4>
                <div className="justification-content">
                  <MarkdownRenderer content={analysisData.justifications.reading} />
                </div>
              </div>
            )}
            {analysisData.justifications.analysis && (
              <div className="justification-card">
                <h4>🔍 Analysis Quality</h4>
                <div className="justification-content">
                  <MarkdownRenderer content={analysisData.justifications.analysis} />
                </div>
              </div>
            )}
            {analysisData.justifications.writing && (
              <div className="justification-card">
                <h4>✍️ Writing Quality</h4>
                <div className="justification-content">
                  <MarkdownRenderer content={analysisData.justifications.writing} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {analysisData.feedback && (
        <div className="analysis-feedback-section">
          <h3>💡 Recommendations</h3>
          <div className="feedback-content">
            <MarkdownRenderer content={analysisData.feedback} />
          </div>
        </div>
      )}

      {/* Extract and display any additional text outside the JSON */}
      {(() => {
        const jsonStartIndex = response.indexOf('{');
        const beforeJson = jsonStartIndex > 0 ? response.substring(0, jsonStartIndex).trim() : '';
        const afterJsonMatch = response.match(/}\s*(.+)$/s);
        const afterJson = afterJsonMatch ? afterJsonMatch[1].trim() : '';

        return (beforeJson || afterJson) ? (
          <div className="analysis-additional-content">
            {beforeJson && (
              <div className="additional-intro">
                <MarkdownRenderer content={beforeJson} />
              </div>
            )}
            {afterJson && (
              <div className="additional-explanation">
                <MarkdownRenderer content={afterJson} />
              </div>
            )}
          </div>
        ) : null;
      })()}
    </div>
  );
};
