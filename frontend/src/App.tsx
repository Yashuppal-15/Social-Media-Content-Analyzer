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

interface EngagementAnalysis {
  score: number;
  grade: string;
  suggestions: any[];
  analysis: any;
  optimizedContent?: string;
}

interface ExtractionResult {
  success: boolean;
  text?: string;
  type: 'pdf' | 'image';
  metadata?: any;
  stats?: ExtractionStats;
  ocr?: OCRMetadata;
  engagement?: EngagementAnalysis;
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [processingProgress, setProcessingProgress] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check backend status
  useEffect(() => {
    checkBackendStatus();
    const statusInterval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(statusInterval);
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

  const simulateProgress = () => {
    setProcessingProgress(0);
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return progressInterval;
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setExtractionResult(null);
    
    const progressInterval = simulateProgress();

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
        setProcessingProgress(100);
        setTimeout(() => {
          setExtractionResult(result);
          console.log('✅ Processing completed:', result.success ? 'Success' : 'Failed');
        }, 500);
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
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProcessingProgress(0);
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
      
      // Create elegant notification
      showNotification('🎉 Backend Connected Successfully!', 'success');
    } catch (error) {
      setBackendStatus('offline');
      showNotification('❌ Backend Connection Failed', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `elegant-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 30px;
      right: 30px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #10B981, #34D399)' : 'linear-gradient(135deg, #EF4444, #F87171)'};
      color: white;
      padding: 20px 24px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1);
      backdrop-filter: blur(20px);
      z-index: 10000;
      animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return '#10B981';
      case 'offline': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online': return 'All Systems Online';
      case 'offline': return 'System Offline';
      default: return 'Connecting...';
    }
  };

  return (
    <div className="app-container">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">ContentAI</span>
          </div>
        </div>
        
        <div className="status-center">
          <div className="system-status">
            <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}></div>
            <span className="status-text">{getStatusText()}</span>
          </div>
        </div>
        
        <div className="status-right">
          <div className="current-time">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!extractionResult ? (
          <>
            {/* Hero Section */}
            <div className="hero-section">
              <div className="hero-content">
                <h1 className="hero-title">
                  <span className="title-gradient">Social Media</span><br/>
                  <span className="title-white">Content Analyzer</span>
                </h1>
                <p className="hero-subtitle">
                  Transform your documents into optimized social media content with 
                  <span className="highlight"> advanced PDF processing</span>, 
                  <span className="highlight"> OCR technology</span>, and 
                  <span className="highlight"> intelligent engagement analysis</span>
                </p>
                
                {/* Feature Pills */}
                <div className="feature-pills">
                  <div className="pill">📄 PDF Processing</div>
                  <div className="pill">🖼️ OCR Technology</div>
                  <div className="pill">📊 AI Analysis</div>
                  <div className="pill">🎯 Optimization</div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Accuracy</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🚀</div>
                  <div className="stat-number">3s</div>
                  <div className="stat-label">Processing</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-number">10MB</div>
                  <div className="stat-label">Max Size</div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="upload-section">
              <FileUpload 
                onFileUpload={handleFileUpload} 
                isUploading={isProcessing}
                progress={processingProgress}
              />
              
              {/* Connection Test */}
              <div className="connection-panel">
                <button 
                  onClick={testBackendConnection} 
                  className="test-connection-btn"
                  disabled={backendStatus === 'checking'}
                >
                  <span className="btn-icon">🔌</span>
                  <span className="btn-text">Test System Connection</span>
                  <div className="btn-status" style={{ backgroundColor: getStatusColor() }}></div>
                </button>
              </div>
            </div>

            {/* Floating Background Elements - Larger Size */}
            <div className="floating-elements">
              <div className="floating-element element-1">
                <div className="social-card">
                  <div className="social-icon">📱</div>
                  <div className="social-text">Social Posts</div>
                </div>
              </div>
              
              <div className="floating-element element-2">
                <div className="doc-card">
                  <div className="doc-icon">📄</div>
                  <div className="doc-lines">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                  </div>
                </div>
              </div>
              
              <div className="floating-element element-3">
                <div className="hashtag-card">
                  <span className="hashtag">#content</span>
                  <span className="hashtag">#social</span>
                  <span className="hashtag">#AI</span>
                </div>
              </div>
              
              <div className="floating-element element-4">
                <div className="analytics-card">
                  <div className="chart-bars">
                    <div className="bar" style={{height: '60%'}}></div>
                    <div className="bar" style={{height: '80%'}}></div>
                    <div className="bar" style={{height: '40%'}}></div>
                    <div className="bar" style={{height: '90%'}}></div>
                  </div>
                  <div className="chart-label">Analytics</div>
                </div>
              </div>
              
              <div className="floating-element element-5">
                <div className="engagement-card">
                  <div className="engagement-icon">❤️</div>
                  <div className="engagement-number">1.2K</div>
                  <div className="engagement-label">Engagement</div>
                </div>
              </div>
              
              <div className="floating-element element-6">
                <div className="ocr-card">
                  <div className="ocr-icon">👁️</div>
                  <div className="ocr-text">OCR Scan</div>
                  <div className="ocr-progress">
                    <div className="ocr-bar"></div>
                  </div>
                </div>
              </div>

              <div className="floating-element element-7">
                <div className="ai-card">
                  <div className="ai-icon">🤖</div>
                  <div className="ai-text">AI Analysis</div>
                  <div className="ai-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>

              <div className="floating-element element-8">
                <div className="content-card">
                  <div className="content-icon">✨</div>
                  <div className="content-text">Content</div>
                  <div className="content-text">Optimizer</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ResultsDisplay 
            results={extractionResult} 
            onClear={handleClearResults} 
          />
        )}
      </div>

      {/* Footer */}
      <div className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-text">Powered by Advanced AI & Machine Learning</span>
          </div>
          <div className="footer-right">
            <div className="tech-stack">
              <span className="tech-item">React</span>
              <span className="tech-item">TypeScript</span>
              <span className="tech-item">Node.js</span>
              <span className="tech-item">Tesseract.js</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
