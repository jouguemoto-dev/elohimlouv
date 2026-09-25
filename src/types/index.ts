export type UserRole = 'admin' | 'member';

export type VocalRange = 
  | 'Líder de Louvor'
  | 'Soprano'
  | 'Contralto'
  | 'Tenor'
  | 'Barítono'
  | 'Baixo'
  | 'Instrumentista';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  initials: string;
  primaryInstrument: string;
  secondaryInstruments: string[];
  vocalRange: VocalRange;
  status: 'active' | 'in_vacation' | 'inactive';
  joinedYear: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  churchKey: string; // Tom padrão usado na Elohim
  tempoBpm: number;
  timeSignature: string; // '4/4', '6/8', '3/4'
  tags: string[]; // 'Adoração', 'Celebração', 'Ceia', 'Abertura', 'Gratidão', 'Apelo'
  cifraUrl?: string;
  mediaUrl?: string;
  spotifyUrl?: string;
  chords: string; // Letra com cifras
  notes?: string;
  lastPlayed?: string; // Data ISO
}

export type ConfirmationStatus = 'confirmed' | 'pending' | 'declined';

export interface TeamAssignment {
  memberId: string;
  roleName: string; // Ex: 'Voz Principal', 'Backing Vocal', 'Violão', 'Guitarra', 'Teclado', 'Baixo', 'Bateria', 'Mesa de Som'
  status: ConfirmationStatus;
  confirmedAt?: string;
  declineReason?: string;
}

export interface SetlistItem {
  songId: string;
  key: string; // Tom selecionado para esta celebração
  order: number;
  leadSingerId?: string;
  notes?: string;
}

export interface WorshipEvent {
  id: string;
  title: string; // Ex: 'Culto de Domingo - Manhã', 'Culto de Jovens'
  type: 'culto_domingo' | 'culto_jovens' | 'ensaio' | 'conferencia' | 'vigilia';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  theme?: string;
  pastorOrSpeaker?: string;
  notes?: string;
  team: TeamAssignment[];
  setlist: SetlistItem[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'normal' | 'high';
}
