import { jsPDF } from 'jspdf';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function pngToPdf(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  if (!files.length) throw new Error('At least one PNG file is required.');

  onProgress(0, 'Creating PDF...');
  const doc = new jsPDF();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (i > 0) doc.addPage();

    const imgData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    onProgress(Math.round(((i + 1) / files.length) * 90), `Added image ${i + 1} of ${files.length}`);
  }

  onProgress(95, 'Saving PDF...');
  const pdfBlob = doc.output('blob');

  onProgress(100, 'Done');
  return {
    success: true,
    blob: pdfBlob,
    fileName: 'images_converted.pdf',
    mimeType: 'application/pdf',
    metadata: { pageCount: files.length },
  };
}
