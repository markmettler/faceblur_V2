import { Document, Packer, Paragraph, TextRun } from 'docx';
import { TranscriptionSegment } from './transcriptionUtils';

export async function createDocxFromTranscription(
  segments: TranscriptionSegment[],
  title: string = 'Transcriptie'
): Promise<Blob> {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 32,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Gegenereerd op: ${new Date().toLocaleString('nl-NL')}`,
          italics: true,
          size: 20,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  segments.forEach((segment) => {
    const startTime = formatTimestamp(segment.start);
    const endTime = formatTimestamp(segment.end);

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `[${startTime} → ${endTime}]`,
            bold: true,
            color: '666666',
          }),
          new TextRun({
            text: ' ',
          }),
          new TextRun({
            text: segment.text,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

export function createTextFromTranscription(
  segments: TranscriptionSegment[],
  title: string = 'Transcriptie'
): string {
  let text = `${title}\n`;
  text += `Gegenereerd op: ${new Date().toLocaleString('nl-NL')}\n`;
  text += `${'='.repeat(60)}\n\n`;

  segments.forEach((segment) => {
    const startTime = formatTimestamp(segment.start);
    const endTime = formatTimestamp(segment.end);
    text += `[${startTime} → ${endTime}] ${segment.text}\n\n`;
  });

  return text;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
