import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function pdfToPng(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading PDF...');

  const arrayBuffer = await mainFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const zip = new JSZip();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context unavailable.');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport } as any).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    if (blob) zip.file(`page_${i}.png`, blob);

    onProgress(Math.round((i / pdf.numPages) * 90), `Rendered page ${i} of ${pdf.numPages}`);
  }

  onProgress(95, 'Creating ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob: zipBlob,
    fileName: 'pdf_pages.zip',
    mimeType: 'application/zip',
    metadata: { pageCount: pdf.numPages },
  };
}
