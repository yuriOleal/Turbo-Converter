import type { ProcessingOptions, ProcessingResult, ProgressCallback } from '../../config/types';

export default async function rotateImage(
  files: File[],
  options: ProcessingOptions,
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const mainFile = files[0];
  onProgress(0, 'Loading image...');

  const imgBitmap = await createImageBitmap(mainFile);
  const angle = options.rotationAngle ?? 90;

  onProgress(50, 'Rotating...');

  const radians = (angle * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(imgBitmap.width * cos + imgBitmap.height * sin);
  canvas.height = Math.round(imgBitmap.width * sin + imgBitmap.height * cos);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable.');

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(imgBitmap, -imgBitmap.width / 2, -imgBitmap.height / 2);

  onProgress(80, 'Saving...');

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('Rotation failed'));
      resolve(b);
    }, 'image/png');
  });

  onProgress(100, 'Done');
  return {
    success: true,
    blob,
    fileName: `rotated_${mainFile.name.replace(/\.[^/.]+$/, '')}.png`,
    mimeType: 'image/png',
  };
}
