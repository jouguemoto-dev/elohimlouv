import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Music, 
  FileText, 
  Youtube, 
  ExternalLink, 
  Tag, 
  SlidersHorizontal,
  Clock,
  Sparkles,
  Edit2,
  Trash2
} from 'lucide-react';
import { Song, Member } from '../types';

interface SongLibraryViewProps {
  songs: Song[];
  currentUser: Member;
  onOpenSongModal: (song: Song) => void;
  onSaveSong: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
  isLeanMode?: boolean;
}

export const SongLibraryView: React.FC<SongLibraryViewProps> = ({
  songs,
  currentUser,
  onOpenSongModal,
  onSaveSong,
  onDeleteSong,
  isLeanMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedKey, setSelectedKey] = useState<string>('all');

  // Modal State
  const [isNewSongModalOpen, setIsNewSongModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Available unique tags and keys
  const allTags = Array.from(new Set(songs.flatMap(s => s.tags)));
  const allKeys = Array.from(new Set(songs.map(s => s.churchKey))).sort();

  // Filtered songs
  const filteredSongs = songs.filter(s => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = selectedTag === 'all' || s.tags.includes(selectedTag);
    const matchesKey = selectedKey === 'all' || s.churchKey === selectedKey;

    return matchesSearch && matchesTag && matchesKey;
  });

  const handleOpenNewSong = () => {
    const newSong: Song = {
      id: 's_' + Date.now(),
      title: '',
      artist: '',
      originalKey: 'G',
      churchKey: 'G',
      tempoBpm: 72,
      timeSignature: '4/4',
      tags: ['Adoração'],
      cifraUrl: '',
      mediaUrl: '',
      notes: '',
      chords: `[Intro: G  C  G  C]

[Verso 1]
G                 C
 Digite aqui os acordes e a letra do louvor...
`
    };
    setEditingSong(newSong);
    setIsNewSongModalOpen(true);
  };

  const handleEditSong = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSong(JSON.parse(JSON.stringify(song)));
    setIsNewSongModalOpen(true);
  };

  const handleDeleteSong = (songId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Deseja remover a música "${title}" do acervo?`)) {
      onDeleteSong(songId);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSong) {
      onSaveSong(editingSong);
      setIsNewSongModalOpen(false);
      setEditingSong(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header & New Song CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Acervo Musical & Cifras
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Repertório oficial da Igreja Batista Elohim com tons padrão, cifras e transpositor integrado.
          </p>
        </div>

        {!isLeanMode && currentUser.role === 'admin' ? (
          <button
            onClick={handleOpenNewSong}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Música</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl text-teal-800 dark:text-teal-300 text-xs font-semibold self-start sm:self-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Modo Consulta & Estudo ({songs.length} louvores)</span>
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-xs space-y-3 transition-colors">
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, artista ou tag (ex: Isaías Saad, Ceia, Adoração)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Key Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0 font-medium">Tom:</span>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono"
            >
              <option value="all">Todos os Tons</option>
              {allKeys.map(k => (
                <option key={k} value={k}>Tom {k}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedTag === 'all'
                ? 'bg-slate-900 dark:bg-teal-950 text-white dark:text-teal-300 border border-transparent dark:border-teal-700/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todas as Categorias
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-slate-900 dark:bg-teal-950 text-white dark:text-teal-300 border border-transparent dark:border-teal-700/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>

      {/* Counter bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Mostrando <strong className="text-slate-900 dark:text-white font-semibold">{filteredSongs.length}</strong> de {songs.length} louvores no acervo
        </span>
        {(searchTerm || selectedTag !== 'all' || selectedKey !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTag('all');
              setSelectedKey('all');
            }}
            className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Songs Grid */}
      {filteredSongs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Nenhuma música encontrada para os filtros selecionados.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTag('all');
              setSelectedKey('all');
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-500 transition-colors"
          >
            Redefinir Pesquisa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
          <div
            key={song.id}
            onClick={() => onOpenSongModal(song)}
            className="group bg-white dark:bg-slate-800/80 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 border border-slate-200 dark:border-slate-700/80 hover:border-teal-400 dark:hover:border-teal-600 rounded-2xl p-4 shadow-xs cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top row: Keys and BPM */}
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 shadow-2xs">
                    Tom: {song.churchKey}
                  </span>
                  {song.originalKey !== song.churchKey && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono">
                      (Orig: {song.originalKey})
                    </span>
                  )}
                </div>

                <span className="text-slate-600 dark:text-slate-300 font-mono text-xs sm:text-sm font-bold">
                  {song.tempoBpm} BPM · {song.timeSignature}
                </span>
              </div>

              {/* Title & Artist */}
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-tight">
                {song.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                {song.artist}
              </p>

              {/* Tags */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-3">
                {song.tags.map((t, idx) => (
                  <React.Fragment key={t}>
                    <span>{t}</span>
                    {idx < song.tags.length - 1 && <span aria-hidden="true" className="opacity-60">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Bottom Row: Actions & Links */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-teal-600 dark:text-teal-400 font-black group-hover:underline flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-500" /> Abrir Cifra & Transpor
              </span>

              <div className="flex items-center gap-1">
                {song.mediaUrl && (
                  <a
                    href={song.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                    title="Vídeo no YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                )}
                {!isLeanMode && currentUser.role === 'admin' && (
                  <>
                    <button
                      onClick={(e) => handleEditSong(song, e)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                      title="Editar música"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSong(song.id, song.title, e)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      title="Excluir música"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
      )}

      {/* Modal: New / Edit Song */}
      {isNewSongModalOpen && editingSong && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {songs.some(s => s.id === editingSong.id) ? 'Editar Louvor' : 'Cadastrar Novo Louvor'}
              </h3>
              <button
                onClick={() => setIsNewSongModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Título da Música:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSong.title}
                    onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
                    placeholder="Ex: Bondade de Deus"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Artista / Ministério:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSong.artist}
                    onChange={(e) => setEditingSong({ ...editingSong, artist: e.target.value })}
                    placeholder="Ex: Isaías Saad"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tom Original:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSong.originalKey}
                    onChange={(e) => setEditingSong({ ...editingSong, originalKey: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tom da Elohim:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSong.churchKey}
                    onChange={(e) => setEditingSong({ ...editingSong, churchKey: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BPM:
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={editingSong.tempoBpm}
                    onChange={(e) => setEditingSong({ ...editingSong, tempoBpm: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Compasso:
                  </label>
                  <input
                    type="text"
                    value={editingSong.timeSignature}
                    onChange={(e) => setEditingSong({ ...editingSong, timeSignature: e.target.value })}
                    placeholder="4/4"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags / Categorias (separadas por vírgula):
                </label>
                <input
                  type="text"
                  value={editingSong.tags.join(', ')}
                  onChange={(e) => setEditingSong({ ...editingSong, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Adoração, Celebração, Ceia, Gratidão"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link do YouTube:
                  </label>
                  <input
                    type="url"
                    value={editingSong.mediaUrl || ''}
                    onChange={(e) => setEditingSong({ ...editingSong, mediaUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link da Cifra (CifraClub / PDF):
                  </label>
                  <input
                    type="url"
                    value={editingSong.cifraUrl || ''}
                    onChange={(e) => setEditingSong({ ...editingSong, cifraUrl: e.target.value })}
                    placeholder="https://cifraclub.com.br/..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações de Arranjo / Dinâmica:
                </label>
                <input
                  type="text"
                  value={editingSong.notes || ''}
                  onChange={(e) => setEditingSong({ ...editingSong, notes: e.target.value })}
                  placeholder="Ex: Começa suave no violão; solo na ponte; final acapella"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Letra com Cifras (Formato Texto):
                </label>
                <textarea
                  rows={8}
                  required
                  value={editingSong.chords}
                  onChange={(e) => setEditingSong({ ...editingSong, chords: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="[Intro: G C]&#10;G                C&#10;Te amo Deus, Tua graça nunca falha..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsNewSongModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-xs"
                >
                  Salvar Música
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
