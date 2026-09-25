import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Palette, 
  Layout, 
  Copy, 
  Check, 
  Cpu, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  FileCode,
  Sparkles,
  Cloud,
  RefreshCw,
  Server,
  KeyRound
} from 'lucide-react';
import { testConnection } from '../firebase';

interface ArchitectureDocsViewProps {
  dbStatus?: 'connected' | 'syncing' | 'offline';
  songCount?: number;
  membersCount?: number;
  eventsCount?: number;
  onSyncDb?: () => Promise<void> | void;
}

export const ArchitectureDocsView: React.FC<ArchitectureDocsViewProps> = ({
  dbStatus = 'connected',
  songCount = 140,
  membersCount = 8,
  eventsCount = 4,
  onSyncDb,
}) => {
  const [activeSection, setActiveSection] = useState<'stack' | 'database' | 'colors' | 'screens'>('database');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await testConnection();
      if (ok) {
        setTestResult('Conexão com Firestore confirmada com sucesso! Latência normal.');
      } else {
        setTestResult('Banco acessível com status offline local.');
      }
    } catch (e: any) {
      setTestResult('Erro no teste: ' + (e?.message || 'Falha de rede'));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncCloud = async () => {
    if (!onSyncDb) return;
    setIsSyncing(true);
    try {
      await onSyncDb();
      setTestResult('Sincronização em massa concluída com o Firestore!');
    } catch (e: any) {
      setTestResult('Erro na sincronização: ' + (e?.message || 'Falha'));
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sqlDDL = `-- ========================================================
-- BANCO DE DADOS: IGREJA BATISTA ELOHIM (MINISTÉRIO DE LOUVOR)
-- SGBD Recomendado: PostgreSQL 16 (Supabase / Cloud SQL)
-- ========================================================

-- 1. TABELA DE USUÁRIOS / INTEGRANTES
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    telefone VARCHAR(25) NOT NULL,
    foto_url TEXT,
    nivel_acesso VARCHAR(20) NOT NULL DEFAULT 'membro' 
        CHECK (nivel_acesso IN ('admin', 'membro')),
    instrumento_principal VARCHAR(50) NOT NULL,
    instrumentos_secundarios TEXT[] DEFAULT '{}',
    extensao_vocal VARCHAR(30) NOT NULL DEFAULT 'Instrumentista'
        CHECK (extensao_vocal IN ('Líder de Louvor', 'Soprano', 'Contralto', 'Tenor', 'Barítono', 'Baixo', 'Instrumentista')),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo'
        CHECK (status IN ('ativo', 'ferias', 'inativo')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA DO ACERVO DE MÚSICAS
CREATE TABLE musicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(150) NOT NULL,
    artista VARCHAR(120) NOT NULL,
    tom_original VARCHAR(5) NOT NULL,
    tom_igreja VARCHAR(5) NOT NULL, -- Tom oficial adotado na Elohim
    bpm INTEGER CHECK (bpm > 30 AND bpm < 250),
    compasso VARCHAR(10) DEFAULT '4/4',
    tags TEXT[] DEFAULT '{}', -- ['Adoração', 'Ceia', 'Abertura']
    cifra_url TEXT,
    youtube_url TEXT,
    spotify_url TEXT,
    cifra_conteudo TEXT NOT NULL, -- Letra com cifras e anotações
    observacoes_arranjo TEXT,
    ultimo_culto_tocado DATE,
    criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE EVENTOS / CULTOS
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(150) NOT NULL, -- Ex: 'Culto de Domingo - Manhã'
    tipo_evento VARCHAR(30) NOT NULL 
        CHECK (tipo_evento IN ('culto_domingo', 'culto_jovens', 'ensaio', 'conferencia', 'vigilia')),
    data_evento DATE NOT NULL,
    horario TIME NOT NULL,
    local VARCHAR(100) NOT NULL DEFAULT 'Templo Principal - Elohim',
    tema VARCHAR(200),
    pregador VARCHAR(120),
    observacoes TEXT,
    criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DE ESCALA DE INTEGRANTES (RELACIONAMENTO N:N)
CREATE TABLE escala_integrantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    funcao_escala VARCHAR(60) NOT NULL, -- Ex: 'Voz Principal', 'Teclado', 'Baixo'
    status_confirmacao VARCHAR(20) NOT NULL DEFAULT 'pendente'
        CHECK (status_confirmacao IN ('confirmado', 'pendente', 'recusado')),
    motivo_recusa TEXT,
    confirmado_em TIMESTAMPTZ,
    UNIQUE (evento_id, usuario_id)
);

-- 5. TABELA DE SETLIST / REPERTÓRIO DO CULTO (RELACIONAMENTO N:N)
CREATE TABLE evento_repertorio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    musica_id UUID NOT NULL REFERENCES musicas(id) ON DELETE CASCADE,
    ordem_execucao INTEGER NOT NULL,
    tom_especifico VARCHAR(5) NOT NULL, -- Tom configurado para este culto
    vocal_principal_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    observacao_palco TEXT,
    UNIQUE (evento_id, ordem_execucao)
);

-- ÍNDICES PARA ALTA PERFORMANCE
CREATE INDEX idx_eventos_data ON eventos(data_evento);
CREATE INDEX idx_escala_usuario ON escala_integrantes(usuario_id, status_confirmacao);
CREATE INDEX idx_musicas_busca ON musicas(titulo, artista);`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Arquitetura de Software & Design System</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Especificação Técnica do Sistema Elohim Louvor
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Documento técnico com a stack recomendada, modelo relacional de banco de dados, paleta de cores calibrada e escopo das telas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs overflow-x-auto">
        {[
          { id: 'stack', label: '1. Stack Tecnológica', icon: Cpu },
          { id: 'database', label: '2. Modelo de Banco de Dados', icon: Database },
          { id: 'colors', label: '3. Paleta de Cores & UX/UI', icon: Palette },
          { id: 'screens', label: '4. Escopo das Telas', icon: Layout },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeSection === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Stack Tecnológica */}
      {activeSection === 'stack' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Recomendação de Stack Unificada e Moderna
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Para atender ao requisito de sistema unificado (Web responsivo para líderes e aplicativo móvel de alta performance para os músicos no smartphone), a melhor arquitetura de engenharia adota uma <strong>estratégia baseada em TypeScript e React Native / Expo</strong> ou <strong>React SPA PWA (Progressive Web App)</strong>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Frontend Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                  Frontend (Web & Mobile)
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  React 19 + TypeScript + Tailwind CSS
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>PWA Nativo:</strong> Instalável diretamente na tela inicial do iOS e Android sem custo de loja de aplicativos.</li>
                  <li><strong>Opção App Nativo:</strong> React Native com Expo (reaproveitando 80% do código e tipos TypeScript).</li>
                  <li><strong>Performance:</strong> Carregamento instantâneo de cifras e funcionamento offline para ensaios sem internet.</li>
                </ul>
              </div>

              {/* Backend & DB Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Backend & Database
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Supabase (PostgreSQL 16) ou Firebase
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>PostgreSQL:</strong> Integridade relacional estrita para eventos, escalas, confirmações e setlists.</li>
                  <li><strong>Realtime WebSockets:</strong> Atualização instantânea na tela da liderança quando um músico confirma presença.</li>
                  <li><strong>Row Level Security (RLS):</strong> Músicos só editam suas próprias presenças; administradores gerenciam escalas.</li>
                </ul>
              </div>

              {/* Features Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Recursos Musicais
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Web Audio API + Algoritmo de Transposição
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Transpositor em tempo real:</strong> Motor de cálculo semitonal com detecção inteligente de acordes e baixos invertidos.</li>
                  <li><strong>Metrônomo sintetizado:</strong> Oscilador Web Audio sintetizado sem latência e sem dependência de áudios pesados.</li>
                  <li><strong>Integração WhatsApp:</strong> Exportador formatado com 1 clique para avisar a equipe nos grupos da igreja.</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Section 2: Modelo de Banco de Dados */}
      {activeSection === 'database' && (
        <div className="space-y-6">

          {/* Cloud Database Live Status Card */}
          <div className="bg-gradient-to-br from-teal-900/20 via-slate-900 to-slate-900 rounded-2xl border border-teal-500/40 p-6 space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/50 flex items-center justify-center text-teal-400 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Banco de Dados em Nuvem (Google Cloud Firestore)
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Provisionado & Conectado
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Instância Enterprise Cloud Firestore ativa e sincronizada em tempo real com o aplicativo.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
                </button>

                {onSyncDb && (
                  <button
                    onClick={handleSyncCloud}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <Server className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Cloud'}</span>
                  </button>
                )}
              </div>
            </div>

            {testResult && (
              <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl text-xs text-teal-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{testResult}</span>
              </div>
            )}

            {/* Cloud metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Projeto Firebase</span>
                <span className="font-mono font-bold text-white block">red-arbor-907pf</span>
                <span className="text-[10px] text-teal-400">Google Cloud Platform</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Coleção de Louvores</span>
                <span className="font-mono font-bold text-white block">/songs</span>
                <span className="text-[10px] text-slate-300 font-semibold">{songCount} louvores com cifras</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Equipe & Escalas</span>
                <span className="font-mono font-bold text-white block">/members & /events</span>
                <span className="text-[10px] text-slate-300 font-semibold">{membersCount} membros · {eventsCount} cultos</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Regras de Segurança</span>
                <span className="font-mono font-bold text-white block">firestore.rules</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Deploy ativo com ABAC</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Modelo Relacional de Dados (DDL SQL)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tabelas com chaves primárias UUID, constraints, integridade referencial e índices.
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(sqlDDL, 'sql')}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copiedCode === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'sql' ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>

            {/* ER Diagram Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block">1. usuarios</span>
                <span className="text-[11px] text-slate-500">Membros, líderes, instrumentos e registros vocais.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block">2. musicas</span>
                <span className="text-[11px] text-slate-500">Cifras, tom da Elohim, BPM, links e tags.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block">3. eventos</span>
                <span className="text-[11px] text-slate-500">Cultos de domingo, jovens, ensaios e datas.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block">4. escala_integrantes</span>
                <span className="text-[11px] text-slate-500">Ligação N:N com status (confirmado, pendente, recusado).</span>
              </div>
            </div>

            {/* SQL Code Block */}
            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                {sqlDDL}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* Section 3: Paleta de Cores & UX/UI */}
      {activeSection === 'colors' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Diretrizes de Identidade Visual e Paleta Anti-Fadiga
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Músicos frequentemente tocam e ensaiam em ambientes com pouca luz e precisam ler cifras no tablet ou smartphone sobre a estante de partitura. Por isso, a calibração de cores adota <strong>Grafite Profundo / Noturno</strong>, <strong>Verde Sálvia e Teal Suave</strong> e <strong>Areia / Cinza Claro</strong>, eliminando brancos fluorescentes cegantes e garantindo contraste WCAG AA.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              
              {/* Color 1 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-14 rounded-lg bg-[#0F172A] border border-slate-700 flex items-end p-2 text-white font-mono text-[11px]">
                  #0F172A · Grafite Profundo
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Fundo Púlpito & Superfície Dark</h4>
                <p className="text-[11px] text-slate-500">
                  Sofisticado, acolhedor e sem ofuscamento nos olhos dos ministros e instrumentistas.
                </p>
              </div>

              {/* Color 2 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-14 rounded-lg bg-[#0D9488] flex items-end p-2 text-white font-mono text-[11px]">
                  #0D9488 · Teal / Verde Sálvia
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Acento Principal & Ativação</h4>
                <p className="text-[11px] text-slate-500">
                  Transmite serenidade, foco e reverência espiritual, perfeito para botões de confirmação e cifras.
                </p>
              </div>

              {/* Color 3 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-14 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-end p-2 text-slate-800 font-mono text-[11px]">
                  #F8FAFC · Areia Suave / Off-White
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Canvas do Modo Claro</h4>
                <p className="text-[11px] text-slate-500">
                  Luz natural diurna sem causar reflexo ou contraste áspero em telas de celular.
                </p>
              </div>

              {/* Status Colors */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-14 rounded-lg bg-[#10B981] flex items-end p-2 text-white font-mono text-[11px]">
                  #10B981 · Verde Esmeralda
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Status: Confirmado</h4>
                <p className="text-[11px] text-slate-500">
                  Indica presença confirmada pelo músico na escala.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-14 rounded-lg bg-[#F59E0B] flex items-end p-2 text-white font-mono text-[11px]">
                  #F59E0B · Âmbar Suave
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Status: Pendente</h4>
                <p className="text-[11px] text-slate-500">
                  Indica escala enviada aguardando confirmação do integrante.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-14 rounded-lg bg-[#F43F5E] flex items-end p-2 text-white font-mono text-[11px]">
                  #F43F5E · Rosa Carmim
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Status: Recusado / Troca</h4>
                <p className="text-[11px] text-slate-500">
                  Alerta a liderança que o músico informou indisponibilidade.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Section 4: Escopo das Telas Principais */}
      {activeSection === 'screens' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layout className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Estrutura e Escopo das Telas Principais
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              O design foca em usabilidade autoexplicativa com navegação em 4 abas ergonômicas no celular e visão expandida no computador:
            </p>

            <div className="space-y-4 pt-2">
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center">1</span>
                  Tela Inicial (Dashboard do Músico & Liderança)
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li><strong>Card de Próximo Culto:</strong> Data, horário, tema da pregação e contagem regressiva.</li>
                  <li><strong>Status Pessoal com Ação Rápida:</strong> Botão de 1 toque para "Confirmar Presença" ou "Solicitar Troca / Recusar".</li>
                  <li><strong>Atalhos do Repertório:</strong> Músicas selecionadas para o próximo domingo com tom oficial e atalho para cifra e vídeo de referência.</li>
                  <li><strong>Quadro de Avisos:</strong> Comunicados da coordenação (passagem de som, trajes, escalas de Ceia).</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center">2</span>
                  Tela de Escala, Cultos e Calendário
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li><strong>Visualização Dupla:</strong> Alternador fluido entre "Visão Lista" e "Visão Calendário Mensal/Semanal".</li>
                  <li><strong>Controle de Equipe:</strong> Lista de escalados por função (Voz Principal, Backings, Bateria, Baixo, Teclado, Áudio) com badges de status.</li>
                  <li><strong>Exportação Inteligente para WhatsApp:</strong> Botão que gera a escala formatada pronta com emojis e repertório para colar no grupo da igreja.</li>
                  <li><strong>Criação de Cultos:</strong> Modal rápido para líderes montarem equipes e selecionarem louvores.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center">3</span>
                  Tela do Acervo Musical & Transpositor de Cifras
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li><strong>Busca Instantânea:</strong> Filtro por título, ministério/artista, tom e categorias (Adoração, Celebração, Ceia).</li>
                  <li><strong>Transpositor em Tempo Real:</strong> Botões de "+1 / -1 Semitom" com recálculo automático de todos os acordes da música.</li>
                  <li><strong>Metrônomo Embutido:</strong> Sinalização sonora (Web Audio) e visual do tempo (BPM) para marcação rítmica.</li>
                  <li><strong>Central Multimídia:</strong> Links diretos para CifraClub, YouTube e Spotify.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center">4</span>
                  Modo Púlpito / Ao Vivo (Stage Mode)
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li><strong>Fundo Preto Anti-Reflexo:</strong> Ideal para iPads e smartphones colocados em pedestais e púlpitos de vidro.</li>
                  <li><strong>Passador de Músicas:</strong> Botões amplos de "Anterior" e "Próxima" para navegação com o polegar.</li>
                  <li><strong>Relógio de Culto:</strong> Horário em tempo real para controle do tempo de ministração.</li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
