const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import services
const { extractTextFromPDF, isValidPDF } = require('./services/pdfService');
const { extractTextFromImage, isValidImage } = require('./services/ocrService');
const { analyzeEngagement } = require('./services/engagementService');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg', 
    'image/jpg',
    'image/png'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Social Media Content Analyzer API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      extract: '/api/extract'
    },
    features: {
      pdfProcessing: true,
      ocrProcessing: true,
      engagementAnalysis: true,
      supportedFormats: ['PDF', 'JPG', 'PNG']
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      pdfParser: 'available',
      ocrEngine: 'available',
      engagementAnalyzer: 'available'
    }
  });
});

// Main extraction endpoint - handles both PDF and images
app.post('/api/extract', async (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          message: 'File size exceeds 10MB limit'
        });
      }
      return res.status(400).json({
        error: 'Upload error',
        message: err.message
      });
    } else if (err) {
      return res.status(400).json({
        error: 'File validation error',
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    try {
      let extractionResult = {};
      const filePath = req.file.path;

      // Process based on file type
      if (req.file.mimetype === 'application/pdf') {
        console.log('📄 Processing PDF file...');
        extractionResult = await extractTextFromPDF(filePath);
        extractionResult.type = 'pdf';
        
      } else if (req.file.mimetype.startsWith('image/')) {
        console.log('🖼️ Processing image file with OCR...');
        extractionResult = await extractTextFromImage(filePath);
        extractionResult.type = 'image';
      }

      // Add engagement analysis if extraction was successful
      if (extractionResult.success && extractionResult.text) {
        console.log('📊 Analyzing content for engagement...');
        extractionResult.engagement = analyzeEngagement(extractionResult.text, extractionResult.type);
      }

      // Clean up uploaded file after processing
      fs.unlinkSync(filePath);

      // Log successful extraction
      if (extractionResult.success) {
        console.log('✅ Text extraction completed:', {
          type: extractionResult.type,
          words: extractionResult.stats?.words || 0,
          characters: extractionResult.stats?.characters || 0,
          confidence: extractionResult.ocr?.confidence || 'N/A',
          engagementScore: extractionResult.engagement?.score || 'N/A'
        });
      }

      res.json({
        ...extractionResult,
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        processedAt: new Date().toISOString()
      });

    } catch (error) {
      // Clean up file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('❌ Extraction error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Text extraction failed',
        message: error.message,
        type: req.file.mimetype.startsWith('image/') ? 'image' : 'pdf'
      });
    }
  });
});

// Legacy upload endpoint (for basic file uploads without processing)
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully!',
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `${req.method} ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`📄 PDF Processing: ✅ Available`);
  console.log(`🖼️ OCR Processing: ✅ Available`);
  console.log(`📊 Engagement Analysis: ✅ Available`);
  console.log(`📁 Extract endpoint: http://localhost:${PORT}/api/extract`);
});
