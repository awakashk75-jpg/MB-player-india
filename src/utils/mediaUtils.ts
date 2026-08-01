import type { CSSProperties } from 'react';

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export interface ParsedSubtitleCue {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export function parseSRT(srtContent: string): ParsedSubtitleCue[] {
  const cues: ParsedSubtitleCue[] = [];
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split('\n\n');

  let cueId = 1;

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length >= 2) {
      let timeLineIdx = 0;
      if (/^\d+$/.test(lines[0].trim())) {
        timeLineIdx = 1;
      }
      const timeLine = lines[timeLineIdx];
      if (timeLine && timeLine.includes('-->')) {
        const [startStr, endStr] = timeLine.split('-->').map((s) => s.trim());
        const start = parseSrtTimestamp(startStr);
        const end = parseSrtTimestamp(endStr);
        const text = lines.slice(timeLineIdx + 1).join('\n');

        if (!isNaN(start) && !isNaN(end) && text) {
          cues.push({ id: cueId++, start, end, text });
        }
      }
    }
  }

  return cues;
}

function parseSrtTimestamp(timeStr: string): number {
  if (!timeStr) return 0;
  // Format 00:01:20,000 or 00:01:20.000
  const clean = timeStr.replace(',', '.');
  const parts = clean.split(':');
  if (parts.length < 3) return 0;
  const hrs = parseFloat(parts[0]);
  const mins = parseFloat(parts[1]);
  const secs = parseFloat(parts[2]);
  return hrs * 3600 + mins * 60 + secs;
}

export function captureVideoFrame(videoElement: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 1280;
    canvas.height = videoElement.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.9);
    }
  } catch (e) {
    console.error('Failed to capture video frame:', e);
  }
  return null;
}

export function getAspectRatioStyle(aspectRatio: string): CSSProperties {
  switch (aspectRatio) {
    case '16:9':
      return { objectFit: 'contain', aspectRatio: '16/9' };
    case '4:3':
      return { objectFit: 'contain', aspectRatio: '4/3' };
    case 'fill':
      return { objectFit: 'fill' };
    case 'stretch':
      return { objectFit: 'cover' };
    case 'crop':
      return { objectFit: 'none', objectPosition: 'center' };
    case 'fit':
    default:
      return { objectFit: 'contain' };
  }
}
