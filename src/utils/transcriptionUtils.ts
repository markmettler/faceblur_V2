import { extractAudioForTranscription } from './ffmpegUtils';

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export async function transcribeAudio(
  videoBlob: Blob,
  language: string = 'nl',
  onProgress?: (progress: number, message: string) => void
): Promise<TranscriptionSegment[]> {
  try {
    if (onProgress) onProgress(10, 'Audio extraheren...');

    const audioData = await extractAudioForTranscription(videoBlob, (progress) => {
      if (onProgress) onProgress(10 + progress * 0.3, 'Audio verwerken...');
    });

    if (onProgress) onProgress(50, 'Transcriptie starten...');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockSegments: TranscriptionSegment[] = [
      {
        start: 0,
        end: 5,
        text: 'Dit is een voorbeeld transcriptie.',
      },
      {
        start: 5,
        end: 10,
        text: 'In een productieversie zou hier echte spraakherkenning plaatsvinden.',
      },
      {
        start: 10,
        end: 15,
        text: 'Whisper.cpp WASM-integratie vereist een voorgetraind model en meer setup.',
      },
    ];

    if (onProgress) onProgress(100, 'Transcriptie voltooid!');

    return mockSegments;
  } catch (err) {
    console.error('Transcription error:', err);
    throw new Error('Transcriptiefout: ' + (err as Error).message);
  }
}

export function segmentsToText(segments: TranscriptionSegment[]): string {
  return segments
    .map((segment) => {
      const startTime = formatTimestamp(segment.start);
      const endTime = formatTimestamp(segment.end);
      return `[${startTime} → ${endTime}] ${segment.text}`;
    })
    .join('\n\n');
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
