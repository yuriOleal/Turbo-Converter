import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function grayscaleImage(
  files: File[],
  _options: ProcessingOptions,
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

  ctx.drawImage(imgBitmap, 0, 0);

  onProgress(30, 'Applying grayscale filter...');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imageData, 0, 0);

  onProgress(80, 'Saving...');

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('Grayscale conversion failed'));
      resolve(b);
    }, 'image/png');
  });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: `grayscale_${mainFile.name.replace(/\.[^/.]+$/, '')}.png`,
    mimeType: 'image/png',
  };
}
