import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function pageNumbers(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  if (!files.length) {
    throw new Error('A PDF file is required.');
  }

  const position = options.position ?? 'bottom-center';

  onProgress(0, 'Loading PDF...');
  const arrayBuffer = await files[0].arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  onProgress(10, 'Embedding font...');
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    const text = `Page ${i + 1} of ${totalPages}`;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    const { x, y } = calculatePosition(position, width, height, textWidth);

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    onProgress(
      10 + Math.round(((i + 1) / totalPages) * 80),
      `Adding page number ${i + 1} of ${totalPages}`
    );
  }

  onProgress(95, 'Saving PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: 'numbered_document.pdf',
    mimeType: 'application/pdf',
    metadata: {
      pageCount: totalPages,
    },
  };
}

function calculatePosition(
  position: NonNullable<ProcessingOptions['position']>,
  pageWidth: number,
  pageHeight: number,
  textWidth: number
): { x: number; y: number } {
  let x: number;
  let y: number;

  // Vertical position
  if (position.startsWith('top')) {
    y = pageHeight - 30;
  } else {
    y = 30;
  }

  // Horizontal position
  if (position.endsWith('left')) {
    x = 40;
  } else if (position.endsWith('right')) {
    x = pageWidth - 40 - textWidth;
  } else {
    // center
    x = (pageWidth - textWidth) / 2;
  }

  return { x, y };
}
