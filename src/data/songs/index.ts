import { Song } from '../../types';
import { SONGS_PART_1 } from './songsPart1';
import { SONGS_PART_2 } from './songsPart2';
import { SONGS_PART_3 } from './songsPart3';
import { SONGS_PART_4 } from './songsPart4';
import { SONGS_PART_5 } from './songsPart5';
import { SONGS_PART_6 } from './songsPart6';
import { SONGS_PART_7 } from './songsPart7';

// Combine all songs and deduplicate by ID if needed
const combinedList: Song[] = [
  ...SONGS_PART_1,
  ...SONGS_PART_2,
  ...SONGS_PART_3,
  ...SONGS_PART_4,
  ...SONGS_PART_5,
  ...SONGS_PART_6,
  ...SONGS_PART_7,
];

// Deduplicate by ID
const seenIds = new Set<string>();
export const ALL_PRAISE_SONGS: Song[] = combinedList.filter((song) => {
  if (seenIds.has(song.id)) {
    return false;
  }
  seenIds.add(song.id);
  return true;
}).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
