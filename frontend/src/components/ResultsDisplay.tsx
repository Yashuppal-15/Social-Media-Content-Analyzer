import React from 'react';
import './ResultsDisplay.css';

interface ExtractionStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
}

interface OCRMetadata {
  confidence: number;
  meanConfidence: number;
  wordCount: number;
  recognizedWords: number;
  lowConfidenceWords: number;
}

interface EngagementSuggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  example: string;
}

interface EngagementAnalysis {
  score: number;
  grade: string;
  suggestions: EngagementSuggestion[];
  analysis: {
    hashtags: any;
    mentions: any;
    callToAction: any;
    length: any;
    readability: any;
    sentiment: any;
    emojis: any;
  };
  optimizedContent?: string;
}

interface ExtractionResult {
  success: boolean;
  text?: string;
  type: 'pdf' | 'image';
  metadata?: {
    pages?: number;
    info?: any;
    version?: string;
  };
  stats?: ExtractionStats;
  ocr?: OCRMetadata;
  engagement?: EngagementAnalysis;
  error?: string;
  message?: string;
  originalFilename?: string;
  fileSize?: number;
  processedAt?: string;
}

interface ResultsDisplayProps {
  results: ExtractionResult | null;
  onClear: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onClear }) => {
  if (!results) return null;

  const copyToClipboard = async () => {
    if (results.text) {
      try {
        await navigator.clipboard.writeText(results.text);
        showNotification('✅ Text copied to clipboard!', 'success');
      } catch (err) {
        console.error('Failed to copy:', err);
        showNotification('❌ Failed to copy text', 'error');
      }
    }
  };

  const downloadText = () => {
    if (results.text) {
      const element = document.createElement('a');
      const file = new Blob([results.text], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `extracted-text-${results.type}-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showNotification('📥 File downloaded successfully!', 'success');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 30px;
      right: 30px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #22c55e, #34D399)' : 'linear-gradient(135deg, #ef4444, #f87171)'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      z-index: 10000;
      font-weight: 600;
      animation: slideInRight 0.4s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  if (!results.success) {
    return (
      <div className="results-container">
        <div className="panel error-panel">
          <div className="panel-header">
            <div className="panel-title">❌ Processing Failed</div>
            <button className="btn" onClick={onClear}>Close</button>
          </div>
          <div className="panel-body">
            <div className="error-message">{results.message || results.error}</div>
            <div className="error-details">
              <p><strong>File:</strong> {results.originalFilename}</p>
              <p><strong>Type:</strong> {results.type?.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">✅ Analysis Complete</div>
          <button className="btn" onClick={onClear}>Close</button>
        </div>
        <div className="panel-body">
          
          {/* KPI Row */}
          <div className="kpi-row">
            {results.stats && (
              <>
                <div className="kpi">
                  <div className="kpi-value">{results.stats.words.toLocaleString()}</div>
                  <div className="kpi-label">Words</div>
                </div>
                <div className="kpi">
                  <div className="kpi-value">{results.stats.characters.toLocaleString()}</div>
                  <div className="kpi-label">Characters</div>
                </div>
                <div className="kpi">
                  <div className="kpi-value">{results.stats.paragraphs}</div>
                  <div className="kpi-label">Paragraphs</div>
                </div>
              </>
            )}
            {results.type === 'image' && results.ocr && (
              <div className="kpi">
                <div className="kpi-value">{results.ocr.confidence}%</div>
                <div className="kpi-label">OCR Confidence</div>
              </div>
            )}
            {results.engagement && (
              <div className="kpi">
                <div className="kpi-value">{results.engagement.score}</div>
                <div className="kpi-label">Engagement</div>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="results-grid">
            
            {/* Extracted Content Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">📄 Extracted Content</div>
                <div className="action-row">
                  <button className="btn primary" onClick={copyToClipboard}>
                    📋 Copy
                  </button>
                  <button className="btn" onClick={downloadText}>
                    📥 Download
                  </button>
                </div>
              </div>
              <div className="panel-body">
                <pre className="text-box">{results.text || 'No text extracted'}</pre>
              </div>
            </div>

            {/* Smart Insights Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">💡 Smart Insights</div>
              </div>
              <div className="panel-body">
                <div className="insights">
                  
                  {/* File Details */}
                  <div className="insight-card">
                    <div className="insight-header">📁 File Details</div>
                    <div className="insight-content">
                      <div className="detail-row">
                        <span>Name:</span>
                        <span>{results.originalFilename}</span>
                      </div>
                      <div className="detail-row">
                        <span>Size:</span>
                        <span>{results.fileSize ? formatFileSize(results.fileSize) : 'Unknown'}</span>
                      </div>
                      <div className="detail-row">
                        <span>Type:</span>
                        <span>{results.type.toUpperCase()}</span>
                      </div>
                      {results.metadata?.pages && (
                        <div className="detail-row">
                          <span>Pages:</span>
                          <span>{results.metadata.pages}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Analysis */}
                  {results.engagement && (
                    <div className="insight-card">
                      <div className="insight-header">📊 Content Analysis</div>
                      <div className="insight-content">
                        <div className="analysis-item">
                          <span className="analysis-icon">🏷️</span>
                          <span>{results.engagement.analysis.hashtags.found} hashtags detected</span>
                        </div>
                        <div className="analysis-item">
                          <span className="analysis-icon">👆</span>
                          <span>{results.engagement.analysis.callToAction.found ? 'Call-to-action present' : 'No call-to-action found'}</span>
                        </div>
                        <div className="analysis-item">
                          <span className="analysis-icon">📏</span>
                          <span>Length: {results.engagement.analysis.length.status}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {results.engagement && results.engagement.suggestions.length > 0 && (
                    <div className="insight-card">
                      <div className="insight-header">🎯 Recommendations</div>
                      <div className="insight-content">
                        {results.engagement.suggestions.slice(0, 3).map((suggestion: EngagementSuggestion, index: number) => (
                          <div key={index} className={`suggestion priority-${suggestion.priority}`}>
                            <div className="suggestion-header">
                              <span className="suggestion-icon">{suggestion.icon}</span>
                              <span className="suggestion-title">{suggestion.title}</span>
                            </div>
                            <div className="suggestion-desc">{suggestion.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
