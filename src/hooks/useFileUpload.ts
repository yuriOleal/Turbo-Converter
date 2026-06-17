import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { UseFileUploadReturn } from '@/config/types';

const MAX_SINGLE_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_BATCH_SIZE = 200 * 1024 * 1024; // 200MB

export interface UseFileUploadConfig {
  allowMultiple?: boolean;
}

/**
 * Formats a byte count into a human-readable string (e.g., "2.4 MB", "156 KB").
 * Uses "MB" when value >= 1MB, "KB" otherwise.
 */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

/**
 * Custom hook encapsulating file selection, drag-and-drop handling,
 * validation (100MB single / 200MB batch), Object URL lifecycle management,
 * and human-readable file size formatting.
 */
export function useFileUpload(config: UseFileUploadConfig = {}): UseFileUploadReturn {
  const { allowMultiple = true } = config;

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track Object URLs created for image previews so we can revoke them
  const objectUrlsRef = useRef<string[]>([]);

  /**
   * Creates an Object URL and tracks it for cleanup.
   */
  const createTrackedObjectUrl = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  }, []);

  /**
   * Revokes all tracked Object URLs and clears the tracking array.
   */
  const revokeAllObjectUrls = useCallback(() => {
    for (const url of objectUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    objectUrlsRef.current = [];
  }, []);

  /**
   * Revokes a specific Object URL by index.
   */
  const revokeObjectUrlAtIndex = useCallback((index: number) => {
    if (index >= 0 && index < objectUrlsRef.current.length) {
      URL.revokeObjectURL(objectUrlsRef.current[index]);
      objectUrlsRef.current.splice(index, 1);
    }
  }, []);

  // Cleanup all Object URLs on unmount
  useEffect(() => {
    return () => {
      revokeAllObjectUrls();
    };
  }, [revokeAllObjectUrls]);

  /**
   * Validates files against size limits.
   * Returns an error message if validation fails, null if valid.
   */
  const validateFiles = useCallback((newFiles: File[], existingFiles: File[]): string | null => {
    // Check individual file sizes
    for (const file of newFiles) {
      if (file.size > MAX_SINGLE_FILE_SIZE) {
        return `File "${file.name}" exceeds maximum size of 100MB (${formatFileSize(file.size)})`;
      }
    }

    // Check combined batch size
    const allFiles = [...existingFiles, ...newFiles];
    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_BATCH_SIZE) {
      return `Combined file size (${formatFileSize(totalSize)}) exceeds 200MB limit`;
    }

    return null;
  }, []);

  /**
   * Adds files after validation. Rejects if any file exceeds 100MB
   * or combined batch exceeds 200MB.
   */
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    if (fileArray.length === 0) return;

    // If not allowing multiple, only take the first file
    const filesToAdd = allowMultiple ? fileArray : [fileArray[0]];

    // Clear previous error
    setValidationError(null);

    // When single mode, replace existing files
    const existingFiles = allowMultiple ? files : [];

    const error = validateFiles(filesToAdd, existingFiles);
    if (error) {
      setValidationError(error);
      return;
    }

    if (!allowMultiple) {
      // Revoke old URLs and replace
      revokeAllObjectUrls();
      // Create tracked URLs for new files (for image preview support)
      for (const file of filesToAdd) {
        createTrackedObjectUrl(file);
      }
      setFiles(filesToAdd);
    } else {
      // Create tracked URLs for new files
      for (const file of filesToAdd) {
        createTrackedObjectUrl(file);
      }
      setFiles(prev => [...prev, ...filesToAdd]);
    }
  }, [allowMultiple, files, validateFiles, revokeAllObjectUrls, createTrackedObjectUrl]);

  /**
   * Removes a file at the given index. Revokes its Object URL.
   */
  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      if (index < 0 || index >= prev.length) return prev;
      revokeObjectUrlAtIndex(index);
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
    setValidationError(null);
  }, [revokeObjectUrlAtIndex]);

  /**
   * Moves a file up or down in the list (for tools where order matters).
   */
  const moveFile = useCallback((index: number, direction: 'up' | 'down') => {
    setFiles(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      if (index < 0 || index >= prev.length) return prev;

      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      // Also swap the tracked Object URLs to keep them in sync
      const urls = objectUrlsRef.current;
      if (index < urls.length && targetIndex < urls.length) {
        [urls[index], urls[targetIndex]] = [urls[targetIndex], urls[index]];
      }

      return next;
    });
  }, []);

  /**
   * Clears all files and revokes all Object URLs.
   */
  const clearFiles = useCallback(() => {
    revokeAllObjectUrls();
    setFiles([]);
    setValidationError(null);
  }, [revokeAllObjectUrls]);

  // Drag-and-drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  // Compute human-readable sizes for each file
  const fileSizes = files.map(file => formatFileSize(file.size));

  return {
    files,
    addFiles,
    removeFile,
    moveFile,
    clearFiles,
    isDragging,
    dragHandlers: {
      onDragOver,
      onDragLeave,
      onDrop,
    },
    validationError,
    fileSizes,
  };
}
