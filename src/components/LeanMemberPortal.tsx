import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Mic2, 
  Music, 
  Search, 
  UserCheck, 
  ExternalLink, 
  Bell, 
  ChevronRight,
  Sparkles,
  Users,
  Info,
  SlidersHorizontal,
  Headphones,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Member, Song, WorshipEvent, Notice } from '../types';

interface LeanMemberPortalProps {
  currentUser: Member;
  events: WorshipEvent[];
  songs: Song[];
  members: Member[];
  notices: Notice[];
  onOpenSongModal: (song: Song) => void;
  onNavigateToStage: (eventId?: string) => void;
  onNavigateToSongs: () => void;
  onNavigateToSchedule: () => void;
  onUpdateEventTeamStatus: (eventId: string, memberId: string, status: 'confirmed' | 'declined', reason?: string) => void;
  onToggleLeanMode?: () => void;
}

export const LeanMemberPortal: React.FC<LeanMemberPortalProps> = ({
  currentUser,
  events,
  songs,
  members,
  notices,
  onOpenSongModal,
  onNavigateToStage,
  onNavigateToSongs,
  onNavigateToSchedule,
  onUpdateEventTeamStatus,
  onToggleLeanMode,
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [targetEventForDecline, setTargetEventForDecline] = useState<string | null>(null);
  const [quickSongSearch, setQuickSongSearch] = useState('');

  // Find upcoming events sorted by date
  const todayStr = new Date().toISOString().split('T')[0];
  const sortedEvents = [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  
  // All events where current user is scheduled
  const myEvents = sortedEvents.filter(e => e.team.some(t => t.memberId === currentUser.id));
  
  // My next upcoming event
  const myNextEvent = myEvents.find(e => e.date >= todayStr) || myEvents[0] || sortedEvents[0];
  
  // Current user's assignment in this event
  const myAssignment = myNextEvent?.team.find(t => t.memberId === currentUser.id);

  // Other future events where current user is scheduled
  const otherMyEvents = myEvents.filter(e => e.id !== myNextEvent?.id);

  // Maps for fast lookup
  const songsMap = new Map(songs.map(s => [s.id, s]));
  const membersMap = new Map(members.map(m => [m.id, m]));

  // Quick filtered songs for member study
  const searchResults = quickSongSearch.trim()
    ? songs.filter(s => 
        s.title.toLowerCase().includes(quickSongSearch.toLowerCase()) ||
        s.artist.toLowerCase().includes(quickSongSearch.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(quickSongSearch.toLowerCase()))
      ).slice(0, 5)
    : [];

  // Handle instant confirmation
  const handleConfirm = (eventId: string) => {
    onUpdateEventTeamStatus(eventId, currentUser.id, 'confirmed');
    try {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#0d9488', '#14b8a6', '#5eead4', '#f59e0b']
      });
    } catch {
      // fallback
    }
  };

  // Handle decline submission
  const handleDeclineSubmit = () => {
    if (targetEventForDecline) {
      onUpdateEventTeamStatus(
        targetEventForDecline, 
        currentUser.id, 
        'declined', 
        declineReason.trim() || 'Imprevisto pessoal informado pelo integrante'
      );
      setShowDeclineModal(false);
      setDeclineReason('');
      setTargetEventForDecline(null);
    }
  };

  // Helper date formatter
  const formatDateFriendly = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      
      {/* Top Lean Header: Member Identity & Mode Indicator */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-teal-800/40 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center shadow-inner shrink-0 ring-2 ring-teal-400/40">
              {currentUser.initials}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {currentUser.name}
                </span>
                <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-lg bg-teal-500/30 text-teal-200 border border-teal-400/40">
                  {currentUser.primaryInstrument}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  {currentUser.vocalRange}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
                <span className="font-medium">Versão do Integrante · Informações essenciais do seu louvor</span>
              </p>
            </div>
          </div>

          {/* Quick Action: Open Stage or Toggle Admin View */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {myNextEvent && (
              <button
                onClick={() => onNavigateToStage(myNextEvent.id)}
                className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                title="Abrir cifras em tela cheia na estante"
              >
                <Mic2 className="w-4 h-4 stroke-[2.5]" />
                <span>Modo Púlpito</span>
              </button>
            )}

            {currentUser.role === 'admin' && onToggleLeanMode && (
              <button
                onClick={onToggleLeanMode}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-700 transition-colors"
                title="Alternar para visão completa da liderança"
              >
                Painel Geral
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Focus Card: MINHA PRÓXIMA ESCALA */}
      {myNextEvent ? (
        <section aria-labelledby="proxima-escala-heading" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          {/* Card Header with Service Timing & Type */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-teal-50 to-slate-50 dark:from-slate-800/90 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 text-xs sm:text-sm font-black uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Sua Próxima Escala</span>
                  {myNextEvent.type === 'culto_domingo' && (
                    <span className="bg-teal-100 dark:bg-teal-900/80 text-teal-900 dark:text-teal-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      Culto Oficial
                    </span>
                  )}
                  {myNextEvent.type === 'ensaio' && (
                    <span className="bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      Ensaio da Equipe
                    </span>
                  )}
                </div>
                <h2 id="proxima-escala-heading" className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1.5 capitalize tracking-tight">
                  {myNextEvent.title}
                </h2>
                <p className="text-sm sm:text-base text-teal-800 dark:text-teal-300 font-bold capitalize mt-1">
                  {formatDateFriendly(myNextEvent.date)} às {myNextEvent.time}
                </p>
              </div>

              {/* Service details chip */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-700/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 font-semibold shadow-2xs">
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  {myNextEvent.location}
                </span>
                {myNextEvent.notes && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80 text-xs sm:text-sm font-bold shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    {myNextEvent.notes.split('.')[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">

            {/* Confirmation Banner for this Service */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
              myAssignment?.status === 'confirmed'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                : myAssignment?.status === 'declined'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
                : 'bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/30'
            }`}>
              <div className="flex items-start sm:items-center gap-3.5">
                {myAssignment?.status === 'confirmed' ? (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                ) : myAssignment?.status === 'declined' ? (
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <XCircle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                    <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Sua Função:{' '}
                    </span>
                    <strong className="text-base sm:text-lg font-black text-slate-900 dark:text-white underline decoration-teal-500 underline-offset-4">
                      {myAssignment?.roleName || currentUser.primaryInstrument}
                    </strong>
                  </div>

                  <p className="text-xs sm:text-sm mt-1">
                    {myAssignment?.status === 'confirmed' ? (
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        ✓ Presença confirmada! A igreja conta com você neste culto.
                      </span>
                    ) : myAssignment?.status === 'declined' ? (
                      <span className="font-bold text-amber-800 dark:text-amber-300">
                        Indisponibilidade comunicada ({myAssignment.declineReason || 'Sem justificativa'}).
                      </span>
                    ) : (
                      <span className="font-bold text-teal-900 dark:text-teal-200">
                        Você está escalado(a)! Confirme sua presença para a liderança.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Confirmation */}
              <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                {myAssignment?.status === 'confirmed' ? (
                  <button
                    onClick={() => {
                      setTargetEventForDecline(myNextEvent.id);
                      setShowDeclineModal(true);
                    }}
                    className="text-xs sm:text-sm text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 font-bold underline transition-colors"
                  >
                    Alterar / Informar Imprevisto
                  </button>
                ) : myAssignment?.status === 'declined' ? (
                  <button
                    onClick={() => handleConfirm(myNextEvent.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-xs transition-colors"
                  >
                    Reverter & Confirmar Presença
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleConfirm(myNextEvent.id)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>Confirmar Presença</span>
                    </button>
                    <button
                      onClick={() => {
                        setTargetEventForDecline(myNextEvent.id);
                        setShowDeclineModal(true);
                      }}
                      className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors"
                    >
                      Não Poderei Ir
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Setlist - Músicas que devo estudar/tocar */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Repertório do Culto ({myNextEvent.setlist.length} {myNextEvent.setlist.length === 1 ? 'louvor' : 'louvores'})
                  </h3>
                </div>

                <button
                  onClick={() => onNavigateToStage(myNextEvent.id)}
                  className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition-colors"
                >
                  <span>Abrir todas as cifras</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {myNextEvent.setlist.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-sm text-slate-500 font-medium">
                  O repertório deste culto ainda está sendo definido pela liderança.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {myNextEvent.setlist.map((item) => {
                    const song = songsMap.get(item.songId);
                    if (!song) return null;

                    return (
                      <div
                        key={item.songId}
                        onClick={() => onOpenSongModal(song)}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-500/70 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 bg-slate-50/70 dark:bg-slate-900/60 cursor-pointer transition-all shadow-2xs"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          {/* Order badge */}
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-300 font-black text-sm sm:text-base flex items-center justify-center shrink-0 border border-teal-300 dark:border-teal-800 shadow-2xs">
                            {item.order}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                {song.title}
                              </span>
                              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
                                · {song.artist}
                              </span>
                            </div>

                            {item.notes && (
                              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 mt-1 font-semibold">
                                💡 Nota da Liderança: "{item.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Song specs & Key pill */}
                        <div className="flex items-center gap-2.5 mt-3 sm:mt-0 self-end sm:self-auto shrink-0">
                          {/* Selected key for this service */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/15 text-teal-900 dark:text-teal-200 border border-teal-500/40 font-black text-xs sm:text-sm shadow-2xs" title="Tom selecionado para este culto">
                            <span className="text-[11px] uppercase font-bold text-slate-600 dark:text-slate-400">Tom:</span>
                            <span className="text-teal-700 dark:text-teal-300 font-mono text-sm sm:text-base font-black">{item.key}</span>
                          </div>

                          {/* BPM */}
                          <div className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold font-mono">
                            {song.tempoBpm} BPM
                          </div>

                          {/* Chords button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSongModal(song);
                            }}
                            className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-teal-500 hover:text-white dark:hover:bg-teal-500 dark:hover:text-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-black shadow-xs transition-colors flex items-center gap-1"
                          >
                            <span>Ver Cifra</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Team Members in this Service */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Equipe Escalada com Você ({myNextEvent.team.length} pessoas)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {myNextEvent.team.map((assign) => {
                  const m = membersMap.get(assign.memberId);
                  if (!m) return null;
                  const isMe = m.id === currentUser.id;

                  return (
                    <div 
                      key={assign.memberId}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                        isMe 
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-600 ring-2 ring-teal-500/20' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-2xs ${
                        isMe 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}>
                        {m.initials}
                      </div>

                      <div className="overflow-hidden min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                            {isMe ? 'Você' : m.name.split(' ')[0]}
                          </p>
                          {assign.status === 'confirmed' ? (
                            <span title="Confirmado" className="text-emerald-500 font-black text-xs shrink-0">✓</span>
                          ) : assign.status === 'declined' ? (
                            <span title="Indisponível" className="text-rose-500 font-black text-xs shrink-0">✕</span>
                          ) : (
                            <span title="Pendente" className="text-amber-500 font-black text-xs shrink-0">⋯</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold truncate">
                          {assign.roleName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Nenhuma escala pendente no momento
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Você não está escalado(a) nos próximos cultos agendados. Aproveite para consultar as cifras do acervo abaixo para ensaiar.
          </p>
        </div>
      )}

      {/* Outras Escalas Futuras */}
      {otherMyEvents.length > 0 && (
        <section aria-labelledby="outras-escalas-heading" className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 id="outras-escalas-heading" className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Próximas Datas Escaladas</span>
            </h3>
            <button
              onClick={onNavigateToSchedule}
              className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Ver calendário completo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherMyEvents.map(ev => {
              const myAssign = ev.team.find(t => t.memberId === currentUser.id);

              return (
                <div 
                  key={ev.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between gap-3 text-sm shadow-2xs"
                >
                  <div>
                    <span className="font-black text-base text-slate-900 dark:text-white block">
                      {ev.title}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-semibold block mt-0.5 text-xs sm:text-sm">
                      {formatDateFriendly(ev.date)} às {ev.time}
                    </span>
                    <span className="text-teal-700 dark:text-teal-300 font-bold text-xs sm:text-sm block mt-1">
                      Função: {myAssign?.roleName || currentUser.primaryInstrument}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    {myAssign?.status === 'confirmed' ? (
                      <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-black text-xs rounded-xl border border-emerald-300 dark:border-emerald-800">
                        ✓ Confirmado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirm(ev.id)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
                      >
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Chords & Repertoire Search (Zero Distraction Study Area) */}
      <section aria-labelledby="consulta-rapida-heading" className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 id="consulta-rapida-heading" className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Consultar Cifras e Louvores ({songs.length} disponíveis)
            </h3>
          </div>
          <button
            onClick={onNavigateToSongs}
            className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline"
          >
            Abrir acervo completo
          </button>
        </div>

        {/* Search input with large, legible text */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={quickSongSearch}
            onChange={(e) => setQuickSongSearch(e.target.value)}
            placeholder="Buscar por louvor, artista ou tema (ex: Bondade de Deus, Fernandinho)..."
            className="w-full pl-12 pr-4 py-3 text-sm sm:text-base font-medium bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder-slate-400 shadow-2xs"
          />
        </div>

        {/* Quick Results */}
        {quickSongSearch.trim() && (
          <div className="space-y-2 pt-1">
            {searchResults.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4 font-medium">
                Nenhum louvor encontrado com "{quickSongSearch}".
              </p>
            ) : (
              searchResults.map(song => (
                <div
                  key={song.id}
                  onClick={() => onOpenSongModal(song)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Music className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div>
                      <span className="font-black text-base text-slate-900 dark:text-white">
                        {song.title}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm ml-2 font-semibold">
                        · {song.artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-black text-teal-800 dark:text-teal-200 bg-teal-100 dark:bg-teal-950 px-2.5 py-1 rounded-lg text-xs sm:text-sm border border-teal-300 dark:border-teal-800">
                      Tom: {song.churchKey}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">
                      {song.tempoBpm} BPM
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Avisos do Ministério do Louvor */}
      {notices && notices.length > 0 && (
        <section aria-labelledby="mural-avisos-heading" className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 id="mural-avisos-heading" className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Avisos da Equipe de Louvor
            </h3>
          </div>

          <div className="space-y-3">
            {notices.map(notice => (
              <div 
                key={notice.id} 
                className={`p-4 rounded-2xl border space-y-1.5 ${
                  notice.priority === 'high'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-slate-900 dark:text-white">
                    {notice.title}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {notice.date}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
                  {notice.content}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">
                  Por: {notice.author}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal: Informar Indisponibilidade / Não Poderei Ir */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Informar Indisponibilidade
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Sentiremos sua falta! Por favor, informe brevemente o motivo para que a liderança do louvor possa providenciar uma substituição a tempo.
            </p>

            <div>
              <label htmlFor="decline-reason" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Motivo / Justificativa:
              </label>
              <textarea
                id="decline-reason"
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Ex: Viagem de trabalho, problema de saúde, compromisso inadiável..."
                className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                  setTargetEventForDecline(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleDeclineSubmit}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow transition-colors"
              >
                Confirmar Indisponibilidade
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
