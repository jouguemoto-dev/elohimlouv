import React from 'react';
import { 
  Calendar, 
  Music, 
  Users, 
  LayoutDashboard, 
  Mic2, 
  Code2, 
  Sun, 
  Moon, 
  Smartphone, 
  Monitor, 
  UserCheck,
  Database,
  CloudCheck,
  Type
} from 'lucide-react';
import { Member } from '../types';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: Member;
  allMembers: Member[];
  onSwitchUser: (member: Member) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobileDeviceSimulated: boolean;
  onToggleDeviceSimulated: () => void;
  dbStatus?: 'connected' | 'syncing' | 'offline';
  onSyncDb?: () => void;
  isLeanMode: boolean;
  onToggleLeanMode: () => void;
  fontScale: 'normal' | 'large' | 'extra';
  onChangeFontScale: (scale: 'normal' | 'large' | 'extra') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  allMembers,
  onSwitchUser,
  isDarkMode,
  onToggleDarkMode,
  isMobileDeviceSimulated,
  onToggleDeviceSimulated,
  dbStatus = 'connected',
  onSyncDb,
  isLeanMode,
  onToggleLeanMode,
  fontScale,
  onChangeFontScale,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single Brand element */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onTabChange('dashboard')} 
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                  Elohim Louvor
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block leading-none mt-0.5">
                  {isLeanMode ? 'Portal do Integrante' : 'Igreja Batista Elohim'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{isLeanMode ? 'Minha Escala' : 'Início'}</span>
            </button>

            <button
              onClick={() => onTabChange('schedule')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'schedule'
                  ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isLeanMode ? 'Todas as Escalas' : 'Escalas & Cultos'}</span>
            </button>

            <button
              onClick={() => onTabChange('songs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'songs'
                  ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>{isLeanMode ? 'Repertório & Cifras' : 'Acervo Musical'}</span>
            </button>

            <button
              onClick={() => onTabChange('stage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'stage'
                  ? 'bg-teal-900/20 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5 text-teal-500" />
              <span>Modo Púlpito</span>
            </button>

            {/* Admin only views: Equipe and Cloud Database */}
            {!isLeanMode && (
              <>
                <button
                  onClick={() => onTabChange('members')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    currentTab === 'members'
                      ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Integrantes</span>
                </button>

                <button
                  onClick={() => onTabChange('architecture')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    currentTab === 'architecture'
                      ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-teal-500" />
                  <span>Banco de Dados</span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Toggle Lean / Admin Mode Pill */}
            <button
              onClick={onToggleLeanMode}
              title={isLeanMode ? "Alternar para Modo Liderança / Completo" : "Alternar para Versão Enxuta do Integrante"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 ${
                isLeanMode 
                  ? 'bg-teal-500 text-slate-950 hover:bg-teal-400 ring-2 ring-teal-400/40' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
              }`}
            >
              {isLeanMode ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-950 inline-block" />
                  <span className="text-[11px]">Versão Enxuta</span>
                </>
              ) : (
                <>
                  <span className="text-[11px]">Painel Liderança</span>
                </>
              )}
            </button>

            {/* Cloud Firestore Status Badge (Visible in leadership mode or click to view) */}
            {!isLeanMode && (
              <button
                onClick={() => onTabChange('architecture')}
                title={`Banco Firestore ${dbStatus === 'connected' ? 'Conectado (red-arbor-907pf)' : dbStatus === 'syncing' ? 'Sincronizando...' : 'Offline'}`}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/70 text-xs text-teal-700 dark:text-teal-300 transition-colors hover:bg-teal-100/60 dark:hover:bg-teal-900/50"
              >
                <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : dbStatus === 'syncing' ? 'bg-amber-500 animate-spin' : 'bg-rose-500'}`} />
                <span className="font-semibold text-[11px]">Firestore Nuvem</span>
              </button>
            )}
            
            {/* User Switcher Persona */}
            <div className="relative group">
              <label htmlFor="user-select" className="sr-only">Trocar Usuário</label>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <select
                  id="user-select"
                  value={currentUser.id}
                  onChange={(e) => {
                    const selected = allMembers.find(m => m.id === e.target.value);
                    if (selected) onSwitchUser(selected);
                  }}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] truncate"
                  title="Simular visualização de usuário"
                >
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {m.name} ({m.role === 'admin' ? 'Líder/Admin' : m.primaryInstrument})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Device Frame Simulation Toggle */}
            <button
              onClick={onToggleDeviceSimulated}
              title={isMobileDeviceSimulated ? "Modo Tela Cheia" : "Simular Smartphone (App Mobile)"}
              className={`p-2 rounded-lg text-xs font-medium transition-colors hidden sm:flex items-center gap-1 ${
                isMobileDeviceSimulated
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isMobileDeviceSimulated ? (
                <>
                  <Monitor className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Web Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Visão Mobile</span>
                </>
              )}
            </button>

            {/* Global Font Scale Toggle (A / A+ / A++) */}
            <button
              onClick={() => {
                if (fontScale === 'normal') onChangeFontScale('large');
                else if (fontScale === 'large') onChangeFontScale('extra');
                else onChangeFontScale('normal');
              }}
              title={`Tamanho da Letra: ${fontScale === 'normal' ? 'Normal (Padrão 16px)' : fontScale === 'large' ? 'Grande (18px, +15%)' : 'Extra Grande (20px, +30%)'} - Clique para ampliar`}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border active:scale-95 shadow-2xs ${
                fontScale !== 'normal'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
              aria-label="Alternar tamanho da letra"
            >
              <Type className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="font-mono text-xs">
                {fontScale === 'normal' ? 'A' : fontScale === 'large' ? 'A+' : 'A++'}
              </span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro (Ensaio/Noturno)"}
              aria-label="Alternar tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
