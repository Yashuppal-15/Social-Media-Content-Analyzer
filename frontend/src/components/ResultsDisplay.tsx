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
    // Simple notification - you can enhance this later
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      background: ${type === 'success' ? '#4CAF50' : '#f44336'};
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'linear-gradient(135deg, #10B981, #34D399)';
    if (score >= 60) return 'linear-gradient(135deg, #F59E0B, #FBBF24)';
    return 'linear-gradient(135deg, #EF4444, #F87171)';
  };

  if (!results.success) {
    return (
      <div className="modern-results-container error">
        <div className="modern-header">
          <div className="error-icon">⚠️</div>
          <div className="header-text">
            <h2>Processing Failed</h2>
            <p>{results.message || results.error}</p>
          </div>
          <button onClick={onClear} className="close-btn">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-results-container">
      {/* Modern Header */}
      <div className="modern-header">
        <div className="success-icon">✅</div>
        <div className="header-text">
          <h2>Analysis Complete</h2>
          <p>Your {results.type.toUpperCase()} file has been processed successfully</p>
        </div>
        <button onClick={onClear} className="close-btn">✕</button>
      </div>

      {/* Main Dashboard */}
      <div className="dashboard-grid">
        
        {/* Metrics Row */}
        <div className="metrics-row">
          {results.stats && (
            <>
              <div className="metric-card primary">
                <div className="metric-icon">📝</div>
                <div className="metric-content">
                  <div className="metric-value">{results.stats.words.toLocaleString()}</div>
                  <div className="metric-label">Words</div>
                </div>
              </div>
              
              <div className="metric-card secondary">
                <div className="metric-icon">🔤</div>
                <div className="metric-content">
                  <div className="metric-value">{results.stats.characters.toLocaleString()}</div>
                  <div className="metric-label">Characters</div>
                </div>
              </div>
              
              <div className="metric-card accent">
                <div className="metric-icon">📄</div>
                <div className="metric-content">
                  <div className="metric-value">{results.stats.paragraphs}</div>
                  <div className="metric-label">Paragraphs</div>
                </div>
              </div>
            </>
          )}

          {/* OCR Confidence for Images */}
          {results.type === 'image' && results.ocr && (
            <div className="metric-card confidence">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <div className="metric-value">{results.ocr.confidence}%</div>
                <div className="metric-label">OCR Confidence</div>
              </div>
            </div>
          )}

          {/* Engagement Score */}
          {results.engagement && (
            <div className="metric-card engagement">
              <div className="engagement-circle">
                <svg className="progress-ring" width="50" height="50">
                  <circle
                    className="progress-ring-background"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                  />
                  <circle
                    className="progress-ring-progress"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="transparent"
                    stroke={getScoreColor(results.engagement.score)}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - results.engagement.score / 100)}`}
                    transform="rotate(-90 25 25)"
                  />
                </svg>
                <div className="score-text">{results.engagement.score}</div>
              </div>
              <div className="metric-content">
                <div className="metric-value">{results.engagement.grade}</div>
                <div className="metric-label">Engagement</div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="content-grid">
          
          {/* Extracted Text Panel */}
          <div className="content-panel main-content">
            <div className="panel-header">
              <div className="panel-title">
                <span className="panel-icon">📄</span>
                <h3>Extracted Content</h3>
              </div>
              <div className="panel-actions">
                <button onClick={copyToClipboard} className="action-btn primary">
                  <span className="btn-icon">📋</span>
                  Copy
                </button>
                <button onClick={downloadText} className="action-btn secondary">
                  <span className="btn-icon">📥</span>
                  Download
                </button>
              </div>
            </div>
            
            <div className="text-container">
              <div className="text-content">
                {results.text || 'No text content extracted'}
              </div>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="content-panel insights">
            <div className="panel-header">
              <div className="panel-title">
                <span className="panel-icon">💡</span>
                <h3>Smart Insights</h3>
              </div>
            </div>
            
            <div className="insights-content">
              
              {/* File Info */}
              <div className="insight-section">
                <h4>File Details</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-key">Name:</span>
                    <span className="info-value">{results.originalFilename}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-key">Size:</span>
                    <span className="info-value">{results.fileSize ? formatFileSize(results.fileSize) : 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-key">Type:</span>
                    <span className="info-value">{results.type.toUpperCase()}</span>
                  </div>
                  {results.metadata?.pages && (
                    <div className="info-item">
                      <span className="info-key">Pages:</span>
                      <span className="info-value">{results.metadata.pages}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Engagement Analysis */}
              {results.engagement && (
                <div className="insight-section">
                  <h4>Content Analysis</h4>
                  <div className="analysis-grid">
                    <div className="analysis-item">
                      <span className="analysis-icon">🏷️</span>
                      <span className="analysis-text">{results.engagement.analysis.hashtags.found} hashtags detected</span>
                    </div>
                    <div className="analysis-item">
                      <span className="analysis-icon">👆</span>
                      <span className="analysis-text">{results.engagement.analysis.callToAction.found ? 'Call-to-action present' : 'No call-to-action found'}</span>
                    </div>
                    <div className="analysis-item">
                      <span className="analysis-icon">📏</span>
                      <span className="analysis-text">Content length: {results.engagement.analysis.length.status}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimization Suggestions */}
              {results.engagement && results.engagement.suggestions.length > 0 && (
                <div className="insight-section">
                  <h4>Recommendations</h4>
                  <div className="suggestions-list">
                    {results.engagement.suggestions.slice(0, 3).map((suggestion: EngagementSuggestion, index: number) => (
                      <div key={index} className={`suggestion-item ${suggestion.priority}`}>
                        <div className="suggestion-header">
                          <span className="suggestion-icon">{suggestion.icon}</span>
                          <span className="suggestion-title">{suggestion.title}</span>
                        </div>
                        <p className="suggestion-desc">{suggestion.description}</p>
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
  );
};

export default ResultsDisplay;
