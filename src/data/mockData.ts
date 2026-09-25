import { Member, Song, WorshipEvent, Notice } from '../types';
import { ALL_PRAISE_SONGS } from './songs';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Pr. Roberto Mendes',
    email: 'roberto.mendes@elohimbatista.org.br',
    phone: '(11) 98765-4321',
    role: 'admin',
    initials: 'RM',
    primaryInstrument: 'Violão',
    secondaryInstruments: ['Voz', 'Guitarra'],
    vocalRange: 'Líder de Louvor',
    status: 'active',
    joinedYear: 2018,
  },
  {
    id: 'm2',
    name: 'Lucas Alcântara',
    email: 'lucas.alcantara@elohimbatista.org.br',
    phone: '(11) 97654-3210',
    role: 'admin',
    initials: 'LA',
    primaryInstrument: 'Contra-Baixo',
    secondaryInstruments: ['Violão', 'Mesa de Som'],
    vocalRange: 'Barítono',
    status: 'active',
    joinedYear: 2019,
  },
  {
    id: 'm3',
    name: 'Sarah Oliveira',
    email: 'sarah.oliveira@elohimbatista.org.br',
    phone: '(11) 96543-2109',
    role: 'member',
    initials: 'SO',
    primaryInstrument: 'Vocal',
    secondaryInstruments: ['Teclado'],
    vocalRange: 'Contralto',
    status: 'active',
    joinedYear: 2021,
  },
  {
    id: 'm4',
    name: 'Priscila Ramos',
    email: 'priscila.ramos@elohimbatista.org.br',
    phone: '(11) 95432-1098',
    role: 'member',
    initials: 'PR',
    primaryInstrument: 'Vocal',
    secondaryInstruments: ['Violão'],
    vocalRange: 'Soprano',
    status: 'active',
    joinedYear: 2022,
  },
  {
    id: 'm5',
    name: 'Mateus Carvalho',
    email: 'mateus.carvalho@elohimbatista.org.br',
    phone: '(11) 94321-0987',
    role: 'member',
    initials: 'MC',
    primaryInstrument: 'Teclado / Piano',
    secondaryInstruments: ['Sintetizador', 'Órgão'],
    vocalRange: 'Tenor',
    status: 'active',
    joinedYear: 2020,
  },
  {
    id: 'm6',
    name: 'Gabriel Santos',
    email: 'gabriel.santos@elohimbatista.org.br',
    phone: '(11) 93210-9876',
    role: 'member',
    initials: 'GS',
    primaryInstrument: 'Bateria',
    secondaryInstruments: ['Percussão'],
    vocalRange: 'Instrumentista',
    status: 'active',
    joinedYear: 2021,
  },
  {
    id: 'm7',
    name: 'Davi Nogueira',
    email: 'davi.nogueira@elohimbatista.org.br',
    phone: '(11) 92109-8765',
    role: 'member',
    initials: 'DN',
    primaryInstrument: 'Guitarra',
    secondaryInstruments: ['Violão', 'Bandolim'],
    vocalRange: 'Tenor',
    status: 'active',
    joinedYear: 2023,
  },
  {
    id: 'm8',
    name: 'Tiago Lima',
    email: 'tiago.audio@elohimbatista.org.br',
    phone: '(11) 91098-7654',
    role: 'member',
    initials: 'TL',
    primaryInstrument: 'Mesa de Som / Áudio',
    secondaryInstruments: ['Transmissão', 'Projeção'],
    vocalRange: 'Instrumentista',
    status: 'active',
    joinedYear: 2020,
  },
  {
    id: 'm9',
    name: 'Rebeca Freitas',
    email: 'rebeca.freitas@elohimbatista.org.br',
    phone: '(11) 90987-6543',
    role: 'member',
    initials: 'RF',
    primaryInstrument: 'Violoncelo',
    secondaryInstruments: ['Voz'],
    vocalRange: 'Contralto',
    status: 'active',
    joinedYear: 2024,
  }
];

