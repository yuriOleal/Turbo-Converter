import { PDFDocument } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';
import { parsePageRanges } from '../utils';

export default async function removePages(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading PDF...');

  const arrayBuffer = await mainFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  const pagesToRemove = new Set(
    options.pages ? parsePageRanges(options.pages, totalPages) : []
  );

  if (pagesToRemove.size === 0) {
    throw new Error('No pages specified for removal.');
  }

  const pagesToKeep: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (!pagesToRemove.has(i)) {
      pagesToKeep.push(i);
    }
  }

  if (pagesToKeep.length === 0) {
    throw new Error('Cannot remove all pages from the PDF.');
  }

  onProgress(30, 'Removing pages...');
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));

  onProgress(80, 'Saving PDF...');
  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: `cleaned_${mainFile.name}`,
    mimeType: 'application/pdf',
    metadata: {
      pageCount: pagesToKeep.length,
    },
  };
}
