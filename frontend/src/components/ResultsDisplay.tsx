import React from 'react';
import './ResultsDisplay.css';

interface ExtractionStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
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
      element.download = `extracted-text-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
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
      <div className="results-header">
        <h3>✅ Text Extracted Successfully</h3>
        <button onClick={onClear} className="clear-button">✕</button>
      </div>

      {/* File Information */}
      <div className="file-metadata">
        <div className="metadata-item">
          <span className="label">File:</span>
          <span className="value">{results.originalFilename}</span>
        </div>
        <div className="metadata-item">
          <span className="label">Type:</span>
          <span className="value">{results.type?.toUpperCase()}</span>
        </div>
        <div className="metadata-item">
          <span className="label">Size:</span>
          <span className="value">{results.fileSize ? formatFileSize(results.fileSize) : 'Unknown'}</span>
        </div>
        {results.metadata?.pages && (
          <div className="metadata-item">
            <span className="label">Pages:</span>
            <span className="value">{results.metadata.pages}</span>
          </div>
        )}
      </div>

      {/* Text Statistics */}
      {results.stats && (
        <div className="text-stats">
          <h4>📊 Text Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{results.stats.words.toLocaleString()}</span>
              <span className="stat-label">Words</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{results.stats.characters.toLocaleString()}</span>
              <span className="stat-label">Characters</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{results.stats.paragraphs}</span>
              <span className="stat-label">Paragraphs</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{results.stats.lines}</span>
              <span className="stat-label">Lines</span>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Text */}
      <div className="extracted-text">
        <h4>📄 Extracted Text</h4>
        <div className="text-actions">
          <button onClick={copyToClipboard} className="action-button">
            📋 Copy Text
          </button>
          <button onClick={downloadText} className="action-button">
            💾 Download
          </button>
        </div>
        <div className="text-content">
          <pre className="text-display">{results.text}</pre>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
