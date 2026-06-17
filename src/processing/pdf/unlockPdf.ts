import { PDFDocument } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function unlockPdf(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading encrypted PDF...');

  const arrayBuffer = await mainFile.arrayBuffer();

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(arrayBuffer, {
      password: options.password || '',
    });
  } catch {
    throw new Error('Incorrect password or corrupt file.');
  }

  onProgress(50, 'Removing encryption...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: `unlocked_${mainFile.name}`,
    mimeType: 'application/pdf',
  };
}
