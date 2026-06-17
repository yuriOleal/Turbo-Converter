import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function watermarkPdf(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  if (!files.length) {
    throw new Error('A PDF file is required.');
  }

  const watermarkText = options.watermarkText;
  if (!watermarkText) {
    throw new Error('Watermark text is required.');
  }

  const opacity = options.watermarkOpacity ?? 0.3;
  const fontSize = options.watermarkFontSize ?? 50;

  onProgress(0, 'Loading PDF...');
  const arrayBuffer = await files[0].arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  onProgress(10, 'Embedding font...');
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Calculate text width to center the watermark
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = fontSize;

    // Position the watermark at the center of the page
    const x = (width - textWidth) / 2;
    const y = (height - textHeight) / 2;

    page.drawText(watermarkText, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(45),
    });

    onProgress(
      10 + Math.round(((i + 1) / totalPages) * 80),
      `Watermarking page ${i + 1} of ${totalPages}`
    );
  }

  onProgress(95, 'Saving PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: 'watermarked_document.pdf',
    mimeType: 'application/pdf',
    metadata: {
      pageCount: totalPages,
    },
  };
}
