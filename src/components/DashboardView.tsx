import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Play, 
  ExternalLink, 
  Sparkles, 
  Mic2, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Member, Song, WorshipEvent, Notice } from '../types';

interface DashboardViewProps {
  currentUser: Member;
  events: WorshipEvent[];
  songs: Song[];
  members: Member[];
  notices: Notice[];
  onOpenSongModal: (song: Song) => void;
  onNavigateToSchedule: () => void;
  onNavigateToStage: (eventId?: string) => void;
  onUpdateEventTeamStatus: (eventId: string, memberId: string, status: 'confirmed' | 'declined', reason?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  events,
  songs,
  members,
  notices,
  onOpenSongModal,
  onNavigateToSchedule,
  onNavigateToStage,
  onUpdateEventTeamStatus,
}) => {
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReasonText, setDeclineReasonText] = useState('');
  const [selectedEventForDecline, setSelectedEventForDecline] = useState<string | null>(null);

  // Find next upcoming event
  const todayStr = '2026-09-25';
  const upcomingEvents = [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const nextEvent = upcomingEvents.find(e => e.date >= todayStr) || upcomingEvents[0];

  // Check if current user is scheduled in next event
  const myNextAssignment = nextEvent?.team.find(t => t.memberId === currentUser.id);

  // Songs map
  const songsMap = new Map(songs.map(s => [s.id, s]));
  const membersMap = new Map(members.map(m => [m.id, m]));

  const handleConfirm = (eventId: string) => {
    onUpdateEventTeamStatus(eventId, currentUser.id, 'confirmed');
    // Fire celebratory micro-confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0d9488', '#14b8a6', '#5eead4', '#f59e0b']
      });
    } catch {
      // Audio or confetti fallback
    }
  };

  const handleDeclineSubmit = () => {
    if (selectedEventForDecline) {
      onUpdateEventTeamStatus(selectedEventForDecline, currentUser.id, 'declined', declineReasonText || 'Imprevisto pessoal');
      setShowDeclineDialog(false);
      setDeclineReasonText('');
      setSelectedEventForDecline(null);
    }
  };

  // Helper date formatter
  const formatFriendlyDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ministério de Louvor Elohim</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 capitalize">{currentUser.role === 'admin' ? 'Painel de Liderança' : 'Painel do Músico'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Paz do Senhor, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {currentUser.primaryInstrument} · {currentUser.vocalRange} · Que o Senhor use seus dons com excelência para edificar a igreja de Cristo.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => onNavigateToStage(nextEvent?.id)}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 whitespace-nowrap active:scale-95"
            >
              <Mic2 className="w-4 h-4" />
              <span>Entrar no Modo Púlpito</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero: Next Event & Scale Status */}
      {nextEvent && (
        <section className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            
            {/* Left: Event Details */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-bold px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
                  Próximo Culto
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium capitalize">
                  {formatFriendlyDate(nextEvent.date)}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {nextEvent.time}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {nextEvent.title}
                </h2>
                {nextEvent.theme && (
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{nextEvent.theme}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {nextEvent.location}
                </span>
                {nextEvent.pastorOrSpeaker && (
                  <span>Pregador: {nextEvent.pastorOrSpeaker}</span>
                )}
                {nextEvent.notes && (
                  <span className="italic text-slate-400 dark:text-slate-500">"{nextEvent.notes}"</span>
                )}
              </div>

              {/* Personal Scale Status Card */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                {myNextAssignment ? (
                  <div className={`p-4 rounded-xl border transition-colors ${
                    myNextAssignment.status === 'confirmed'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                      : myNextAssignment.status === 'declined'
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                      : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {myNextAssignment.status === 'confirmed' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                          {myNextAssignment.status === 'pending' && (
                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          )}
                          {myNextAssignment.status === 'declined' && (
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          )}
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Sua Função: {myNextAssignment.roleName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {myNextAssignment.status === 'confirmed' && 'Você confirmou sua presença neste culto! Passagem de som às 08:00.'}
                          {myNextAssignment.status === 'pending' && 'Sua presença está pendente de confirmação. Por favor, confirme para fecharmos a escala.'}
                          {myNextAssignment.status === 'declined' && `Você informou ausência (${myNextAssignment.declineReason || 'Indisponível'}). A liderança foi notificada.`}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {myNextAssignment.status !== 'confirmed' && (
                          <button
                            onClick={() => handleConfirm(nextEvent.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmar Presença</span>
                          </button>
                        )}

                        {myNextAssignment.status !== 'declined' && (
                          <button
                            onClick={() => {
                              setSelectedEventForDecline(nextEvent.id);
                              setShowDeclineDialog(true);
                            }}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg border border-slate-300 dark:border-slate-600 transition-colors"
                          >
                            Recusar / Trocar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>Você não está escalado neste culto. Descanse ou venha adorar conosco no auditório!</span>
                    <button 
                      onClick={onNavigateToSchedule}
                      className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1 ml-2 shrink-0"
                    >
                      Ver Escala Geral <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Team Snapshot */}
            <div className="lg:w-80 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Equipe Escalada ({nextEvent.team.length})
                </span>
                <button 
                  onClick={onNavigateToSchedule}
                  className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Ver detalhes
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {nextEvent.team.map((t) => {
                  const member = membersMap.get(t.memberId);
                  return (
                    <div key={t.memberId} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {member?.initials || '??'}
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {member?.name || 'Membro'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {t.roleName}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {t.status === 'confirmed' && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Conf.
                          </span>
                        )}
                        {t.status === 'pending' && (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pend.
                          </span>
                        )}
                        {t.status === 'declined' && (
                          <span className="text-rose-700 dark:text-rose-400 font-semibold text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Rec.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Setlist of Next Event */}
          {nextEvent.setlist && nextEvent.setlist.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Repertório Selecionado ({nextEvent.setlist.length} músicas)
                  </h3>
                  <span className="text-xs text-slate-400">· Clique na música para ver cifra e transpor</span>
                </div>

                <button
                  onClick={() => onNavigateToStage(nextEvent.id)}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1"
                >
                  <Mic2 className="w-3.5 h-3.5" /> Modo Púlpito
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {nextEvent.setlist.map((item, idx) => {
                  const song = songsMap.get(item.songId);
                  if (!song) return null;
                  return (
                    <div
                      key={item.songId}
                      onClick={() => onOpenSongModal(song)}
                      className="group bg-slate-50 dark:bg-slate-900/60 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-teal-300 dark:hover:border-teal-700 rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span className="font-mono text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                            #{idx + 1}
                          </span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            Tom: {item.key}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                          {song.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {song.artist}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono">{song.tempoBpm} BPM · {song.timeSignature}</span>
                        <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:underline flex items-center gap-0.5">
                          <FileText className="w-3 h-3" /> Cifra
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </section>
      )}

      {/* Grid: Ministry Notices & Repertoire Quick Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Notices Board */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs transition-colors space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Avisos da Liderança
            </h3>
            <span className="text-xs text-slate-400">Fixados</span>
          </div>

          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {notice.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {notice.date}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notice.content}
                </p>
                <div className="text-[11px] text-slate-400 italic">
                  Postado por: {notice.author}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Repertoire Spotlight */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs transition-colors space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Mais Tocadas no Ministério
            </h3>
            <span className="text-xs text-slate-400 font-mono">{songs.length} cadastradas</span>
          </div>

          <div className="space-y-2">
            {songs.slice(0, 4).map((s) => (
              <div
                key={s.id}
                onClick={() => onOpenSongModal(s)}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {s.artist} · Tom Elohim: <span className="font-mono font-semibold">{s.churchKey}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {s.mediaUrl && (
                    <a
                      href={s.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                      title="Ouvir no YouTube"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className="text-teal-600 dark:text-teal-400 text-xs font-semibold flex items-center gap-0.5">
                    Cifra <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Decline Reason Dialog */}
      {showDeclineDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Informar Indisponibilidade
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Caso você não possa comparecer neste culto, por favor informe o motivo para que a liderança possa convocar um substituto a tempo.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Motivo ou Observação:
              </label>
              <textarea
                value={declineReasonText}
                onChange={(e) => setDeclineReasonText(e.target.value)}
                placeholder="Ex: Viagem de trabalho, problema de saúde, compromisso familiar..."
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeclineDialog(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeclineSubmit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs transition-colors"
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
