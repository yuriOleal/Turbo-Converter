import { PDFDocument } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function organizePdf(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading PDF...');

  if (!options.pageOrder) {
    throw new Error('Page order is required. Provide a comma-separated list of page numbers (e.g. "3,1,2").');
  }

  const arrayBuffer = await mainFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  onProgress(10, 'Parsing page order...');

  // Parse the pageOrder string into an array of 1-indexed page numbers
  const order = options.pageOrder
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const num = Number(s);
      if (!Number.isInteger(num)) {
        throw new Error(`Invalid page number "${s}". Page numbers must be integers.`);
      }
      return num;
    });

  if (order.length === 0) {
    throw new Error('Page order cannot be empty. Provide at least one page number.');
  }

  // Validate all page numbers are within bounds
  for (const pageNum of order) {
    if (pageNum < 1 || pageNum > totalPages) {
      throw new Error(
        `Page ${pageNum} does not exist. This PDF has ${totalPages} page${totalPages === 1 ? '' : 's'}.`
      );
    }
  }

  onProgress(20, 'Reordering pages...');

  // Create a new PDF and copy pages in the specified order
  const newPdf = await PDFDocument.create();

  for (let i = 0; i < order.length; i++) {
    const pageIndex = order[i] - 1; // Convert 1-indexed to 0-indexed
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
    newPdf.addPage(copiedPage);

    onProgress(
      20 + Math.round(((i + 1) / order.length) * 70),
      `Copied page ${i + 1} of ${order.length}`
    );
  }

  onProgress(95, 'Saving reordered PDF...');
  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Done');

  return {
    success: true,
    blob,
    fileName: 'reordered_document.pdf',
    mimeType: 'application/pdf',
    metadata: {
      pageCount: order.length,
    },
  };
}
