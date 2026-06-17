import { PDFDocument, degrees } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';
import { parsePageRanges } from '../utils';

export default async function rotatePdf(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading PDF...');

  const rotationAngle = options.rotationAngle;
  if (!rotationAngle || ![90, 180, 270].includes(rotationAngle)) {
    throw new Error('A valid rotation angle (90, 180, or 270) is required.');
  }

  const arrayBuffer = await mainFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  // Determine which pages to rotate (0-indexed)
  const pagesToRotate = options.pages
    ? parsePageRanges(options.pages, totalPages)
    : Array.from({ length: totalPages }, (_, i) => i);

  if (pagesToRotate.length === 0) {
    throw new Error('No valid pages selected for rotation.');
  }

  onProgress(5, 'Rotating pages...');

  for (let i = 0; i < pagesToRotate.length; i++) {
    const pageIdx = pagesToRotate[i];
    const page = pdfDoc.getPage(pageIdx);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotationAngle));

    onProgress(Math.round(((i + 1) / pagesToRotate.length) * 100), `Rotated page ${i + 1} of ${pagesToRotate.length}`);
  }

  onProgress(95, 'Saving PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: 'rotated_document.pdf',
    mimeType: 'application/pdf',
    metadata: {
      pageCount: totalPages,
    },
  };
}
