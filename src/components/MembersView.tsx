import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  ShieldCheck, 
  User, 
  Music2, 
  Mic2, 
  Mail, 
  Phone, 
  Edit3, 
  Trash2, 
  Search,
  Filter
} from 'lucide-react';
import { Member, VocalRange } from '../types';

interface MembersViewProps {
  members: Member[];
  currentUser: Member;
  onSaveMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  currentUser,
  onSaveMember,
  onDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVocal, setFilterVocal] = useState<string>('all');
  const [filterInstrument, setFilterInstrument] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Unique instruments
  const allInstruments = Array.from(new Set(members.map(m => m.primaryInstrument)));

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.primaryInstrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vocalRange.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVocal = filterVocal === 'all' || m.vocalRange === filterVocal;
    const matchesInst = filterInstrument === 'all' || m.primaryInstrument === filterInstrument;

    return matchesSearch && matchesVocal && matchesInst;
  });

  const handleOpenNewMember = () => {
    const newMember: Member = {
      id: 'm_' + Date.now(),
      name: '',
      email: '',
      phone: '',
      role: 'member',
      initials: 'ML',
      primaryInstrument: 'Violão',
      secondaryInstruments: [],
      vocalRange: 'Contralto',
      status: 'active',
      joinedYear: new Date().getFullYear(),
    };
    setEditingMember(newMember);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(JSON.parse(JSON.stringify(member)));
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      // derive initials
      const parts = editingMember.name.trim().split(' ');
      const initials = parts.length > 1 
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : (editingMember.name.slice(0, 2)).toUpperCase();

      onSaveMember({ ...editingMember, initials });
      setIsModalOpen(false);
      setEditingMember(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestão de Integrantes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Músicos, cantores, sonoplastas e líderes do Ministério de Louvor Elohim.
          </p>
        </div>

        <button
          onClick={handleOpenNewMember}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Integrante</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar integrante por nome, instrumento ou vocal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterVocal}
              onChange={(e) => setFilterVocal(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todas as Vozes</option>
              <option value="Líder de Louvor">Líder de Louvor</option>
              <option value="Soprano">Soprano</option>
              <option value="Contralto">Contralto</option>
              <option value="Tenor">Tenor</option>
              <option value="Barítono">Barítono</option>
              <option value="Baixo">Baixo</option>
              <option value="Instrumentista">Instrumentista</option>
            </select>

            <select
              value={filterInstrument}
              onChange={(e) => setFilterInstrument(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos os Instrumentos</option>
              {allInstruments.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs transition-colors space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Avatar and Role */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center border border-slate-200 dark:border-slate-600 shrink-0">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs mt-0.5">
                      {member.role === 'admin' ? (
                        <span className="text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Administrador / Líder
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          Músico / Vocal
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditMember(member)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Editar integrante"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja remover "${member.name}" do ministério?`)) {
                        onDeleteMember(member.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Excluir integrante"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Musical Capabilities */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Music2 className="w-3.5 h-3.5" /> Principal:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {member.primaryInstrument}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Mic2 className="w-3.5 h-3.5" /> Vocal / Timbre:
                  </span>
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    {member.vocalRange}
                  </span>
                </div>

                {member.secondaryInstruments.length > 0 && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">Secundários:</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {member.secondaryInstruments.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {member.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {member.phone}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Modal: New / Edit Member */}
      {isModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {members.some(m => m.id === editingMember.id) ? 'Editar Integrante' : 'Novo Integrante'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  placeholder="Ex: Gabriel Santos"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail:
                  </label>
                  <input
                    type="email"
                    required
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    placeholder="gabriel@elohimbatista.org.br"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp / Telefone:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instrumento Principal:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.primaryInstrument}
                    onChange={(e) => setEditingMember({ ...editingMember, primaryInstrument: e.target.value })}
                    placeholder="Ex: Teclado, Bateria, Violão"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Voz / Extensão Vocal:
                  </label>
                  <select
                    value={editingMember.vocalRange}
                    onChange={(e) => setEditingMember({ ...editingMember, vocalRange: e.target.value as VocalRange })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Líder de Louvor">Líder de Louvor</option>
                    <option value="Soprano">Soprano</option>
                    <option value="Contralto">Contralto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Barítono">Barítono</option>
                    <option value="Baixo">Baixo</option>
                    <option value="Instrumentista">Instrumentista</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nível de Acesso:
                  </label>
                  <select
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="member">Usuário Comum (Músico / Vocal)</option>
                    <option value="admin">Administrador (Líder do Ministério)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instrumentos Secundários:
                  </label>
                  <input
                    type="text"
                    value={editingMember.secondaryInstruments.join(', ')}
                    onChange={(e) => setEditingMember({ ...editingMember, secondaryInstruments: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="Ex: Violão, Teclado"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
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
                  Salvar Integrante
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
