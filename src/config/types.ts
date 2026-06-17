import type React from 'react';

export enum ToolCategory {
  POPULAR = 'Popular',
  PDF_OPTIMIZE = 'Optimize PDF',
  PDF_CONVERT_TO = 'Convert to PDF',
  PDF_CONVERT_FROM = 'Convert from PDF',
  PDF_SECURITY = 'PDF Security',
  IMAGE = 'Image Tools',
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  acceptedFormats: string;
  allowMultiple: boolean;
  supportsBatch: boolean;
}

export interface ProcessingOptions {
  pages?: string;
  password?: string;
  width?: number;
  height?: number;
  targetFormat?: string;
  quality?: number;
  rotationAngle?: 90 | 180 | 270;
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkFontSize?: number;
  pageOrder?: string;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  signatureImage?: Blob;
  signatureX?: number;
  signatureY?: number;
  signaturePage?: number;
  flipDirection?: 'horizontal' | 'vertical';
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
}

export interface ProcessingResult {
  success: boolean;
  blob: Blob;
  fileName: string;
  mimeType: string;
  metadata?: {
    originalSize?: number;
    resultSize?: number;
    pageCount?: number;
    extractedText?: string;
    renderedPages?: string[];
  };
}

export type ProgressCallback = (percent: number, message?: string) => void;

export interface HistoryEntry {
  id: string;
  toolId: string;
  toolName: string;
  fileName: string;
  timestamp: number;
  resultBlobUrl?: string;
}

export interface UseFileUploadReturn {
  files: File[];
  addFiles: (files: FileList | File[]) => void;
  removeFile: (index: number) => void;
  moveFile: (index: number, direction: 'up' | 'down') => void;
  clearFiles: () => void;
  isDragging: boolean;
  dragHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  validationError: string | null;
  fileSizes: string[];
}

export interface UseProcessingReturn {
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;
  progressMessage: string;
  result: ProcessingResult | null;
  error: string | null;
  process: (files: File[], toolId: string, options: ProcessingOptions) => Promise<void>;
  reset: () => void;
}
