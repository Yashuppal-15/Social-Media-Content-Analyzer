import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  progress?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isUploading, progress = 0 }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File rejected: ';
      
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        errorMessage += 'File too large (max 10MB)';
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        errorMessage += 'Invalid file type (only PDF, JPG, PNG allowed)';
      } else {
        errorMessage += 'Unknown error';
      }
      
      showNotification(errorMessage, 'error');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('File selected:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `upload-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 30px;
      right: 30px;
      background: ${type === 'success'
        ? 'linear-gradient(135deg, #22c55e, #34D399)'
        : 'linear-gradient(135deg, #ef4444, #f87171)'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      z-index: 10000;
      animation: slideInRight 0.4s ease;
      max-width: 350px;
      font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  return (
    <div className="file-upload-container">
      {isUploading ? (
        <div className="upload-card">
          <div className="upload-processing">
            <div className="processing-icon">⚡</div>
            <div className="upload-title">Processing your file...</div>
            <div className="upload-subtitle">AI is analyzing your content</div>
            <div className="progress-wrap">
              <div className="progress-bar">
                <span style={{ width: `${Math.round(progress)}%` }}></span>
              </div>
              <div className="progress-text">{Math.round(progress)}% complete</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="upload-card">
          <div 
            {...getRootProps()} 
            className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="upload-content">
              <div className="upload-icon">
                {isDragActive ? '📁' : '🚀'}
              </div>
              <div className="upload-title">
                {isDragActive ? 'Drop it here!' : 'Drag & drop your file here'}
              </div>
              <div className="upload-subtitle">
                or <span className="click-text">click to browse</span>
              </div>
              <div className="format-types">
                <span className="type-pill">📄 PDF</span>
                <span className="type-pill">🖼️ JPG</span>
                <span className="type-pill">📸 PNG</span>
                <span className="type-pill">📏 Max 10MB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
