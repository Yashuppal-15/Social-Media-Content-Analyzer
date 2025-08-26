import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import './App.css';

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

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const apiUrl = process.env.REACT_APP_API_URL;

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setExtractionResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('🔄 Processing file:', file.name);
      
      const response = await fetch(`${apiUrl}/api/extract`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setExtractionResult(result);
        console.log('✅ Processing completed:', result.success ? 'Success' : 'Failed');
      } else {
        setExtractionResult({
          success: false,
          message: result.message || result.error || 'Processing failed',
          type: file.type.startsWith('image/') ? 'image' : 'pdf',
          originalFilename: file.name,
          fileSize: file.size
        });
      }
    } catch (error) {
      console.error('❌ Processing error:', error);
      setExtractionResult({
        success: false,
        message: 'Network error: Could not connect to server',
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        originalFilename: file.name,
        fileSize: file.size
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearResults = () => {
    setExtractionResult(null);
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      setBackendStatus('online');
      alert(`🎉 Backend is running perfectly!\n\nStatus: ${data.status}\nUptime: ${Math.round(data.uptime)}s`);
    } catch (error) {
      setBackendStatus('offline');
      alert('❌ Backend connection failed\n\nPlease check if your backend server is running.');
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return '#4CAF50';
      case 'offline': return '#f44336';
      default: return '#ff9800';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online': return 'Backend Online';
      case 'offline': return 'Backend Offline';
      default: return 'Checking...';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <h1>🚀 Social Media Content Analyzer</h1>
          <p className="subtitle">Transform your documents into actionable insights</p>
          
          <div className="feature-badge floating">
            PDF + OCR Processing Available
          </div>

          <div className="connection-section">
            <div className="test-connection-card glass-card">
              <button onClick={testBackendConnection} className="test-button">
                🔌 Test Connection
              </button>
              <div className="status-indicator" style={{ marginTop: '10px' }}>
                <span 
                  className="status-dot" 
                  style={{ background: getStatusColor() }}
                ></span>
                {getStatusText()}
              </div>
            </div>
            <div className="api-url">API: {apiUrl}</div>
          </div>
        </div>
      </header>
      
      <main className="App-main">
        {/* Features Section */}
        <div className="features-section">
          <div className="feature-card">
            <span className="feature-icon">📄</span>
            <h3>PDF Processing</h3>
            <p>Extract text from PDF documents with formatting preservation and detailed statistics</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🖼️</span>
            <h3>OCR Technology</h3>
            <p>Extract text from images and scanned documents using advanced Tesseract OCR engine</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Smart Analysis</h3>
            <p>Get confidence scores, accuracy metrics, and content optimization recommendations</p>
          </div>
        </div>

        <FileUpload onFileUpload={handleFileUpload} isUploading={isProcessing} />
        <ResultsDisplay results={extractionResult} onClear={handleClearResults} />
      </main>
    </div>
  );
}

export default App;
