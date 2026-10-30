/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sun, 
  Moon, 
  FileText, 
  Zap,
  BarChart3,
  GitBranch,
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';
import { MetricasAnalise } from '../types/leanRoot';

export type PaginaSPA = 'dashboard' | 'investigacao' | 'matriz-acoes' | 'exportacoes';

interface TopBarProps {
  tema: 'dark' | 'light';
  onAlternarTema: () => void;
  metricas: MetricasAnalise;
  paginaAtiva: PaginaSPA;
  onNavegarPagina: (pagina: PaginaSPA) => void;
  onAbrirAta: () => void;
  onAbrirNovoProblema: () => void;
  onAbrirCapturaRapida: () => void;
  temProblemaSelecionado: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  tema,
  onAlternarTema,
  metricas,
  paginaAtiva,
  onNavegarPagina,
  onAbrirAta,
  onAbrirNovoProblema,
  onAbrirCapturaRapida,
  temProblemaSelecionado,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-[#080C13]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => onNavegarPagina('dashboard')}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-amber-400 dark:bg-[#121824] dark:text-amber-400 font-mono font-bold tracking-wider border border-slate-700/60 dark:border-amber-400/30 shadow-[0_0_12px_rgba(250,204,21,0.2)] cursor-pointer"
          >
            LR
          </div>
          <div 
            onClick={() => onNavegarPagina('dashboard')}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                LeanRoot
              </span>
              <span className="hidden text-xs font-mono text-amber-500/90 dark:text-amber-400/80 sm:inline">
                / RCA Studio
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Engenharia · 6M · 5 Porquês · 5W2H
            </p>
          </div>
        </div>

        {/* SPA Main Navigation Bar */}
        <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-[#111722]/90 border border-slate-200/80 dark:border-slate-800">
          
          <button
            onClick={() => onNavegarPagina('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              paginaAtiva === 'dashboard'
                ? 'bg-white text-slate-950 dark:bg-[#182030] dark:text-amber-400 shadow-xs border border-slate-200/60 dark:border-amber-400/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cockpit Executivo</span>
            <span className="md:hidden">Cockpit</span>
          </button>

          <button
            onClick={() => onNavegarPagina('investigacao')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              paginaAtiva === 'investigacao'
                ? 'bg-white text-slate-950 dark:bg-[#182030] dark:text-amber-400 shadow-xs border border-slate-200/60 dark:border-amber-400/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mesa Técnica (6M / 5P)</span>
            <span className="md:hidden">Mesa 6M</span>
          </button>

          <button
            onClick={() => onNavegarPagina('matriz-acoes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              paginaAtiva === 'matriz-acoes'
                ? 'bg-white text-slate-950 dark:bg-[#182030] dark:text-amber-400 shadow-xs border border-slate-200/60 dark:border-amber-400/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Matriz 5W2H Fabril</span>
            <span className="md:hidden">5W2H</span>
          </button>

          <button
            onClick={() => onNavegarPagina('exportacoes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              paginaAtiva === 'exportacoes'
                ? 'bg-white text-slate-950 dark:bg-[#182030] dark:text-amber-400 shadow-xs border border-slate-200/60 dark:border-amber-400/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Central de Exportações</span>
            <span className="md:hidden">Exportar</span>
          </button>

        </nav>

        {/* Primary Actions Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onAlternarTema}
            aria-label="Alternar tema de contraste"
            title={tema === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro Carbon'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/60 dark:bg-[#121824]/60 dark:text-slate-300 dark:hover:bg-[#182030] dark:hover:text-amber-300 transition-colors"
          >
            {tema === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Quick Capture Global Trigger Button in Safety Yellow */}
          <button
            onClick={onAbrirCapturaRapida}
            title="Captura Rápida de Anomalia no Chão de Fábrica (Atalho: Alt+N)"
            className="btn-safety-yellow flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">Captura</span>
            <kbd className="hidden lg:inline-block bg-slate-950/20 text-slate-950 px-1 py-0.2 rounded text-[10px] font-mono font-bold">
              Alt+N
            </kbd>
          </button>

          {/* Primary New Problem Button */}
          <button
            onClick={onAbrirNovoProblema}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-700/80 dark:bg-[#161F2E] dark:text-slate-100 dark:hover:bg-[#1E293B] dark:hover:border-amber-400/40 px-3.5 py-2 text-xs font-bold transition-all shadow-xs"
          >
            <span className="text-amber-400 font-bold">+</span>
            <span className="hidden sm:inline">Nova Ocorrência</span>
            <span className="sm:hidden">Nova</span>
          </button>
        </div>

      </div>
    </header>
  );
};
