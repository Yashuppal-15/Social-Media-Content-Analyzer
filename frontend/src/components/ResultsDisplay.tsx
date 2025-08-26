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
        alert('✅ Text copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('❌ Failed to copy text');
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
    }
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#4CAF50'; // Green
    if (confidence >= 60) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  if (!results.success) {
    return (
      <div className="results-container error">
        <div className="results-header">
          <h3>❌ Extraction Failed</h3>
          <button onClick={onClear} className="clear-button">✕</button>
        </div>
        
        <div className="error-content">
          <p className="error-message">{results.message || results.error}</p>
          <div className="file-info">
            <p><strong>File:</strong> {results.originalFilename}</p>
            <p><strong>Type:</strong> {results.type?.toUpperCase()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container success">
      {/* Header Section */}
      <div className="results-header">
        <div className="header-content">
          <div className="success-badge">
            <span className="badge-icon">✅</span>
            <span className="badge-text">Extraction Completed</span>
          </div>
          <div className="file-type-badge">
            {results.type === 'pdf' ? '📄 PDF' : '🖼️ IMAGE'}
          </div>
        </div>
        <button onClick={onClear} className="clear-button">✕</button>
      </div>

      {/* Main Content Grid */}
      <div className="results-grid">
        
        {/* Left Column */}
        <div className="results-left">
          
          {/* File Information Card */}
          <div className="info-card">
            <h4 className="card-title">📁 File Information</h4>
            <div className="info-items">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{results.originalFilename}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Size:</span>
                <span className="info-value">{results.fileSize ? formatFileSize(results.fileSize) : 'Unknown'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">{results.type?.toUpperCase()}</span>
              </div>
              {results.metadata?.pages && (
                <div className="info-item">
                  <span className="info-label">Pages:</span>
                  <span className="info-value">{results.metadata.pages}</span>
                </div>
              )}
            </div>
          </div>

          {/* OCR Confidence Card (for images) */}
          {results.type === 'image' && results.ocr && (
            <div className="info-card ocr-card">
              <h4 className="card-title">🤖 OCR Analysis</h4>
              
              <div className="confidence-main">
                <div className="confidence-circle">
                  <div 
                    className="confidence-fill" 
                    style={{ 
                      background: `conic-gradient(${getConfidenceColor(results.ocr.confidence)} ${results.ocr.confidence * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                    }}
                  >
                    <div className="confidence-inner">
                      <span className="confidence-percent">{results.ocr.confidence}%</span>
                      <span className="confidence-label-small">{getConfidenceLabel(results.ocr.confidence)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ocr-details">
                  <div className="ocr-detail-item">
                    <span className="ocr-number">{results.ocr.recognizedWords}</span>
                    <span className="ocr-label">High Confidence</span>
                  </div>
                  <div className="ocr-detail-item">
                    <span className="ocr-number">{results.ocr.lowConfidenceWords}</span>
                    <span className="ocr-label">Low Confidence</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Text Statistics Card */}
          {results.stats && (
            <div className="info-card stats-card">
              <h4 className="card-title">📊 Text Statistics</h4>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-number">{results.stats.words.toLocaleString()}</span>
                  <span className="stat-label">Words</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{results.stats.characters.toLocaleString()}</span>
                  <span className="stat-label">Characters</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{results.stats.paragraphs}</span>
                  <span className="stat-label">Paragraphs</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{results.stats.lines}</span>
                  <span className="stat-label">Lines</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Extracted Text */}
        <div className="results-right">
          <div className="text-card">
            <div className="text-header">
              <h4 className="card-title">📄 Extracted Content</h4>
              <div className="text-actions">
                <button onClick={copyToClipboard} className="action-btn copy-btn">
                  <span className="btn-icon">📋</span>
                  Copy
                </button>
                <button onClick={downloadText} className="action-btn download-btn">
                  <span className="btn-icon">💾</span>
                  Download
                </button>
              </div>
            </div>
            
            <div className="text-content">
              <div className="text-display-container">
                <pre className="text-display">{results.text || 'No text extracted'}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
