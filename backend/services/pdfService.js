const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

/**
 * Extract text from PDF file while attempting to preserve formatting
 * @param {string} filePath - Path to the PDF file
 * @returns {Object} - Extracted text data with metadata
 */
const extractTextFromPDF = async (filePath) => {
  try {
    console.log(`📄 Processing PDF: ${filePath}`);
    
    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse PDF with options to preserve some formatting
    const data = await pdf(dataBuffer, {
      // Preserve spacing and line breaks
      normalizeWhitespace: false,
      disableCombineTextItems: false
    });
    
    // Process text to improve formatting
    let processedText = data.text;
    
    // Clean up excessive whitespace while preserving structure
    processedText = processedText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple line breaks to double
      .replace(/[ \t]+/g, ' ') // Multiple spaces to single
      .replace(/\n /g, '\n') // Remove spaces after line breaks
      .trim();
    
    // Calculate statistics
    const stats = {
      characters: processedText.length,
      charactersNoSpaces: processedText.replace(/\s/g, '').length,
      words: processedText.split(/\s+/).filter(word => word.length > 0).length,
      lines: processedText.split('\n').length,
      paragraphs: processedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    };
    
    console.log(`✅ PDF processed: ${stats.words} words, ${stats.paragraphs} paragraphs`);
    
    return {
      success: true,
      text: processedText,
      metadata: {
        pages: data.numpages,
        info: data.info || {},
        version: data.version || 'Unknown'
      },
      stats: stats,
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ PDF extraction error:', error.message);
    
    // Handle specific PDF errors
    if (error.message.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file. The file may be corrupted or password-protected.');
    } else if (error.message.includes('not found')) {
      throw new Error('PDF file not found. Please try uploading again.');
    } else {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }
};

/**
 * Validate if file is a valid PDF
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if valid PDF
 */
const isValidPDF = (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    // Check PDF magic number
    return buffer.toString('ascii', 0, 4) === '%PDF';
  } catch (error) {
    return false;
  }
};

/**
 * Get PDF metadata without full extraction
 * @param {string} filePath - Path to the PDF file
 * @returns {Object} - PDF metadata
 */
const getPDFMetadata = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    return {
      pages: data.numpages,
      info: data.info || {},
      version: data.version || 'Unknown',
      textLength: data.text.length
    };
  } catch (error) {
    throw new Error(`Failed to extract PDF metadata: ${error.message}`);
  }
};

module.exports = {
  extractTextFromPDF,
  isValidPDF,
  getPDFMetadata
};
