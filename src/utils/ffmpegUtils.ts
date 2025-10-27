import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;

export async function loadFFmpeg(onProgress?: (progress: number) => void): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('FFmpeg:', message);
  });

  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export async function convertToMP4(
  inputBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg(onProgress);

  const inputName = 'input.webm';
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(inputBlob));

  await ffmpeg.exec([
    '-i', inputName,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: 'video/mp4' });

  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return blob;
}

export async function extractAudio(
  inputBlob: Blob,
  format: 'mp3' | 'wav' = 'mp3',
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg(onProgress);

  const inputName = 'input.webm';
  const outputName = `output.${format}`;

  await ffmpeg.writeFile(inputName, await fetchFile(inputBlob));

  if (format === 'mp3') {
    await ffmpeg.exec([
      '-i', inputName,
      '-vn',
      '-acodec', 'libmp3lame',
      '-b:a', '128k',
      outputName
    ]);
  } else {
    await ffmpeg.exec([
      '-i', inputName,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      outputName
    ]);
  }

  const data = await ffmpeg.readFile(outputName);
  const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
  const blob = new Blob([data], { type: mimeType });

  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return blob;
}

export async function extractAudioForTranscription(
  inputBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Float32Array> {
  const ffmpeg = await loadFFmpeg(onProgress);

  const inputName = 'input.webm';
  const outputName = 'output.wav';

  await ffmpeg.writeFile(inputName, await fetchFile(inputBlob));

  await ffmpeg.exec([
    '-i', inputName,
    '-vn',
    '-acodec', 'pcm_s16le',
    '-ar', '16000',
    '-ac', '1',
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);

  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  const audioBuffer = new Int16Array(data.buffer);
  const float32Array = new Float32Array(audioBuffer.length);

  for (let i = 0; i < audioBuffer.length; i++) {
    float32Array[i] = audioBuffer[i] / 32768.0;
  }

  return float32Array;
}

export async function mergeVideoWithAudio(
  videoBlob: Blob,
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg(onProgress);

  const videoName = 'video.webm';
  const audioName = 'audio.webm';
  const outputName = 'output.webm';

  await ffmpeg.writeFile(videoName, await fetchFile(videoBlob));
  await ffmpeg.writeFile(audioName, await fetchFile(audioBlob));

  await ffmpeg.exec([
    '-i', videoName,
    '-i', audioName,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: 'video/webm' });

  await ffmpeg.deleteFile(videoName);
  await ffmpeg.deleteFile(audioName);
  await ffmpeg.deleteFile(outputName);

  return blob;
}
