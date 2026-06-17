import { PDFDocument } from 'pdf-lib';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function protectPdf(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading PDF...');

  const arrayBuffer = await mainFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const password = options.password || '1234';

  onProgress(30, 'Encrypting PDF...');
  pdfDoc.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false,
    },
  });

  onProgress(70, 'Saving protected PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: `protected_${mainFile.name}`,
    mimeType: 'application/pdf',
  };
}
