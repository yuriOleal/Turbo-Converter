import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function resizeImage(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading image...');

  const imgBitmap = await createImageBitmap(mainFile);
  const canvas = document.createElement('canvas');

  const targetWidth = options.width ?? imgBitmap.width;
  const targetHeight = options.height ?? imgBitmap.height;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable.');

  onProgress(50, 'Resizing...');
  ctx.drawImage(imgBitmap, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Image resize failed.'));
      },
      'image/jpeg',
      0.9
    );
  });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: `resized_${mainFile.name.replace(/\.[^/.]+$/, '')}.jpg`,
    mimeType: 'image/jpeg',
    metadata: {
      originalSize: mainFile.size,
      resultSize: blob.size,
    },
  };
}
