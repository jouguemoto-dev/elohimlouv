import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Play, 
  Square, 
  Volume2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  FileText,
  Youtube,
  Radio,
  Clock,
  Sparkles,
  Type
} from 'lucide-react';
import { Song } from '../types';
import { transposeChordSheet, transposeSingleNote, parseChordSheetLines } from '../utils/chordTransposer';
import { metronomeService } from '../utils/metronome';

interface ChordViewerModalProps {
  song: Song;
  onClose: () => void;
  onOpenStageMode?: () => void;
}

export const ChordViewerModal: React.FC<ChordViewerModalProps> = ({
  song,
  onClose,
  onOpenStageMode,
}) => {
  const [semitoneOffset, setSemitoneOffset] = useState<number>(0);
  // Default font size increased to 22px for stage and rehearsal visibility
  const [fontSize, setFontSize] = useState<number>(22);
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [bpm, setBpm] = useState<number>(song.tempoBpm || 70);

  // Stop metronome on unmount
  useEffect(() => {
    metronomeService.setBpm(bpm);
    metronomeService.setOnBeat((beat) => {
      setCurrentBeat(beat);
    });

    return () => {
      metronomeService.stop();
      metronomeService.setOnBeat(null);
    };
  }, []);

  const handleToggleMetronome = () => {
    metronomeService.setBpm(bpm);
    const active = metronomeService.toggle();
    setIsMetronomeActive(active);
  };

  const handleBpmChange = (newBpm: number) => {
    const clamped = Math.max(40, Math.min(220, newBpm));
    setBpm(clamped);
    metronomeService.setBpm(clamped);
  };

  // Calculate current transposed key
  const currentKey = transposeSingleNote(song.churchKey || song.originalKey, semitoneOffset);

  // Transposed chord sheet text
  const transposedChords = transposeChordSheet(song.chords, semitoneOffset);
  const parsedLines = parseChordSheetLines(transposedChords);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header Toolbar */}
        <div className="px-4 py-3 sm:px-6 bg-slate-50 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {song.title}
                </h2>
                <span className="text-sm font-black px-3 py-1 rounded-lg bg-teal-600 dark:bg-teal-500 text-white font-mono shadow-xs">
                  TOM: {currentKey}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                {song.artist} · Tom Original: <span className="font-mono font-bold">{song.originalKey}</span> · Padrão Elohim: <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{song.churchKey}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenStageMode && (
              <button
                onClick={onOpenStageMode}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
              >
                <span>Modo Púlpito (Tela Cheia)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Fechar"
              aria-label="Fechar cifra"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

        </div>

        {/* Controls Bar: Transpose, Metronome, Font Zoom Presets */}
        <div className="px-4 py-2.5 sm:px-6 bg-slate-100/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm shrink-0">
          
          {/* Semitone Transposer */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">Transpor Tom:</span>
            <button
              onClick={() => setSemitoneOffset(prev => prev - 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border border-slate-300 dark:border-slate-600 font-mono font-black text-sm text-slate-900 dark:text-white shadow-xs transition-colors active:scale-95"
              title="Diminuir 1 semitom"
            >
              -1
            </button>

            <span className="font-mono font-black text-base px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-teal-500/40 text-teal-600 dark:text-teal-400 min-w-[64px] text-center shadow-inner">
              {currentKey} {semitoneOffset !== 0 && `(${semitoneOffset > 0 ? '+' : ''}${semitoneOffset})`}
            </span>

            <button
              onClick={() => setSemitoneOffset(prev => prev + 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border border-slate-300 dark:border-slate-600 font-mono font-black text-sm text-slate-900 dark:text-white shadow-xs transition-colors active:scale-95"
              title="Aumentar 1 semitom"
            >
              +1
            </button>

            {semitoneOffset !== 0 && (
              <button
                onClick={() => setSemitoneOffset(0)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                title="Voltar ao tom original da igreja"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Metronome Tool */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMetronome}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs ${
                isMetronomeActive 
                  ? 'bg-amber-500 text-slate-950 font-black' 
                  : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              {isMetronomeActive ? <Square className="w-4 h-4 stroke-[3]" /> : <Play className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
              <span>Metrônomo: {bpm} BPM</span>
            </button>

            {isMetronomeActive && (
              <div className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-black/20">
                {[1, 2, 3, 4].map(b => (
                  <span
                    key={b}
                    className={`w-3 h-3 rounded-full transition-transform ${
                      currentBeat === b 
                        ? (b === 1 ? 'bg-red-500 scale-125' : 'bg-amber-400 scale-110')
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
              <button 
                onClick={() => handleBpmChange(bpm - 2)}
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-600"
                title="Diminuir BPM em 2"
              >
                -2
              </button>
              <button 
                onClick={() => handleBpmChange(bpm + 2)}
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-600"
                title="Aumentar BPM em 2"
              >
                +2
              </button>
            </div>
          </div>

          {/* Prominent Font Resizing Controls with Quick Presets */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mr-1">
              <Type className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Tamanho:</span>
            </span>

            {/* Quick Preset Buttons */}
            <div className="hidden md:flex items-center gap-1 mr-1.5">
              {[
                { label: 'Normal', size: 18 },
                { label: 'Grande', size: 22 },
                { label: 'Púlpito', size: 26 },
                { label: 'Gigante', size: 32 },
              ].map(preset => (
                <button
                  key={preset.size}
                  onClick={() => setFontSize(preset.size)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                    fontSize === preset.size
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              title="Diminuir fonte"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="font-mono text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-400 px-1 min-w-[42px] text-center">
              {fontSize}px
            </span>

            <button
              onClick={() => setFontSize(prev => Math.min(38, prev + 2))}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              title="Aumentar fonte"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Arrangement & Leadership notes banner if present */}
        {song.notes && (
          <div className="px-4 py-2.5 sm:px-6 bg-teal-50 dark:bg-teal-950/40 border-b border-teal-200 dark:border-teal-900/60 text-xs sm:text-sm text-teal-900 dark:text-teal-200 flex items-center justify-between shrink-0 font-medium">
            <span><strong>💡 Arranjo Elohim:</strong> {song.notes}</span>
          </div>
        )}

        {/* Chord Sheet Scroll Area with High-Visibility Formatted Rendering */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white dark:bg-slate-950 font-mono select-text">
          <div 
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
            className="space-y-0.5 tracking-wide max-w-4xl mx-auto"
          >
            {parsedLines.map((line, idx) => {
              if (line.type === 'empty') {
                return <div key={idx} className="h-4" />;
              }

              if (line.type === 'section') {
                return (
                  <div key={idx} className="pt-4 pb-1">
                    <span className="inline-block px-3 py-1 rounded-lg bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-300 font-extrabold uppercase text-[0.85em] tracking-wider shadow-xs">
                      {line.text}
                    </span>
                  </div>
                );
              }

              if (line.type === 'chord') {
                return (
                  <div 
                    key={idx} 
                    className="font-extrabold text-amber-600 dark:text-amber-400 whitespace-pre tracking-wider select-text"
                  >
                    {line.text}
                  </div>
                );
              }

              // Normal lyric line
              return (
                <div 
                  key={idx} 
                  className="font-semibold text-slate-900 dark:text-slate-100 whitespace-pre select-text"
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with External Links */}
        <div className="px-4 py-3 sm:px-6 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm shrink-0">
          <div className="flex items-center gap-4">
            {song.cifraUrl && (
              <a
                href={song.cifraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5 font-bold transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-500" /> Cifra Club
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}

            {song.mediaUrl && (
              <a
                href={song.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 font-bold transition-colors"
              >
                <Youtube className="w-4 h-4 text-red-500" /> YouTube
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}

            {song.spotifyUrl && (
              <a
                href={song.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 font-bold transition-colors"
              >
                <Radio className="w-4 h-4 text-emerald-500" /> Spotify
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl transition-colors shadow-xs"
            >
              Fechar Cifra
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

