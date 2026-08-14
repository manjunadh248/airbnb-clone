// ==============================
// API: File Upload
// POST /api/upload — accepts PDF/DOCX resume files
// Returns extracted text
// ==============================

import { NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/file-parser';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer and extract text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extractedText = await extractTextFromFile(buffer, file.name);

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from the file. Please check the file content.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
      characterCount: extractedText.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
