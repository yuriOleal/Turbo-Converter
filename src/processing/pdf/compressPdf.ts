import { PDFDocument } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function compressPdf(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const file = files[0];
  const originalSize = file.size;

  onProgress(0, 'Loading PDF...');
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();

  onProgress(10, 'Creating optimized PDF...');

  // Create a new PDF and copy all pages — this naturally strips orphaned objects
  const compressedPdf = await PDFDocument.create();

  for (let i = 0; i < totalPages; i++) {
    const [copiedPage] = await compressedPdf.copyPages(sourcePdf, [i]);
    compressedPdf.addPage(copiedPage);

    onProgress(
      10 + Math.round(((i + 1) / totalPages) * 70),
      `Optimizing page ${i + 1} of ${totalPages}`
    );
  }

  onProgress(85, 'Stripping metadata...');

  // Strip metadata to reduce size
  compressedPdf.setTitle('');
  compressedPdf.setAuthor('');
  compressedPdf.setSubject('');
  compressedPdf.setKeywords([]);
  compressedPdf.setCreator('');
  compressedPdf.setProducer('');

  onProgress(90, 'Saving compressed PDF...');

  // Save with useObjectStreams: false to reduce file size
  const pdfBytes = await compressedPdf.save({ useObjectStreams: false });
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const resultSize = blob.size;

  onProgress(100, 'Done');

  return {
    success: true,
    blob,
    fileName: 'compressed_document.pdf',
    mimeType: 'application/pdf',
    metadata: {
      originalSize,
      resultSize,
      pageCount: totalPages,
    },
  };
}
