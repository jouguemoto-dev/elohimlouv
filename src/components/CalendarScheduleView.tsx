import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Mic2, 
  Check, 
  Trash2, 
  Edit3, 
  Users, 
  Music,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { WorshipEvent, Member, Song } from '../types';
import { generateWhatsAppScaleMessage } from '../utils/whatsappExport';

interface CalendarScheduleViewProps {
  events: WorshipEvent[];
  members: Member[];
  songs: Song[];
  currentUser: Member;
  onSaveEvent: (event: WorshipEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onNavigateToStage: (eventId: string) => void;
  onOpenSongModal: (song: Song) => void;
  isLeanMode?: boolean;
}

export const CalendarScheduleView: React.FC<CalendarScheduleViewProps> = ({
  events,
  members,
  songs,
  currentUser,
  onSaveEvent,
  onDeleteEvent,
  onNavigateToStage,
  onOpenSongModal,
  isLeanMode = false,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [showOnlyMine, setShowOnlyMine] = useState<boolean>(isLeanMode || currentUser.role === 'member');
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WorshipEvent | null>(null);

  // Maps
  const membersMap = new Map(members.map(m => [m.id, m]));
  const songsMap = new Map(songs.map(s => [s.id, s]));

  // Filtered Events
  const filteredEvents = events.filter(e => {
    if (showOnlyMine && !e.team.some(t => t.memberId === currentUser.id)) {
      return false;
    }
    if (filterType === 'all') return true;
    return e.type === filterType;
  }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // Copy WhatsApp scale
  const handleCopyWhatsApp = (event: WorshipEvent) => {
    const text = generateWhatsAppScaleMessage(event, members, songs);
    navigator.clipboard.writeText(text);
    setCopiedEventId(event.id);
    setTimeout(() => {
      setCopiedEventId(null);
    }, 2500);
  };

  // Open modal for new event
  const handleCreateNewEvent = () => {
    const newEvent: WorshipEvent = {
      id: 'e_' + Date.now(),
      title: 'Culto de Domingo - Manhã',
      type: 'culto_domingo',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      location: 'Templo Principal - Elohim',
      theme: '',
      pastorOrSpeaker: '',
      notes: 'Chegada da equipe às 08:00 para passagem de som e oração.',
      team: [
        { memberId: members[0]?.id || '', roleName: 'Líder de Louvor', status: 'confirmed' },
        { memberId: members[2]?.id || '', roleName: 'Voz / Vocal', status: 'pending' },
        { memberId: members[4]?.id || '', roleName: 'Teclado', status: 'pending' },
        { memberId: members[1]?.id || '', roleName: 'Contra-Baixo', status: 'pending' },
        { memberId: members[5]?.id || '', roleName: 'Bateria', status: 'pending' },
      ],
      setlist: [
        { songId: songs[0]?.id || '', key: songs[0]?.churchKey || 'G', order: 1 },
        { songId: songs[1]?.id || '', key: songs[1]?.churchKey || 'D', order: 2 },
      ]
    };
    setEditingEvent(newEvent);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: WorshipEvent) => {
    setEditingEvent(JSON.parse(JSON.stringify(event)));
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      onSaveEvent(editingEvent);
      setIsModalOpen(false);
      setEditingEvent(null);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Escalas, Cultos e Eventos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organização da equipe musical, confirmação de presença e repertório dos cultos da Elohim.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Calendário
            </button>
          </div>

          {/* My Scales vs All Scales Filter Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setShowOnlyMine(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                showOnlyMine
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Minhas Escalas
            </button>
            <button
              onClick={() => setShowOnlyMine(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                !showOnlyMine
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos os Cultos
            </button>
          </div>

          {/* New Event Button (Available for Admin in Full Mode) */}
          {!isLeanMode && currentUser.role === 'admin' && (
            <button
              onClick={handleCreateNewEvent}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Culto</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filtrar:
        </span>
        {[
          { id: 'all', label: 'Todos os Eventos' },
          { id: 'culto_domingo', label: 'Cultos de Domingo' },
          { id: 'culto_jovens', label: 'Culto de Jovens' },
          { id: 'ensaio', label: 'Ensaios' },
          { id: 'conferencia', label: 'Conferências' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterType === f.id
                ? 'bg-slate-900 dark:bg-teal-950 text-white dark:text-teal-300 dark:border dark:border-teal-700/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* View: List Mode */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const confirmedCount = event.team.filter(t => t.status === 'confirmed').length;
            const pendingCount = event.team.filter(t => t.status === 'pending').length;
            const declinedCount = event.team.filter(t => t.status === 'declined').length;

            return (
              <div
                key={event.id}
                className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs transition-colors hover:border-slate-300 dark:hover:border-slate-600"
              >
                {/* Event Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
                      <span className="font-black text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-300 dark:border-teal-700 uppercase tracking-wider text-xs">
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className="text-teal-800 dark:text-teal-300 font-bold capitalize flex items-center gap-1.5 bg-teal-50/60 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg">
                        <CalendarIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        {formatDate(event.date)}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {event.time}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {event.location}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {event.title}
                    </h2>
                    {event.theme && (
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
                        Tema: <span className="text-teal-700 dark:text-teal-400 font-bold">{event.theme}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions & WhatsApp copy */}
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <button
                      onClick={() => handleCopyWhatsApp(event)}
                      className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-colors flex items-center gap-2 shadow-2xs ${
                        copiedEventId === event.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Copiar escala formatada para o grupo do WhatsApp"
                    >
                      {copiedEventId === event.id ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Copiar WhatsApp</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onNavigateToStage(event.id)}
                      className="px-3.5 py-2 bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-black text-xs sm:text-sm rounded-xl border border-teal-300 dark:border-teal-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Abrir no modo púlpito / palco"
                    >
                      <Mic2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Modo Púlpito</span>
                    </button>

                    {!isLeanMode && currentUser.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Editar culto e escala"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir a escala "${event.title}"?`)) {
                              onDeleteEvent(event.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Excluir culto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Team Status Summary Bar */}
                <div className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Equipe ({event.team.length}):
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {confirmedCount} confirmados
                    </span>
                    {pendingCount > 0 && (
                      <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {pendingCount} pendentes
                      </span>
                    )}
                    {declinedCount > 0 && (
                      <span className="text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {declinedCount} indisponível
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
                  {event.team.map((t) => {
                    const member = membersMap.get(t.memberId);
                    return (
                      <div
                        key={t.memberId}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          t.status === 'confirmed'
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50'
                            : t.status === 'declined'
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/60'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {member?.name || 'Membro'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {t.roleName}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {t.status === 'confirmed' && (
                            <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 rounded">
                              Confirmado
                            </span>
                          )}
                          {t.status === 'pending' && (
                            <span className="text-amber-700 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 rounded">
                              Pendente
                            </span>
                          )}
                          {t.status === 'declined' && (
                            <span className="text-rose-700 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950 rounded">
                              Recusou
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Setlist preview */}
                {event.setlist && event.setlist.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mr-1">
                      <Music className="w-3.5 h-3.5" /> Louvores:
                    </span>
                    {event.setlist.map((item, idx) => {
                      const song = songsMap.get(item.songId);
                      if (!song) return null;
                      return (
                        <button
                          key={item.songId}
                          onClick={() => onOpenSongModal(song)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors border border-transparent hover:border-teal-300 dark:hover:border-teal-700"
                        >
                          <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">#{idx + 1}</span>
                          <span>{song.title}</span>
                          <span className="font-mono font-bold text-[10px] bg-white dark:bg-slate-800 px-1 rounded border border-slate-200 dark:border-slate-600">
                            {item.key}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* View: Calendar Grid Mode */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs transition-colors space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Setembro / Outubro 2026
            </h3>
            <span className="text-xs text-slate-500">Igreja Batista Elohim</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleEditEvent(evt)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-teal-400 dark:hover:border-teal-600 cursor-pointer transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-teal-600 dark:text-teal-400">{formatDate(evt.date)}</span>
                  <span>{evt.time}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {evt.title}
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {evt.team.length} membros escalados · {evt.setlist.length} músicas
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {evt.team.filter(t => t.status === 'confirmed').length} conf.
                  </span>
                  <span>·</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {evt.team.filter(t => t.status === 'pending').length} pend.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Event */}
      {isModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {events.some(e => e.id === editingEvent.id) ? 'Editar Culto / Escala' : 'Novo Culto / Evento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Título do Culto / Evento:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Evento:
                  </label>
                  <select
                    value={editingEvent.type}
                    onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="culto_domingo">Culto de Domingo</option>
                    <option value="culto_jovens">Culto de Jovens</option>
                    <option value="ensaio">Ensaio Geral</option>
                    <option value="conferencia">Conferência / Especial</option>
                    <option value="vigilia">Vigília</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data:
                  </label>
                  <input
                    type="date"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Horário:
                  </label>
                  <input
                    type="time"
                    required
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Local:
                  </label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tema da Ministração / Pregador:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Raízes da Graça · Pr. Marcos"
                  value={editingEvent.theme || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, theme: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {/* Equipe Escalada Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Equipe Escalada ({editingEvent.team.length} membros)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const availableMember = members.find(m => !editingEvent.team.some(t => t.memberId === m.id)) || members[0];
                      setEditingEvent({
                        ...editingEvent,
                        team: [
                          ...editingEvent.team,
                          { memberId: availableMember.id, roleName: availableMember.primaryInstrument, status: 'pending' }
                        ]
                      });
                    }}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    + Adicionar Integrante
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {editingEvent.team.map((assignment, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg text-xs">
                      <select
                        value={assignment.memberId}
                        onChange={(e) => {
                          const updated = [...editingEvent.team];
                          updated[index].memberId = e.target.value;
                          setEditingEvent({ ...editingEvent, team: updated });
                        }}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white"
                      >
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.primaryInstrument})</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Função (ex: Teclado)"
                        value={assignment.roleName}
                        onChange={(e) => {
                          const updated = [...editingEvent.team];
                          updated[index].roleName = e.target.value;
                          setEditingEvent({ ...editingEvent, team: updated });
                        }}
                        className="w-32 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white"
                      />

                      <select
                        value={assignment.status}
                        onChange={(e) => {
                          const updated = [...editingEvent.team];
                          updated[index].status = e.target.value as any;
                          setEditingEvent({ ...editingEvent, team: updated });
                        }}
                        className="w-28 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white"
                      >
                        <option value="confirmed">Confirmado</option>
                        <option value="pending">Pendente</option>
                        <option value="declined">Recusado</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingEvent.team.filter((_, i) => i !== index);
                          setEditingEvent({ ...editingEvent, team: updated });
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-xs"
                >
                  Salvar Escala
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
