import { jsPDF } from 'jspdf';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function htmlToPdf(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  if (files.length === 0) {
    throw new Error('At least one HTML file is required.');
  }

  onProgress(0, 'Loading HTML content...');

  const htmlContent = await files[0].text();

  onProgress(50, 'Rendering HTML to PDF...');

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '210mm';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    const doc = new jsPDF();

    const pdfBlob = await new Promise<Blob>((resolve, reject) => {
      doc.html(container, {
        callback: (pdfDoc) => {
          const blob = pdfDoc.output('blob');
          resolve(blob);
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 794,
      });
    });

    onProgress(100, 'Done');

    return {
      success: true,
      blob: pdfBlob,
      fileName: 'converted_document.pdf',
      mimeType: 'application/pdf',
      metadata: {
        pageCount: doc.getNumberOfPages(),
      },
    };
  } finally {
    document.body.removeChild(container);
  }
}
