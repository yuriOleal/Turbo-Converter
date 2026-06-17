import { PDFDocument } from 'pdf-lib';
import { describe, it, expect, vi } from 'vitest';
import organizePdf from './organizePdf';
import type { ProcessingOptions, ProgressCallback } from '../../config/types';

async function createTestPdf(pageCount: number): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    pdfDoc.addPage([100, 100]);
  }
  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes], 'test.pdf', { type: 'application/pdf' });
}

describe('organizePdf', () => {
  const onProgress: ProgressCallback = vi.fn();

  it('reorders pages according to pageOrder', async () => {
    const file = await createTestPdf(3);
    const options: ProcessingOptions = { pageOrder: '3,1,2' };

    const result = await organizePdf([file], options, onProgress);

    expect(result.success).toBe(true);
    expect(result.fileName).toBe('reordered_document.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.metadata?.pageCount).toBe(3);

    // Verify the resulting PDF has the correct page count
    const resultBuffer = await result.blob.arrayBuffer();
    const resultPdf = await PDFDocument.load(resultBuffer);
    expect(resultPdf.getPageCount()).toBe(3);
  });

  it('allows duplicating pages in the order', async () => {
    const file = await createTestPdf(3);
    const options: ProcessingOptions = { pageOrder: '1,1,2,3,3' };

    const result = await organizePdf([file], options, onProgress);

    expect(result.success).toBe(true);
    expect(result.metadata?.pageCount).toBe(5);

    const resultBuffer = await result.blob.arrayBuffer();
    const resultPdf = await PDFDocument.load(resultBuffer);
    expect(resultPdf.getPageCount()).toBe(5);
  });

  it('allows a subset of pages', async () => {
    const file = await createTestPdf(5);
    const options: ProcessingOptions = { pageOrder: '2,4' };

    const result = await organizePdf([file], options, onProgress);

    expect(result.success).toBe(true);
    expect(result.metadata?.pageCount).toBe(2);

    const resultBuffer = await result.blob.arrayBuffer();
    const resultPdf = await PDFDocument.load(resultBuffer);
    expect(resultPdf.getPageCount()).toBe(2);
  });

  it('throws error when pageOrder is not provided', async () => {
    const file = await createTestPdf(3);
    const options: ProcessingOptions = {};

    await expect(organizePdf([file], options, onProgress)).rejects.toThrow(
      'Page order is required'
    );
  });

  it('throws error for page number less than 1', async () => {
    const file = await createTestPdf(3);
    const options: ProcessingOptions = { pageOrder: '0,1,2' };

    await expect(organizePdf([file], options, onProgress)).rejects.toThrow(
      'Page 0 does not exist. This PDF has 3 pages.'
    );
  });

  it('throws error for page number greater than total pages', async () => {
    const file = await createTestPdf(3);
    const options: ProcessingOptions = { pageOrder: '1,2,4' };

    await expect(organizePdf([file], options, onProgress)).rejects.toThrow(
      'Page 4 does not exist. This PDF has 3 pages.'
    );
  });

  it('throws error for non-integer page numbers', async () => {
    const file = await createTestPdf(3);
    const options: ProcessingOptions = { pageOrder: '1,abc,3' };

    await expect(organizePdf([file], options, onProgress)).rejects.toThrow(
      'Invalid page number "abc"'
    );
  });

  it('throws error for empty page order string', async () => {
    const file = await createTestPdf(3);
    const options: ProcessingOptions = { pageOrder: '  ' };

    await expect(organizePdf([file], options, onProgress)).rejects.toThrow(
      'Page order cannot be empty'
    );
  });

  it('handles single page PDF', async () => {
    const file = await createTestPdf(1);
    const options: ProcessingOptions = { pageOrder: '1' };

    const result = await organizePdf([file], options, onProgress);

    expect(result.success).toBe(true);
    expect(result.metadata?.pageCount).toBe(1);
  });

  it('reports progress during processing', async () => {
    const progressFn = vi.fn();
    const file = await createTestPdf(3);
    const options: ProcessingOptions = { pageOrder: '3,2,1' };

    await organizePdf([file], options, progressFn);

    expect(progressFn).toHaveBeenCalledWith(0, 'Loading PDF...');
    expect(progressFn).toHaveBeenCalledWith(100, 'Done');
  });
});
