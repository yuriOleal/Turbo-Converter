const CONVERT_API_SECRET = import.meta.env.VITE_CONVERT_API_SECRET || '';

export async function convertWithApi(file: File, fromFormat: string, toFormat: string): Promise<Blob> {
  if (!CONVERT_API_SECRET) {
    throw new Error('ConvertAPI key not configured. Please set VITE_CONVERT_API_SECRET in your environment.');
  }

  const formData = new FormData();
  formData.append('File', file);
  formData.append('StoreFile', 'true');

  const response = await fetch(
    `https://v2.convertapi.com/convert/${fromFormat}/to/${toFormat}?Secret=${CONVERT_API_SECRET}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Conversion failed: ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.Files || result.Files.length === 0) {
    throw new Error('No output file received from conversion service.');
  }

  // Download the converted file
  const fileUrl = result.Files[0].Url;
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error('Failed to download converted file.');
  }

  return await fileResponse.blob();
}
