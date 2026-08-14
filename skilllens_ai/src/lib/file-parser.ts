// ==============================
// File Parser — PDF and DOCX text extraction
// ==============================

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');
import mammoth from 'mammoth';

/**
 * Extract raw text from a PDF buffer.
 * Uses pdf-parse for fast, reliable extraction.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return cleanExtractedText(data.text);
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
  }
}

/**
 * Extract raw text from a DOCX buffer.
 * Uses mammoth for XML-based extraction with structural preservation.
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return cleanExtractedText(result.value);
  } catch (error) {
    console.error('DOCX extraction failed:', error);
    throw new Error('Failed to extract text from DOCX. The file may be corrupted.');
  }
}

/**
 * Route to the correct parser based on file extension / MIME type.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = fileName.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return extractTextFromPDF(buffer);
    case 'docx':
      return extractTextFromDOCX(buffer);
    case 'doc':
      throw new Error('Legacy .doc format is not supported. Please convert to .docx or .pdf.');
    case 'txt':
      return cleanExtractedText(buffer.toString('utf-8'));
    default:
      throw new Error(`Unsupported file format: .${ext}. Please upload a PDF or DOCX file.`);
  }
}

/**
 * Clean up extracted text:
 * - Remove excessive whitespace
 * - Normalize line breaks
 * - Trim leading/trailing whitespace
 */
function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')          // normalize line endings
    .replace(/\n{3,}/g, '\n\n')      // collapse excessive blank lines
    .replace(/[ \t]{2,}/g, ' ')      // collapse excessive spaces/tabs
    .replace(/\u0000/g, '')           // remove null bytes
    .trim();
}
