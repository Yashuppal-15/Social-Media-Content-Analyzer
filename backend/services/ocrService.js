const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

/**
 * Extract text from image file using OCR
 * @param {string} imagePath - Path to the image file
 * @returns {Object} - OCR extraction results with metadata
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log(`🖼️ Processing image with OCR: ${imagePath}`);
    
    // Initialize Tesseract worker
    const { data } = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: (info) => {
          // Log progress for debugging
          if (info.status === 'recognizing text') {
            console.log(`📊 OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        }
      }
    );

    console.log('🔍 OCR Raw Data:', {
      hasText: !!data.text,
      hasWords: !!data.words,
      confidence: data.confidence,
      wordsLength: data.words ? data.words.length : 0
    });

    // Process extracted text
    let processedText = (data.text || '').trim();
    
    // Clean up common OCR artifacts
    processedText = processedText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple line breaks to double
      .replace(/([a-z])\s+([A-Z])/g, '$1 $2') // Fix spacing between words
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable characters
      .trim();

    // Calculate statistics
    const stats = {
      characters: processedText.length,
      charactersNoSpaces: processedText.replace(/\s/g, '').length,
      words: processedText.split(/\s+/).filter(word => word.length > 0).length,
      lines: processedText.split('\n').length,
      paragraphs: processedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    };

    // OCR specific metadata with safe checks
    const words = data.words || [];
    const validWords = words.filter(word => word && typeof word.confidence === 'number');
    
    const ocrMetadata = {
      confidence: Math.round(data.confidence || 0),
      meanConfidence: validWords.length > 0 
        ? Math.round(validWords.reduce((sum, word) => sum + word.confidence, 0) / validWords.length)
        : 0,
      wordCount: validWords.length,
      recognizedWords: validWords.filter(word => word.confidence > 60).length,
      lowConfidenceWords: validWords.filter(word => word.confidence < 60).length
    };

    console.log(`✅ OCR completed: ${stats.words} words, ${ocrMetadata.confidence}% confidence`);

    return {
      success: true,
      text: processedText,
      stats: stats,
      ocr: ocrMetadata,
      extractedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ OCR extraction error:', error.message);
    console.error('❌ Full error:', error);
    
    // Handle specific OCR errors
    if (error.message.includes('Invalid image')) {
      throw new Error('Invalid image file. Please ensure the image is not corrupted and is in JPG or PNG format.');
    } else if (error.message.includes('not found')) {
      throw new Error('Image file not found. Please try uploading again.');
    } else if (error.message.includes('Cannot read properties')) {
      throw new Error('OCR processing failed. The image may be too complex or corrupted. Please try a clearer image.');
    } else {
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }
};

/**
 * Validate if file is a supported image format
 * @param {string} imagePath - Path to the image file
 * @returns {boolean} - True if valid image
 */
const isValidImage = (imagePath) => {
  try {
    const buffer = fs.readFileSync(imagePath);
    // Check for common image file signatures
    const jpegSignature = buffer.toString('hex', 0, 3) === 'ffd8ff';
    const pngSignature = buffer.toString('hex', 0, 8) === '89504e470d0a1a0a';
    
    return jpegSignature || pngSignature;
  } catch (error) {
    return false;
  }
};

/**
 * Get image file information without OCR processing
 * @param {string} imagePath - Path to the image file
 * @returns {Object} - Image metadata
 */
const getImageInfo = async (imagePath) => {
  try {
    const stats = fs.statSync(imagePath);
    const buffer = fs.readFileSync(imagePath);
    
    // Detect image type
    let imageType = 'unknown';
    if (buffer.toString('hex', 0, 3) === 'ffd8ff') {
      imageType = 'JPEG';
    } else if (buffer.toString('hex', 0, 8) === '89504e470d0a1a0a') {
      imageType = 'PNG';
    }

    return {
      size: stats.size,
      type: imageType,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    throw new Error(`Failed to get image information: ${error.message}`);
  }
};

module.exports = {
  extractTextFromImage,
  isValidImage,
  getImageInfo
};
