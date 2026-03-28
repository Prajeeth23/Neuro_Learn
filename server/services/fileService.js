const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const axios = require('axios');

// Polyfill for PDF.js / pdf-parse in Node environments
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {};
}

const apiKey = process.env.GEMINI_API_KEY;

/**
 * Extract text from an uploaded file based on its MIME type
 * Supports: PDF, DOCX, JPG/PNG (via Gemini Vision OCR)
 */
const extractTextFromFile = async (filePath, mimeType, originalName) => {
  const ext = path.extname(originalName).toLowerCase();

  try {
    // PDF
    if (mimeType === 'application/pdf' || ext === '.pdf') {
      const pdf = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    }

    // DOCX
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    // Images (JPG, PNG) — Use Gemini Vision for OCR
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType) || ['.jpg', '.jpeg', '.png'].includes(ext)) {
      return await extractTextFromImage(filePath, mimeType);
    }

    // Plain text fallback
    if (mimeType === 'text/plain' || ext === '.txt') {
      return fs.readFileSync(filePath, 'utf-8');
    }

    throw new Error(`Unsupported file type: ${mimeType} (${ext})`);
  } finally {
    // Clean up uploaded temp file
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
  }
};

/**
 * Extract text from image using Gemini Vision API
 */
const extractTextFromImage = async (filePath, mimeType) => {
  if (!apiKey) {
    throw new Error('Image OCR requires GEMINI_API_KEY in .env. Please provide it or use text/PDF materials.');
  }

  const imageData = fs.readFileSync(filePath);
  const base64Image = imageData.toString('base64');

  const GEMINI_VISION_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await axios.post(GEMINI_VISION_URL, {
    contents: [{
      parts: [
        { text: 'Extract ALL text from this image. Return only the raw extracted text, nothing else. If there is no text, return "No text found in image."' },
        {
          inline_data: {
            mime_type: mimeType || 'image/jpeg',
            data: base64Image
          }
        }
      ]
    }]
  });

  if (response.data.candidates && response.data.candidates[0].content) {
    return response.data.candidates[0].content.parts[0].text;
  }
  throw new Error('Failed to extract text from image');
};

module.exports = {
  extractTextFromFile
};
