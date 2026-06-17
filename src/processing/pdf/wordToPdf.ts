import { convertWithApi } from '../../services/convertApi';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function wordToPdf(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const file = files[0];
  onProgress(0, 'Uploading document...');
  
  onProgress(30, 'Converting Word to PDF...');
  const blob = await convertWithApi(file, 'docx', 'pdf');
  
  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: file.name.replace(/\.(docx?|doc)$/i, '') + '.pdf',
    mimeType: 'application/pdf',
  };
}
