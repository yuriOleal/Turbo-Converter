import * as pdfjsLib from 'pdfjs-dist';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function pdfReader(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading PDF...');

  const arrayBuffer = await mainFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const renderedPages: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context unavailable.');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/png');
    renderedPages.push(dataUrl);

    onProgress(
      Math.round((i / numPages) * 100),
      `Rendered page ${i} of ${numPages}`
    );
  }

  onProgress(100, 'Done');

  return {
    success: true,
    blob: new Blob(),
    fileName: '',
    mimeType: '',
    metadata: {
      pageCount: numPages,
      renderedPages,
    },
  };
}
