import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Maximize2, 
  RotateCcw, 
  Play, 
  Square, 
  ZoomIn, 
  ZoomOut, 
  X,
  Type,
  Music
} from 'lucide-react';
import { WorshipEvent, Song } from '../types';
import { transposeChordSheet, transposeSingleNote, parseChordSheetLines } from '../utils/chordTransposer';
import { metronomeService } from '../utils/metronome';

interface StageModeViewProps {
  events: WorshipEvent[];
  songs: Song[];
  initialEventId?: string;
  onExitStageMode: () => void;
}

export const StageModeView: React.FC<StageModeViewProps> = ({
  events,
  songs,
  initialEventId,
  onExitStageMode,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || events[0]?.id || '');
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [semitoneOffset, setSemitoneOffset] = useState<number>(0);
  // Default font size 26px for great visibility from 2 meters away on stage music stands
  const [fontSize, setFontSize] = useState<number>(26);
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [clockTime, setClockTime] = useState<string>('');

  // Find active event and songs
  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];
  const setlistItems = activeEvent?.setlist || [];
  const songsMap = new Map(songs.map(s => [s.id, s]));

  const currentSetItem = setlistItems[currentSongIndex];
  const currentSong = currentSetItem ? songsMap.get(currentSetItem.songId) : songs[0];

  // Clock updates every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Setlist song switch reset transposer
  useEffect(() => {
    setSemitoneOffset(0);
    if (currentSong?.tempoBpm) {
      metronomeService.setBpm(currentSong.tempoBpm);
    }
  }, [currentSongIndex, selectedEventId]);

  // Metronome listener
  useEffect(() => {
    metronomeService.setOnBeat((beat) => {
      setCurrentBeat(beat);
    });

    return () => {
      metronomeService.stop();
      metronomeService.setOnBeat(null);
    };
  }, []);

  const handleToggleMetronome = () => {
    if (currentSong?.tempoBpm) {
      metronomeService.setBpm(currentSong.tempoBpm);
    }
    const active = metronomeService.toggle();
    setIsMetronomeActive(active);
  };

  const currentKey = currentSong 
    ? transposeSingleNote(currentSetItem?.key || currentSong.churchKey, semitoneOffset)
    : 'G';

  const transposedChords = currentSong 
    ? transposeChordSheet(currentSong.chords, semitoneOffset)
    : '';

  const parsedLines = parseChordSheetLines(transposedChords);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Stage Top Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        
        {/* Left: Event Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExitStageMode}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Sair do Modo Púlpito"
            aria-label="Sair do Modo Púlpito"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <span className="text-[11px] uppercase font-black tracking-widest text-teal-400 block leading-tight">
              ESTANTE DIGITAL · PÚLPITO
            </span>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setCurrentSongIndex(0);
              }}
              className="bg-transparent font-bold text-xs sm:text-sm text-white focus:outline-none cursor-pointer max-w-[200px] sm:max-w-none truncate"
            >
              {events.map(e => (
                <option key={e.id} value={e.id} className="bg-slate-900 text-white">
                  {e.title} ({e.date})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Live Clock */}
        <div className="flex items-center gap-2 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-slate-800 text-teal-400 font-mono font-black text-sm sm:text-base tracking-widest shadow-inner">
          <Clock className="w-4 h-4 text-teal-400 animate-pulse" />
          <span>{clockTime}</span>
        </div>

        {/* Right: Metronome & Font Size Presets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Metronome */}
          <button
            onClick={handleToggleMetronome}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-colors ${
              isMetronomeActive
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700'
            }`}
          >
            {isMetronomeActive ? <Square className="w-4 h-4 stroke-[3]" /> : <Play className="w-4 h-4 text-teal-400" />}
            <span className="font-mono">{currentSong?.tempoBpm} BPM</span>
          </button>

          {isMetronomeActive && (
            <div className="hidden sm:flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg">
              {[1, 2, 3, 4].map(b => (
                <span
                  key={b}
                  className={`w-3 h-3 rounded-full transition-transform ${
                    currentBeat === b 
                      ? (b === 1 ? 'bg-red-500 scale-150' : 'bg-amber-400 scale-125')
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Font Size Presets for Stage */}
          <div className="flex items-center gap-1 bg-slate-800/90 rounded-xl p-1 border border-slate-700">
            <span className="text-xs font-bold text-slate-300 hidden md:inline px-1">Letra:</span>
            
            {/* Quick Presets */}
            <div className="hidden lg:flex items-center gap-0.5 mr-1">
              {[
                { label: '22', size: 22 },
                { label: '26', size: 26 },
                { label: '32', size: 32 },
                { label: '40', size: 40 },
              ].map(p => (
                <button
                  key={p.size}
                  onClick={() => setFontSize(p.size)}
                  className={`px-2 py-0.5 rounded text-xs font-black transition-colors ${
                    fontSize === p.size
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFontSize(prev => Math.max(18, prev - 2))}
              className="p-1.5 hover:text-white text-slate-400 rounded-lg hover:bg-slate-700"
              title="Diminuir tamanho da letra"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-1.5 text-teal-400 min-w-[38px] text-center">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(prev => Math.min(44, prev + 2))}
              className="p-1.5 hover:text-white text-slate-400 rounded-lg hover:bg-slate-700"
              title="Aumentar tamanho da letra"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Setlist Tabs Strip (Large & High Contrast) */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Ordem do Culto:
        </span>
        {setlistItems.map((item, idx) => {
          const s = songsMap.get(item.songId);
          if (!s) return null;
          const isCurrent = idx === currentSongIndex;
          return (
            <button
              key={item.songId}
              onClick={() => setCurrentSongIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 whitespace-nowrap shrink-0 ${
                isCurrent
                  ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-400 scale-[1.02]'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700'
              }`}
            >
              <span className="font-mono text-xs opacity-90 font-black">#{idx + 1}</span>
              <span className="truncate max-w-[150px] sm:max-w-none">{s.title}</span>
              <span className="font-mono text-xs bg-black/40 px-2 py-0.5 rounded font-black text-teal-300">
                {item.key}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Chord & Lyrics Content Area (Ultra High Legibility) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-12 py-8 bg-slate-950 font-mono select-text">
        {currentSong ? (
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Song Meta Header: Big Title & Bold Transposer */}
            <div className="border-b border-slate-800/90 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {currentSong.title}
                </h1>
                <p className="text-sm sm:text-base text-teal-400 font-sans font-semibold mt-1">
                  {currentSong.artist} · Compasso: {currentSong.timeSignature} · Andamento: {currentSong.tempoBpm} BPM
                </p>
              </div>

              {/* Transposer on Stage with Large Current Key */}
              <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-xs sm:text-sm text-slate-400 font-sans font-bold">Tom:</span>
                <button
                  onClick={() => setSemitoneOffset(prev => prev - 1)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-black text-white active:scale-95 transition-transform"
                  title="Diminuir tom"
                >
                  -1
                </button>

                <span className="font-mono font-black text-lg sm:text-xl text-teal-300 px-2 min-w-[50px] text-center">
                  {currentKey}
                </span>

                <button
                  onClick={() => setSemitoneOffset(prev => prev + 1)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-black text-white active:scale-95 transition-transform"
                  title="Aumentar tom"
                >
                  +1
                </button>

                {semitoneOffset !== 0 && (
                  <button
                    onClick={() => setSemitoneOffset(0)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 ml-1"
                    title="Restaurar tom padrão"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Arrangement Notice */}
            {currentSong.notes && (
              <div className="bg-teal-950/60 border border-teal-800 rounded-2xl p-4 text-sm sm:text-base text-teal-200 font-sans font-medium shadow-sm">
                <strong className="text-teal-300 font-black">💡 Observação de Palco:</strong> {currentSong.notes}
              </div>
            )}

            {/* High-Contrast Highlighted Chords & Lyrics Display */}
            <div 
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
              className="space-y-1 font-mono tracking-wide pt-2"
            >
              {parsedLines.map((line, idx) => {
                if (line.type === 'empty') {
                  return <div key={idx} className="h-6" />;
                }

                if (line.type === 'section') {
                  return (
                    <div key={idx} className="pt-6 pb-2">
                      <span className="inline-block px-3.5 py-1.5 rounded-xl bg-teal-950 border border-teal-600 text-teal-300 font-black uppercase text-[0.8em] tracking-wider shadow-md">
                        {line.text}
                      </span>
                    </div>
                  );
                }

                if (line.type === 'chord') {
                  return (
                    <div 
                      key={idx} 
                      className="font-black text-amber-400 whitespace-pre tracking-wider select-text"
                    >
                      {line.text}
                    </div>
                  );
                }

                // Normal lyric line
                return (
                  <div 
                    key={idx} 
                    className="font-bold text-slate-100 whitespace-pre select-text"
                  >
                    {line.text}
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 font-sans text-lg font-semibold">
            Nenhuma música selecionada neste culto.
          </div>
        )}
      </div>

      {/* Stage Bottom Navigation: Previous & Next Song (Large Touch Targets for Stage) */}
      <div className="h-20 bg-slate-900 border-t border-slate-800 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <button
          disabled={currentSongIndex <= 0}
          onClick={() => setCurrentSongIndex(prev => Math.max(0, prev - 1))}
          className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white font-extrabold text-sm sm:text-base flex items-center gap-2 transition-all active:scale-95 shadow-md border border-slate-700"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Música Anterior</span>
        </button>

        <span className="text-sm sm:text-base font-mono font-bold text-slate-300">
          Música <strong className="text-teal-400 text-lg font-black">{currentSongIndex + 1}</strong> de {setlistItems.length}
        </span>

        <button
          disabled={currentSongIndex >= setlistItems.length - 1}
          onClick={() => setCurrentSongIndex(prev => Math.min(setlistItems.length - 1, prev + 1))}
          className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:pointer-events-none text-white font-extrabold text-sm sm:text-base flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-teal-900/30"
        >
          <span>Próxima Música</span>
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
};