export const INITIAL_SONGS: Song[] = [
  // Backward compatibility aliases for initial worship events
  ...ALL_PRAISE_SONGS.filter(s => s.id === 's_bondade_de_deus').map(s => ({ ...s, id: 's1' })),
  ...ALL_PRAISE_SONGS.filter(s => s.id === 's_a_ele_a_gloria').map(s => ({ ...s, id: 's2' })),
  ...ALL_PRAISE_SONGS.filter(s => s.id === 's_vitorioso_es').map(s => ({ ...s, id: 's3' })),
  ...ALL_PRAISE_SONGS.filter(s => s.id === 's_em_teus_bracos').map(s => ({ ...s, id: 's4' })),
  ...ALL_PRAISE_SONGS.filter(s => s.id === 's_que_ruja_o_leao').map(s => ({ ...s, id: 's5' })),
  ...ALL_PRAISE_SONGS.filter(s => s.id === 's_porque_ele_vive').map(s => ({ ...s, id: 's6' })),
  // Complete hymnody and contemporary worship catalogue
  ...ALL_PRAISE_SONGS
];

export const INITIAL_EVENTS: WorshipEvent[] = [
  {
    id: 'e1',
    title: 'Culto de Domingo - Manhã & Santa Ceia',
    type: 'culto_domingo',
    date: '2026-09-27',
    time: '09:00',
    location: 'Templo Principal - Elohim',
    theme: 'Série: Raízes da Graça - Comunhão e Memória',
    pastorOrSpeaker: 'Pr. Marcos Albuquerque',
    notes: 'Passagem de som às 08:00 impreterivelmente. Traje: tons neutros/escuros.',
    team: [
      { memberId: 'm1', roleName: 'Líder de Louvor & Violão', status: 'confirmed', confirmedAt: '2026-09-24T18:30:00' },
      { memberId: 'm3', roleName: 'Voz / Contralto', status: 'confirmed', confirmedAt: '2026-09-24T20:15:00' },
      { memberId: 'm4', roleName: 'Voz / Soprano', status: 'pending' },
      { memberId: 'm5', roleName: 'Teclado & Pads', status: 'confirmed', confirmedAt: '2026-09-24T19:00:00' },
      { memberId: 'm2', roleName: 'Contra-Baixo', status: 'confirmed', confirmedAt: '2026-09-24T18:45:00' },
      { memberId: 'm6', roleName: 'Bateria', status: 'confirmed', confirmedAt: '2026-09-25T08:10:00' },
      { memberId: 'm7', roleName: 'Guitarra', status: 'pending' },
      { memberId: 'm8', roleName: 'Mesa de Som / Áudio', status: 'confirmed', confirmedAt: '2026-09-24T18:00:00' }
    ],
    setlist: [
      { songId: 's2', key: 'D', order: 1, notes: 'Abertura vibrante' },
      { songId: 's3', key: 'D', order: 2, notes: 'Transição direta sem pausa' },
      { songId: 's1', key: 'G', order: 3, notes: 'Momento de adoração profunda' },
      { songId: 's6', key: 'G', order: 4, notes: 'Durante a distribuição do pão e do cálice' }
    ]
  },
  {
    id: 'e2',
    title: 'Culto de Domingo - Noite da Família',
    type: 'culto_domingo',
    date: '2026-09-27',
    time: '19:00',
    location: 'Templo Principal - Elohim',
    theme: 'Famílias Alicerçadas na Rocha',
    pastorOrSpeaker: 'Pr. Carlos Eduardo',
    notes: 'Passagem de som às 18:00.',
    team: [
      { memberId: 'm2', roleName: 'Líder de Louvor & Baixo', status: 'confirmed', confirmedAt: '2026-09-24T18:45:00' },
      { memberId: 'm4', roleName: 'Voz / Soprano', status: 'pending' },
      { memberId: 'm5', roleName: 'Teclado', status: 'confirmed', confirmedAt: '2026-09-24T19:00:00' },
      { memberId: 'm6', roleName: 'Bateria', status: 'confirmed', confirmedAt: '2026-09-25T08:10:00' },
      { memberId: 'm7', roleName: 'Guitarra & Violão', status: 'declined', declineReason: 'Viagem a trabalho agendada' },
      { memberId: 'm8', roleName: 'Mesa de Som', status: 'confirmed', confirmedAt: '2026-09-24T18:00:00' }
    ],
    setlist: [
      { songId: 's1', key: 'G', order: 1, notes: 'Vocal feminino no verso 1' },
      { songId: 's4', key: 'C', order: 2, notes: 'Ministração suave de cura' },
      { songId: 's2', key: 'D', order: 3, notes: 'Clímax da celebração' }
    ]
  },
  {
    id: 'e3',
    title: 'Ensaio Geral Semanal',
    type: 'ensaio',
    date: '2026-09-30',
    time: '19:45',
    location: 'Sala de Ensaios / Templo Principal',
    notes: 'Foco no novo arranjo de "Ruja o Leão" e alinhamento de fones de ouvido (In-ear).',
    team: [
      { memberId: 'm1', roleName: 'Coordenação Geral', status: 'confirmed' },
      { memberId: 'm2', roleName: 'Coordenação Harmônica', status: 'confirmed' },
      { memberId: 'm3', roleName: 'Vozes', status: 'confirmed' },
      { memberId: 'm4', roleName: 'Vozes', status: 'confirmed' },
      { memberId: 'm5', roleName: 'Harmonia / Teclado', status: 'confirmed' },
      { memberId: 'm6', roleName: 'Ritmo / Bateria', status: 'confirmed' },
      { memberId: 'm7', roleName: 'Cordas / Guitarra', status: 'pending' },
      { memberId: 'm8', roleName: 'Equalização & Gravação', status: 'confirmed' }
    ],
    setlist: [
      { songId: 's5', key: 'Am', order: 1, notes: 'Ajuste de dinâmicas' },
      { songId: 's1', key: 'G', order: 2, notes: 'Abertura de vozes na ponte' }
    ]
  },
  {
    id: 'e4',
    title: 'Elohim Young - Culto de Jovens',
    type: 'culto_jovens',
    date: '2026-10-03',
    time: '19:30',
    location: 'Auditório Alpha - Jovens',
    theme: 'Geração Inconformada',
    notes: 'Louvor com estilo jovem e dinâmico. Iluminação especial com a equipe de mídia.',
    team: [
      { memberId: 'm7', roleName: 'Líder de Louvor & Guitarra', status: 'confirmed' },
      { memberId: 'm3', roleName: 'Voz Principal', status: 'confirmed' },
      { memberId: 'm2', roleName: 'Baixo', status: 'confirmed' },
      { memberId: 'm6', roleName: 'Bateria', status: 'confirmed' },
      { memberId: 'm5', roleName: 'Teclado / Synths', status: 'confirmed' },
      { memberId: 'm8', roleName: 'Áudio & Transmissão', status: 'confirmed' }
    ],
    setlist: [
      { songId: 's3', key: 'D', order: 1, notes: 'Intro bem enérgica' },
      { songId: 's5', key: 'Am', order: 2, notes: 'Ponte forte com bumbo reto' },
      { songId: 's4', key: 'C', order: 3, notes: 'Momento de entrega pessoal' }
    ]
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Instalação dos novos Fones In-Ear',
    content: 'A partir deste domingo, a mesa digital Behringer X32 estará com mixagens individuais no app M32-Q via Wi-Fi do púlpito. Favor baixar o app antes do ensaio.',
    date: '2026-09-23',
    author: 'Tiago Lima (Áudio)',
    priority: 'high'
  },
  {
    id: 'n2',
    title: 'Horário de Passagem de Som aos Domingos',
    content: 'Lembramos a todos os escalados para o culto matutino que a passagem começa impreterivelmente às 08:00 para oração em equipe às 08:40.',
    date: '2026-09-20',
    author: 'Pr. Roberto Mendes',
    priority: 'normal'
  }
];
