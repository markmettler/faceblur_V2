export async function downloadBlob(blob: Blob, filename: string) {
  if ('showSaveFilePicker' in window) {
    try {
      const extension = filename.split('.').pop() || '';
      const types: Record<string, any> = {
        mp4: { 'video/mp4': ['.mp4'] },
        webm: { 'video/webm': ['.webm'] },
        mp3: { 'audio/mp3': ['.mp3'] },
        wav: { 'audio/wav': ['.wav'] },
        docx: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
        txt: { 'text/plain': ['.txt'] },
      };

      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: types[extension] ? [{ description: `${extension.toUpperCase()} bestand`, accept: types[extension] }] : undefined,
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('File System Access API failed, falling back to download:', err);
        fallbackDownload(blob, filename);
      }
    }
  } else {
    fallbackDownload(blob, filename);
  }
}

function fallbackDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function generateFilename(prefix: string, extension: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}.${extension}`;
}
