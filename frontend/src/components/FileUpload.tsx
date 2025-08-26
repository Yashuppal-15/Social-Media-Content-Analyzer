import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
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
      
      alert(errorMessage);
      return;
    }

    // Handle accepted file
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      console.log('File selected:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
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

  // Reset progress when not uploading
  React.useEffect(() => {
    if (!isUploading) {
      setUploadProgress(0);
    }
  }, [isUploading]);

  return (
    <div className="file-upload-container">
      <div className={`upload-card ${isDragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}>
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="upload-state">
              <div className="spinner-container">
                <div className="spinner-glow"></div>
                <div className="spinner"></div>
              </div>
              <p>Processing your file...</p>
              <div className="upload-progress">
                <div 
                  className="upload-progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon-container">
                <div className="upload-icon-bg"></div>
                <div className="upload-icon">
                  {isDragActive ? '📁' : '📄'}
                </div>
              </div>
              
              {isDragActive ? (
                <>
                  <p className="primary-text">Drop it like it's hot! 🔥</p>
                  <p className="secondary-text">Release to upload your file</p>
                </>
              ) : (
                <>
                  <p className="primary-text">Drag & drop your file here</p>
                  <p className="secondary-text">or <span className="click-text">click to browse</span></p>
                  <div className="file-types">
                    <span className="file-type">📄 PDF</span>
                    <span className="file-type">🖼️ JPG</span>
                    <span className="file-type">📸 PNG</span>
                  </div>
                  <p className="size-limit">Maximum file size: 10MB</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
