import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function convertImage(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading image...');

  const imgBitmap = await createImageBitmap(mainFile);
  const canvas = document.createElement('canvas');
  canvas.width = imgBitmap.width;
  canvas.height = imgBitmap.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable.');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgBitmap, 0, 0);

  onProgress(50, 'Converting...');

  let mimeType = 'image/jpeg';
  let extension = 'jpg';

  if (options.targetFormat) {
    mimeType = options.targetFormat;
    if (mimeType === 'image/png') extension = 'png';
    else if (mimeType === 'image/webp') extension = 'webp';
    else extension = 'jpg';
  }

  const quality = options.quality ?? 0.9;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Image conversion failed.'));
      },
      mimeType,
      quality
    );
  });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: `converted_${mainFile.name.replace(/\.[^/.]+$/, '')}.${extension}`,
    mimeType,
    metadata: {
      originalSize: mainFile.size,
      resultSize: blob.size,
    },
  };
}
