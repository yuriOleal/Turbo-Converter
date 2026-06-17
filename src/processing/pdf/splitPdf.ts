import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';
import { parsePageRanges } from '../utils';

export default async function splitPdf(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading PDF...');

  const arrayBuffer = await mainFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  const pagesToExtract = options.pages
    ? parsePageRanges(options.pages, totalPages)
    : Array.from({ length: totalPages }, (_, i) => i);

  if (pagesToExtract.length === 0) {
    throw new Error('Invalid page range selected.');
  }

  onProgress(10, 'Splitting pages...');
  const zip = new JSZip();

  for (let i = 0; i < pagesToExtract.length; i++) {
    const pageIdx = pagesToExtract[i];
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIdx]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    zip.file(`page_${pageIdx + 1}.pdf`, pdfBytes);

    onProgress(
      10 + Math.round(((i + 1) / pagesToExtract.length) * 80),
      `Split page ${i + 1} of ${pagesToExtract.length}`
    );
  }

  onProgress(95, 'Creating ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob: zipBlob,
    fileName: `split_${mainFile.name}.zip`,
    mimeType: 'application/zip',
    metadata: {
      pageCount: pagesToExtract.length,
    },
  };
}
