import * as pdfjsLib from 'pdfjs-dist';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function pdfToText(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading PDF...');

  const arrayBuffer = await mainFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();

    pageTexts.push(`--- Page ${i} ---\n\n${pageText}`);

    onProgress(
      Math.round((i / numPages) * 90),
      `Extracted text from page ${i} of ${numPages}`
    );
  }

  const allText = pageTexts.join('\n\n');
  const hasText = pageTexts.some((text) => text.replace(/--- Page \d+ ---/, '').trim().length > 0);

  onProgress(95, 'Creating text file...');

  const blob = new Blob([allText], { type: 'text/plain' });

  onProgress(100, 'Done');

  return {
    success: true,
    blob,
    fileName: 'extracted_text.txt',
    mimeType: 'text/plain',
    metadata: {
      pageCount: numPages,
      extractedText: hasText ? undefined : 'No text content found',
    },
  };
}
