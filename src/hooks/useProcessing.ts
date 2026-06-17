import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import type { ProcessingOptions, ProcessingResult, UseProcessingReturn } from '../config/types';
import { TOOLS } from '../config/tools';
import { processFiles } from '../processing/index';

type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';

export function useProcessing(): UseProcessingReturn {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultUrlRef = useRef<string | null>(null);

  const revokeResultUrl = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  }, []);

  // Revoke Object URL on unmount
  useEffect(() => {
    return () => {
      revokeResultUrl();
    };
  }, [revokeResultUrl]);

  const reset = useCallback(() => {
    revokeResultUrl();
    setStatus('idle');
    setProgress(0);
    setProgressMessage('');
    setResult(null);
    setError(null);
  }, [revokeResultUrl]);

  const process = useCallback(async (
    files: File[],
    toolId: string,
    options: ProcessingOptions
  ): Promise<void> => {
    // Revoke previous result URL before starting a new conversion
    revokeResultUrl();

    setStatus('processing');
    setProgress(0);
    setProgressMessage('');
    setResult(null);
    setError(null);

    try {
      const tool = TOOLS.find(t => t.id === toolId);
      const isBatchTool = tool?.supportsBatch ?? false;
      const needsBatch = isBatchTool && files.length > 1;

      let processingResult: ProcessingResult;

      if (needsBatch) {
        // Batch processing: iterate each file, collect blobs, ZIP them
        processingResult = await processBatch(files, toolId, options, (percent, message) => {
          setProgress(percent);
          if (message) setProgressMessage(message);
        });
      } else {
        // Single file (or single-file tool): process directly
        processingResult = await processFiles(toolId, files, options, (percent, message) => {
          setProgress(percent);
          if (message) setProgressMessage(message);
        });
      }

      // Create Object URL for the result blob
      const url = URL.createObjectURL(processingResult.blob);
      resultUrlRef.current = url;

      setResult(processingResult);
      setProgress(100);
      setStatus('done');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setStatus('error');
    }
  }, [revokeResultUrl]);

  return {
    status,
    progress,
    progressMessage,
    result,
    error,
    process,
    reset,
  };
}

/**
 * Processes multiple files individually through the processor,
 * collects the result blobs, and bundles them into a ZIP archive.
 */
async function processBatch(
  files: File[],
  toolId: string,
  options: ProcessingOptions,
  onProgress: (percent: number, message?: string) => void
): Promise<ProcessingResult> {
  const zip = new JSZip();
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    onProgress(
      Math.round((i / totalFiles) * 100),
      `Processing file ${i + 1} of ${totalFiles}: ${file.name}`
    );

    const result = await processFiles(toolId, [file], options, () => {
      // Per-file progress is not surfaced in batch mode;
      // overall progress is based on files completed.
    });

    // Use the result's fileName for the ZIP entry to preserve naming
    zip.file(result.fileName, result.blob);
  }

  onProgress(100, 'Creating ZIP archive...');

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return {
    success: true,
    blob: zipBlob,
    fileName: 'batch_result.zip',
    mimeType: 'application/zip',
  };
}
