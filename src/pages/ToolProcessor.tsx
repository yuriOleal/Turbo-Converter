import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { TOOLS } from '../config/tools';
import type { ProcessingOptions } from '../config/types';
import { useFileUpload } from '../hooks/useFileUpload';
import { useProcessing } from '../hooks/useProcessing';
import { useHistory } from '../hooks/useHistory';
import { useSEO } from '../hooks/useSEO';
import ProgressBar from '../components/ProgressBar';
import FilePreview from '../components/FilePreview';
import PdfViewer from '../components/PdfViewer';
import {
  Upload,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  File as FileIcon,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const ToolProcessor: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();

  const tool = useMemo(() => TOOLS.find((t) => t.id === toolId), [toolId]);

  // SEO
  useSEO({
    title: tool ? `${tool.name} - Free Online Tool | TurboConverter` : 'TurboConverter',
    description: tool?.description ?? 'Free online file conversion tools',
  });

  // File upload hook
  const {
    files,
    addFiles,
    removeFile,
    moveFile,
    clearFiles,
    isDragging,
    dragHandlers,
    validationError,
    fileSizes,
  } = useFileUpload({ allowMultiple: tool?.allowMultiple ?? false });

  // Processing hook
  const { status, progress, progressMessage, result, error, process, reset } = useProcessing();

  // History hook
  const { addEntry } = useHistory();

  // Tool-specific options
  const [options, setOptions] = useState<ProcessingOptions>({});

  // Reset state when tool changes
  useEffect(() => {
    clearFiles();
    reset();
    setOptions({});
  }, [toolId, clearFiles, reset]);

  // Add to history on successful processing
  useEffect(() => {
    if (status === 'done' && result && tool) {
      const blobUrl = URL.createObjectURL(result.blob);
      addEntry(
        {
          id: crypto.randomUUID(),
          toolId: tool.id,
          toolName: tool.name,
          fileName: result.fileName,
          timestamp: Date.now(),
        },
        blobUrl
      );
    }
  }, [status, result, tool, addEntry]);

  const handleProcess = useCallback(async () => {
    if (!tool || files.length === 0) return;
    await process(files, tool.id, options);
  }, [tool, files, options, process]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  const handleStartAnother = useCallback(() => {
    clearFiles();
    reset();
    setOptions({});
  }, [clearFiles, reset]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
    },
    [addFiles]
  );

  if (!tool) {
    return (
      <div className="p-20 text-center text-slate-900 dark:text-white">
        Tool not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {tool.name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>

      {/* Status announcements for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {status === 'processing' && `Processing: ${progress}% complete. ${progressMessage}`}
        {status === 'done' && 'Processing complete. Your file is ready for download.'}
        {status === 'error' && `Error: ${error}`}
      </div>

      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden relative">
        <div className="p-8 md:p-12">
          {status !== 'done' && (
            <div className="space-y-6">
              {/* File Upload Area */}
              {files.length === 0 ? (
                <div
                  {...dragHandlers}
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                    isDragging
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 scale-[1.02]'
                      : 'border-slate-300 dark:border-white/20 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/5'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept={tool.acceptedFormats}
                    multiple={tool.allowMultiple}
                    tabIndex={-1}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center w-full h-full"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('file-upload')?.click();
                      }
                    }}
                  >
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${
                        isDragging
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 dark:bg-dark-800 text-blue-500 dark:text-blue-400'
                      }`}
                    >
                      <Upload className="w-8 h-8" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Click or drag files here
                    </span>
                    <span className="text-sm text-slate-500">
                      {tool.allowMultiple
                        ? 'Select one or more files'
                        : 'Select a file to get started'}
                    </span>
                  </label>
                </div>
              ) : (
                /* File List */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {files.length} file{files.length > 1 ? 's' : ''} selected
                    </h3>
                    <button
                      onClick={clearFiles}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove All
                    </button>
                  </div>
                  <FileList
                    files={files}
                    fileSizes={fileSizes}
                    allowMultiple={tool.allowMultiple}
                    removeFile={removeFile}
                    moveFile={moveFile}
                    acceptedFormats={tool.acceptedFormats}
                    onAddMore={addFiles}
                  />
                </div>
              )}

              {/* Validation error */}
              {validationError && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-600 dark:text-red-300">
                    {validationError}
                  </div>
                </div>
              )}

              {/* Tool Settings */}
              {files.length > 0 && (
                <ToolSettings toolId={tool.id} options={options} setOptions={setOptions} />
              )}

              {/* Progress Bar */}
              {status === 'processing' && (
                <ProgressBar percent={progress} message={progressMessage} />
              )}

              {/* Process Button */}
              <button
                onClick={handleProcess}
                disabled={status === 'processing' || files.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  status === 'processing'
                    ? 'bg-slate-100 dark:bg-dark-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 hover:scale-[1.02]'
                }`}
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Process <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Error Display */}
              {status === 'error' && error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
                </div>
              )}
            </div>
          )}

          {/* Success State */}
          {status === 'done' && result && (
            <div className="animate-fade-in-up">
              <div className="flex flex-col items-center justify-center text-center mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Done!
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {toolId === 'pdf-reader' && result.metadata?.renderedPages
                    ? 'Your PDF is ready to view.'
                    : 'Your file has been processed successfully.'}
                </p>
              </div>

              {toolId === 'pdf-reader' && result.metadata?.renderedPages ? (
                <PdfViewer
                  renderedPages={result.metadata.renderedPages}
                  pageCount={result.metadata.pageCount ?? result.metadata.renderedPages.length}
                />
              ) : (
                <FilePreview result={result} onDownload={handleDownload} />
              )}

              <div className="text-center mt-8">
                <button
                  onClick={handleStartAnother}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm underline"
                >
                  {toolId === 'pdf-reader' ? 'View another PDF' : 'Process another file'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 text-slate-500 dark:text-slate-400 prose dark:prose-invert max-w-none">
        <h3>About this tool</h3>
        <p>
          TurboConverter's {tool.name} is designed for speed and privacy. We ensure your
          data is processed securely and deleted automatically after 2 hours. This service
          is 100% free for everyone.
        </p>
      </div>
    </div>
  );
};

export default ToolProcessor;

/* ─── Sub-components ─────────────────────────────────────────── */

interface FileListProps {
  files: File[];
  fileSizes: string[];
  allowMultiple: boolean;
  removeFile: (index: number) => void;
  moveFile: (index: number, direction: 'up' | 'down') => void;
  acceptedFormats: string;
  onAddMore: (files: FileList | File[]) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  fileSizes,
  allowMultiple,
  removeFile,
  moveFile,
  acceptedFormats,
  onAddMore,
}) => {
  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddMore(e.target.files);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      {files.map((file, idx) => (
        <div
          key={`${file.name}-${idx}`}
          className="relative group bg-slate-50 dark:bg-dark-800 rounded-lg p-3 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center overflow-hidden hover:shadow-md transition-shadow"
        >
          {file.type.startsWith('image/') ? (
            <div className="w-full h-24 mb-2 bg-slate-200 dark:bg-white/5 rounded-md overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview of ${file.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-24 mb-2 bg-slate-100 dark:bg-white/5 rounded-md flex items-center justify-center text-slate-400">
              <FileIcon className="w-10 h-10" />
            </div>
          )}

          <span className="text-xs text-slate-600 dark:text-slate-300 truncate w-full px-1 mb-1 font-medium">
            {file.name}
          </span>
          <span className="text-[10px] text-slate-400">{fileSizes[idx]}</span>

          {/* Delete button */}
          <button
            onClick={() => removeFile(idx)}
            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            aria-label={`Remove ${file.name}`}
          >
            <X className="w-3 h-3" />
          </button>

          {/* Order controls */}
          {allowMultiple && files.length > 1 && (
            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => moveFile(idx, 'up')}
                disabled={idx === 0}
                className="p-1 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp className="w-3 h-3 text-slate-600 dark:text-slate-300" />
              </button>
              <button
                onClick={() => moveFile(idx, 'down')}
                disabled={idx === files.length - 1}
                className="p-1 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          )}
        </div>
      ))}
      {allowMultiple && (
        <label className="cursor-pointer bg-slate-50 dark:bg-dark-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 transition-colors min-h-[140px]">
          <input
            type="file"
            className="hidden"
            onChange={handleAddMore}
            multiple
            accept={acceptedFormats}
          />
          <Plus className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-xs text-slate-500 font-medium">Add more</span>
        </label>
      )}
    </div>
  );
};

