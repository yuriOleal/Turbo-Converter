import React, { useMemo } from 'react';
import type { ProcessingResult } from '../config/types';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

interface FilePreviewProps {
  result: ProcessingResult | null;
  onDownload: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ result, onDownload }) => {
  if (!result) return null;

  const isImage = result.mimeType.startsWith('image/');

  const previewUrl = useMemo(() => {
    if (isImage) {
      return URL.createObjectURL(result.blob);
    }
    return null;
  }, [result.blob, isImage]);

  const fileSizeDisplay = useMemo(() => {
    const size = result.metadata?.resultSize ?? result.blob.size;
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(size / 1024).toFixed(1)} KB`;
  }, [result]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-white/10">
      {/* Preview area */}
      <div className="w-full max-w-sm">
        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            alt={`Preview of ${result.fileName}`}
            className="w-full h-auto max-h-64 object-contain rounded-lg border border-slate-200 dark:border-white/10"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 bg-slate-100 dark:bg-white/5 rounded-lg">
            {result.mimeType === 'application/pdf' ? (
              <FileText className="w-12 h-12 text-red-500 mb-2" />
            ) : (
              <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
            )}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
              {result.fileName}
            </span>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[300px]">
          {result.fileName}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {fileSizeDisplay}
        </p>
      </div>

      {/* Download button */}
      <button
        onClick={onDownload}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30 dark:shadow-green-900/40"
      >
        <Download className="w-5 h-5" />
        Download
      </button>
    </div>
  );
};

export default FilePreview;
