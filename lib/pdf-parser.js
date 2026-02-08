import * as pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Return the extracted text
    return data.text.trim();
  } catch (error) {
    console.error(`Error parsing PDF ${filePath}:`, error);
    return '';
  }
}

/**
 * Extract text from multiple PDF files
 * @param {Array} files - Array of file objects with path property
 * @returns {Promise<Object>} - Object mapping filenames to their text content
 */
export async function extractTextFromPDFs(files) {
  const pdfFiles = files.filter(file => 
    file.filename?.toLowerCase().endsWith('.pdf') || 
    file.path?.toLowerCase().endsWith('.pdf')
  );

  if (pdfFiles.length === 0) {
    return {};
  }

  const extractionPromises = pdfFiles.map(async (file) => {
    const text = await extractTextFromPDF(file.path);
    return {
      filename: file.filename || path.basename(file.path),
      text: text,
      pageCount: text ? text.split('\n\n').length : 0
    };
  });

  const results = await Promise.all(extractionPromises);
  
  // Convert to object for easy access
  const textMap = {};
  results.forEach(result => {
    if (result.text) {
      textMap[result.filename] = result.text;
    }
  });

  return textMap;
}

/**
 * Combine all PDF text into a single string with headers
 * @param {Object} pdfTextMap - Object mapping filenames to text
 * @returns {string} - Combined text with document headers
 */
export function combinePDFTexts(pdfTextMap) {
  if (!pdfTextMap || Object.keys(pdfTextMap).length === 0) {
    return '';
  }

  const combined = Object.entries(pdfTextMap)
    .map(([filename, text]) => {
      return `--- Document: ${filename} ---\n${text}\n`;
    })
    .join('\n');

  return combined;
}
