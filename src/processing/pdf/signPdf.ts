import { PDFDocument } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function signPdf(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  if (!files.length) {
    throw new Error('A PDF file is required.');
  }

  if (!options.signatureImage) {
    throw new Error('Signature image is required.');
  }

  const signatureX = options.signatureX ?? 50;
  const signatureY = options.signatureY ?? 50;
  const signaturePage = options.signaturePage ?? 1;

  onProgress(0, 'Loading PDF...');
  const pdfArrayBuffer = await files[0].arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfArrayBuffer);

  onProgress(20, 'Loading signature image...');
  const imageArrayBuffer = await options.signatureImage.arrayBuffer();
  const imageBytes = new Uint8Array(imageArrayBuffer);

  // Try embedding as PNG first, fall back to JPG
  let embeddedImage;
  try {
    embeddedImage = await pdfDoc.embedPng(imageBytes);
  } catch {
    try {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    } catch {
      throw new Error('Signature image must be in PNG or JPG format.');
    }
  }

  onProgress(50, 'Placing signature on page...');

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  // Validate page number
  const targetPageIndex = signaturePage - 1;
  if (targetPageIndex < 0 || targetPageIndex >= totalPages) {
    throw new Error(
      `Invalid page number: ${signaturePage}. Document has ${totalPages} page(s).`
    );
  }

  const page = pages[targetPageIndex];

  // Calculate dimensions preserving aspect ratio with max width of 200
  const maxWidth = 200;
  const maxHeight = 80;
  const originalWidth = embeddedImage.width;
  const originalHeight = embeddedImage.height;

  let drawWidth = originalWidth;
  let drawHeight = originalHeight;

  // Scale down if wider than maxWidth
  if (drawWidth > maxWidth) {
    const scale = maxWidth / drawWidth;
    drawWidth = maxWidth;
    drawHeight = originalHeight * scale;
  }

  // Scale down further if still taller than maxHeight
  if (drawHeight > maxHeight) {
    const scale = maxHeight / drawHeight;
    drawHeight = maxHeight;
    drawWidth = drawWidth * scale;
  }

  page.drawImage(embeddedImage, {
    x: signatureX,
    y: signatureY,
    width: drawWidth,
    height: drawHeight,
  });

  onProgress(80, 'Saving signed PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: 'signed_document.pdf',
    mimeType: 'application/pdf',
    metadata: {
      pageCount: totalPages,
    },
  };
}
