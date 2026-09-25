// Chord Transposition Engine for Igreja Batista Elohim Worship Ministry

const SCALE_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

// Regex matching single chord like "G", "C#m7", "F#m7(b5)", "Bbmaj7", "D/F#", "A/C#"
const CHORD_REGEX = /\b([A-G][b#]?)(m|min|maj|dim|aug|sus[24]?|add\d|\d+)*(?:\/([A-G][b#]?))?\b/g;

export function transposeSingleNote(note: string, semitones: number, preferFlats = false): string {
  const normalized = note.toUpperCase();
  if (NOTE_TO_SEMITONE[normalized] === undefined) return note;

  const currentSemitone = NOTE_TO_SEMITONE[normalized];
  let targetSemitone = (currentSemitone + semitones) % 12;
  if (targetSemitone < 0) targetSemitone += 12;

  const scale = preferFlats ? SCALE_FLATS : SCALE_SHARPS;
  return scale[targetSemitone];
}

export function transposeChord(chordStr: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return chordStr;

  return chordStr.replace(
    /\b([A-G][b#]?)(m|min|maj|dim|aug|sus[24]?|add\d|\d+)*(?:\/([A-G][b#]?))?\b/g,
    (match, root, quality, bass) => {
      const newRoot = transposeSingleNote(root, semitones, preferFlats);
      const qual = quality || '';
      if (bass) {
        const newBass = transposeSingleNote(bass, semitones, preferFlats);
        return `${newRoot}${qual}/${newBass}`;
      }
      return `${newRoot}${qual}`;
    }
  );
}

// Determines if a text line is predominantly a chord line
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return false; // section header e.g. [Intro]

  // Count tokens and matches
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) return false;

  let chordTokenCount = 0;
  for (const token of tokens) {
    // If token matches chord pattern
    const isSingleChord = /^[A-G][b#]?(m|min|maj|dim|aug|sus[24]?|add\d|\d+)*(?:\/[A-G][b#]?)?$/.test(token);
    if (isSingleChord) {
      chordTokenCount++;
    }
  }

  return (chordTokenCount / tokens.length) >= 0.5;
}

// Transpose entire chord sheet text
export function transposeChordSheet(text: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return text;

  const lines = text.split('\n');
  const transposedLines = lines.map((line) => {
    // If it's a section tag like [Intro: G  D/F#  Em7  C]
    if (line.includes('[') && line.includes(']')) {
      return line.replace(/\[(.*?)\]/g, (match, content) => {
        return `[${transposeChord(content, semitones, preferFlats)}]`;
      });
    }

    if (isChordLine(line)) {
      return transposeChord(line, semitones, preferFlats);
    }
    return line;
  });

  return transposedLines.join('\n');
}

export interface FormattedLine {
  type: 'section' | 'chord' | 'lyric' | 'empty';
  text: string;
}

export function parseChordSheetLines(sheetText: string): FormattedLine[] {
  const lines = sheetText.split('\n');
  return lines.map(rawLine => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      return { type: 'empty', text: '' };
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return { type: 'section', text: trimmed };
    }
    if (isChordLine(rawLine)) {
      return { type: 'chord', text: rawLine };
    }
    return { type: 'lyric', text: rawLine };
  });
}

export const KEYS_LIST = [
  'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'
];
