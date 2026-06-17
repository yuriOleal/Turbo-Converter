import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function flipImage(
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

  onProgress(50, 'Flipping...');

  const direction = options.flipDirection ?? 'horizontal';

  if (direction === 'horizontal') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }

  ctx.drawImage(imgBitmap, 0, 0);

  onProgress(80, 'Saving...');

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('Flip failed'));
      resolve(b);
    }, 'image/png');
  });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: `flipped_${mainFile.name.replace(/\.[^/.]+$/, '')}.png`,
    mimeType: 'image/png',
  };
}
