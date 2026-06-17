import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../config/types';

// PDF processors — existing tools
import mergePdf from './pdf/mergePdf';
import splitPdf from './pdf/splitPdf';
import removePages from './pdf/removePages';
import protectPdf from './pdf/protectPdf';
import unlockPdf from './pdf/unlockPdf';
import jpgToPdf from './pdf/jpgToPdf';
import pdfToJpg from './pdf/pdfToJpg';

// Image processors — existing tools
import compressImage from './image/compressImage';
import resizeImage from './image/resizeImage';
import convertImage from './image/convertImage';
import cropImage from './image/cropImage';
import grayscaleImage from './image/grayscaleImage';
import flipImage from './image/flipImage';
import rotateImage from './image/rotateImage';

// PDF processors — new tools (placeholders until tasks 5.2-5.17)
import rotatePdf from './pdf/rotatePdf';
import compressPdf from './pdf/compressPdf';
import watermarkPdf from './pdf/watermarkPdf';
import organizePdf from './pdf/organizePdf';
import pdfToText from './pdf/pdfToText';
import htmlToPdf from './pdf/htmlToPdf';
import pageNumbers from './pdf/pageNumbers';
import signPdf from './pdf/signPdf';
import pdfReader from './pdf/pdfReader';
import pngToPdf from './pdf/pngToPdf';
import pdfToPng from './pdf/pdfToPng';

// Office-to-PDF processors (ConvertAPI)
import wordToPdf from './pdf/wordToPdf';
import excelToPdf from './pdf/excelToPdf';
import pptToPdf from './pdf/pptToPdf';

/**
 * A processor function that transforms files according to tool-specific logic.
 */
export type ProcessorFn = (
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
) => Promise<ProcessingResult>;

/**
 * Registry mapping tool IDs to their processor functions.
 */
export const processors: Record<string, ProcessorFn> = {
  // Existing tools
  'merge-pdf': mergePdf,
  'split-pdf': splitPdf,
  'remove-pages': removePages,
  'protect-pdf': protectPdf,
  'unlock-pdf': unlockPdf,
  'jpg-to-pdf': jpgToPdf,
  'pdf-to-jpg': pdfToJpg,
  'compress-img': compressImage,
  'resize-img': resizeImage,
  'convert-img': convertImage,
  'crop-img': cropImage,
  'grayscale-img': grayscaleImage,
  'flip-img': flipImage,
  'rotate-img': rotateImage,

  // New tools (implemented in tasks 5.2-5.17)
  'rotate-pdf': rotatePdf,
  'compress-pdf': compressPdf,
  'watermark-pdf': watermarkPdf,
  'organize-pdf': organizePdf,
  'pdf-to-word': pdfToText,
  'html-to-pdf': htmlToPdf,
  'page-numbers': pageNumbers,
  'sign-pdf': signPdf,
  'pdf-reader': pdfReader,
  'png-to-pdf': pngToPdf,
  'pdf-to-png': pdfToPng,

  // Office-to-PDF (ConvertAPI)
  'word-to-pdf': wordToPdf,
  'excel-to-pdf': excelToPdf,
  'ppt-to-pdf': pptToPdf,
};

/**
 * Dispatches file processing to the appropriate processor based on toolId.
 *
 * @param toolId - The tool identifier (must match a key in the processors registry)
 * @param files - Array of files to process
 * @param options - Tool-specific processing options
 * @param onProgress - Callback to report progress (0-100)
 * @returns Processing result with output blob and metadata
 * @throws Error if toolId is not found in the registry
 */
export async function processFiles(
  toolId: string,
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const processor = processors[toolId];
  if (!processor) {
    throw new Error(`Unknown tool: ${toolId}`);
  }
  return processor(files, options, onProgress);
}
