import { convertWithApi } from '../../services/convertApi';
import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function excelToPdf(
  files: File[],
  _options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const file = files[0];
  onProgress(0, 'Uploading spreadsheet...');
  
  onProgress(30, 'Converting Excel to PDF...');
  const blob = await convertWithApi(file, 'xlsx', 'pdf');
  
  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: file.name.replace(/\.(xlsx?|xls)$/i, '') + '.pdf',
    mimeType: 'application/pdf',
  };
}
