import { PDFDocument } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function mergePdf(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  if (files.length < 2) {
    throw new Error('At least 2 PDF files are required to merge.');
  }

  onProgress(0, 'Starting merge...');
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const arrayBuffer = await files[i].arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));

    onProgress(Math.round(((i + 1) / files.length) * 90), `Merged file ${i + 1} of ${files.length}`);
  }

  onProgress(95, 'Saving merged PDF...');
  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: 'merged_document.pdf',
    mimeType: 'application/pdf',
    metadata: {
      pageCount: mergedPdf.getPageCount(),
    },
  };
}
