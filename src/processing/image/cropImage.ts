import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function cropImage(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading image...');

  const imgBitmap = await createImageBitmap(mainFile);

  // Default: crop to center square if no dimensions specified
  const cropX = options.cropX ?? 0;
  const cropY = options.cropY ?? 0;
  const cropWidth = options.cropWidth ?? imgBitmap.width;
  const cropHeight = options.cropHeight ?? imgBitmap.height;

  onProgress(50, 'Cropping...');

  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable.');

  ctx.drawImage(imgBitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  onProgress(80, 'Saving...');

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('Crop failed'));
      resolve(b);
    }, 'image/png');
  });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: `cropped_${mainFile.name.replace(/\.[^/.]+$/, '')}.png`,
    mimeType: 'image/png',
  };
}
