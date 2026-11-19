export interface SubtitleCue {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

// Convert timestamp string (00:01:23.456 or 00:01:23,456) to seconds
export function parseTimestamp(timeStr: string): number {
  if (!timeStr) return 0;
  const normalized = timeStr.trim().replace(',', '.');
  const parts = normalized.split(':');
  
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
}

// Parse either SRT or WebVTT content
export function parseSubtitles(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let i = 0;
  // Skip WEBVTT header if present
  while (i < lines.length && (lines[i].trim() === 'WEBVTT' || lines[i].trim().startsWith('NOTE') || lines[i].trim() === '')) {
    i++;
  }

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    // Check if line contains timestamp separator '-->'
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->').map(s => s.trim().split(' ')[0]);
      const start = parseTimestamp(startStr);
      const end = parseTimestamp(endStr);

      i++;
      let textLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i].trim());
        i++;
      }

      const text = textLines.join('\n');
      cues.push({
        id: `cue-${cues.length + 1}`,
        start,
        end,
        text
      });
    } else {
      // Possible cue number identifier, check next line
      if (i + 1 < lines.length && lines[i + 1].includes('-->')) {
        const timeLine = lines[i + 1];
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim().split(' ')[0]);
        const start = parseTimestamp(startStr);
        const end = parseTimestamp(endStr);

        i += 2;
        let textLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
          textLines.push(lines[i].trim());
          i++;
        }

        cues.push({
          id: `cue-${cues.length + 1}`,
          start,
          end,
          text: textLines.join('\n')
        });
      } else {
        i++;
      }
    }
  }

  return cues;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
