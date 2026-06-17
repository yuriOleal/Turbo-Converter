import { convertWithApi } from '../../services/convertApi';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function pptToPdf(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const file = files[0];
  onProgress(0, 'Uploading presentation...');
  
  onProgress(30, 'Converting PowerPoint to PDF...');
  const blob = await convertWithApi(file, 'pptx', 'pdf');
  
  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: file.name.replace(/\.(pptx?|ppt)$/i, '') + '.pdf',
    mimeType: 'application/pdf',
  };
}