/* ─── Tool Settings ──────────────────────────────────────────── */

interface ToolSettingsProps {
  toolId: string;
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
}

const ToolSettings: React.FC<ToolSettingsProps> = ({ toolId, options, setOptions }) => {
  const settingsBoxClass =
    'bg-slate-50 dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-white/10 mb-6';
  const inputClass =
    'w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none';
  const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2';

  switch (toolId) {
    case 'split-pdf':
    case 'remove-pages':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>
            {toolId === 'split-pdf' ? 'Pages to extract' : 'Pages to remove'}
          </label>
          <input
            type="text"
            placeholder="e.g. 1,3,5-8"
            className={inputClass}
            value={options.pages ?? ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, pages: e.target.value }))}
          />
          <p className="text-xs text-slate-500 mt-2">
            {toolId === 'split-pdf'
              ? 'Leave empty to split all pages individually'
              : 'Leave empty to keep all pages'}
          </p>
        </div>
      );

    case 'protect-pdf':
    case 'unlock-pdf':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>
            {toolId === 'unlock-pdf' ? 'Current password' : 'Set password'}
          </label>
          <input
            type="password"
            placeholder={
              toolId === 'unlock-pdf' ? 'Enter PDF password' : 'Choose a password'
            }
            className={inputClass}
            value={options.password ?? ''}
            onChange={(e) => setOptions((prev) => ({ ...prev, password: e.target.value }))}
          />
        </div>
      );

    case 'resize-img':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Dimensions (px)</label>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Width"
              className={inputClass}
              value={options.width ?? ''}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  width: e.target.value ? parseInt(e.target.value, 10) : undefined,
                }))
              }
            />
            <input
              type="number"
              placeholder="Height"
              className={inputClass}
              value={options.height ?? ''}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  height: e.target.value ? parseInt(e.target.value, 10) : undefined,
                }))
              }
            />
          </div>
        </div>
      );

    case 'convert-img':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Target format</label>
          <select
            className={inputClass}
            value={options.targetFormat ?? 'image/jpeg'}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, targetFormat: e.target.value }))
            }
          >
            <option value="image/jpeg">JPG / JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </div>
      );

    case 'compress-img':
    case 'compress-pdf':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Compression quality</label>
          <select
            className={inputClass}
            value={options.quality ?? 0.6}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, quality: parseFloat(e.target.value) }))
            }
          >
            <option value={0.8}>High quality (larger file)</option>
            <option value={0.6}>Medium quality (recommended)</option>
            <option value={0.3}>Low quality (smallest file)</option>
          </select>
        </div>
      );

    case 'rotate-pdf':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Rotation angle</label>
          <select
            className={inputClass}
            value={options.rotationAngle ?? 90}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                rotationAngle: parseInt(e.target.value, 10) as 90 | 180 | 270,
              }))
            }
          >
            <option value={90}>90° clockwise</option>
            <option value={180}>180°</option>
            <option value={270}>270° clockwise (90° counter-clockwise)</option>
          </select>
        </div>
      );

    case 'watermark-pdf':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Watermark text</label>
          <input
            type="text"
            placeholder="e.g. CONFIDENTIAL"
            className={inputClass}
            value={options.watermarkText ?? ''}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, watermarkText: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Opacity (0-1)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                placeholder="0.3"
                className={inputClass}
                value={options.watermarkOpacity ?? ''}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    watermarkOpacity: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Font size</label>
              <input
                type="number"
                min="8"
                max="200"
                placeholder="48"
                className={inputClass}
                value={options.watermarkFontSize ?? ''}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    watermarkFontSize: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  }))
                }
              />
            </div>
          </div>
        </div>
      );

    case 'organize-pdf':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>New page order</label>
          <input
            type="text"
            placeholder="e.g. 3,1,2,5,4"
            className={inputClass}
            value={options.pageOrder ?? ''}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, pageOrder: e.target.value }))
            }
          />
          <p className="text-xs text-slate-500 mt-2">
            Enter page numbers in the desired order, separated by commas.
          </p>
        </div>
      );

    case 'page-numbers':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Number position</label>
          <select
            className={inputClass}
            value={options.position ?? 'bottom-center'}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                position: e.target.value as ProcessingOptions['position'],
              }))
            }
          >
            <option value="top-left">Top Left</option>
            <option value="top-center">Top Center</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-center">Bottom Center</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>
      );

    case 'sign-pdf':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Signature image</label>
          <p className="text-xs text-slate-500 mb-3">
            Upload a PNG/JPG image of your signature.
          </p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className={inputClass}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setOptions((prev) => ({ ...prev, signatureImage: file }));
              }
            }}
          />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className={labelClass}>Page #</label>
              <input
                type="number"
                min="1"
                placeholder="1"
                className={inputClass}
                value={options.signaturePage ?? ''}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    signaturePage: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>X position</label>
              <input
                type="number"
                min="0"
                placeholder="50"
                className={inputClass}
                value={options.signatureX ?? ''}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    signatureX: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Y position</label>
              <input
                type="number"
                min="0"
                placeholder="50"
                className={inputClass}
                value={options.signatureY ?? ''}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    signatureY: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  }))
                }
              />
            </div>
          </div>
        </div>
      );

    case 'flip-img':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Flip direction</label>
          <select
            className={inputClass}
            value={options.flipDirection ?? 'horizontal'}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                flipDirection: e.target.value as 'horizontal' | 'vertical',
              }))
            }
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>
      );

    case 'rotate-img':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Rotation angle</label>
          <select
            className={inputClass}
            value={options.rotationAngle ?? 90}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                rotationAngle: parseInt(e.target.value, 10) as 90 | 180 | 270,
              }))
            }
          >
            <option value={90}>90° clockwise</option>
            <option value={180}>180°</option>
            <option value={270}>270° clockwise</option>
          </select>
        </div>
      );

    case 'crop-img':
      return (
        <div className={settingsBoxClass}>
          <label className={labelClass}>Crop area (pixels)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>X offset</label>
              <input type="number" min="0" placeholder="0" className={inputClass} value={options.cropX ?? ''} onChange={(e) => setOptions((prev) => ({ ...prev, cropX: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
            </div>
            <div>
              <label className={labelClass}>Y offset</label>
              <input type="number" min="0" placeholder="0" className={inputClass} value={options.cropY ?? ''} onChange={(e) => setOptions((prev) => ({ ...prev, cropY: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
            </div>
            <div>
              <label className={labelClass}>Width</label>
              <input type="number" min="1" placeholder="Auto" className={inputClass} value={options.cropWidth ?? ''} onChange={(e) => setOptions((prev) => ({ ...prev, cropWidth: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
            </div>
            <div>
              <label className={labelClass}>Height</label>
              <input type="number" min="1" placeholder="Auto" className={inputClass} value={options.cropHeight ?? ''} onChange={(e) => setOptions((prev) => ({ ...prev, cropHeight: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Leave empty to keep the full image.</p>
        </div>
      );

    default:
      return null;
  }
};
