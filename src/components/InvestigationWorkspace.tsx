/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  CheckSquare, 
  MessageSquare, 
  FileText, 
  Sparkles,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ProblemaOperacional, 
  Causa6M, 
  CauseStatus, 
  No5Porques, 
  ItemPlanoAcao, 
  MensagemSocratica 
} from '../types/leanRoot';
import { ProblemHeader } from './ProblemHeader';
import { IshikawaVisualizer } from './IshikawaVisualizer';
import { FiveWhysCascade } from './FiveWhysCascade';
import { ActionPlanTable } from './ActionPlanTable';
import { SocraticFacilitator } from './SocraticFacilitator';
import { exportarAtaTecnicaCompletaExcel, exportarAtaTecnicaCompletaPdf } from '../services/technicalExportService';

interface InvestigationWorkspaceProps {
  problema: ProblemaOperacional;
  onAtualizarStatusProblema: (novoStatus: any) => void;
  onEditarDetalhes: () => void;
  onAbrirAta: () => void;
  onNavegarParaExportacoes: () => void;
  
  // Ishikawa Handlers
  onAdicionarCausa: (causa: Omit<Causa6M, 'id' | 'dataCriacao'>) => void;
  onAtualizarStatusCausa: (causaId: string, novoStatus: CauseStatus, evidencia?: string) => void;
  onExcluirCausa: (causaId: string) => void;
  onIniciar5Porques: (causa: Causa6M) => void;

  // 5 Porquês Handlers
  cadeiaAtivaId?: string;
  onSelecionarCadeia: (id: string) => void;
  onAdicionarPasso: (cadeiaId: string, pergunta: string, resposta: string, evidencia: string) => void;
  onAtualizarPasso: (cadeiaId: string, passoId: string, campos: Partial<No5Porques>) => void;
  onExcluirPasso: (cadeiaId: string, passoId: string) => void;
  onMarcarCausaRaiz: (cadeiaId: string, passoId: string, isRaiz: boolean) => void;
  onIrParaPlanoAcao: (causaTexto: string) => void;

  // 5W2H Handlers
  onAdicionarAcao: (acao: Omit<ItemPlanoAcao, 'id'>) => void;
  onAtualizarAcao: (id: string, campos: Partial<ItemPlanoAcao>) => void;
  onExcluirAcao: (id: string) => void;
  causaSugeridaTexto?: string;

  // Diálogo Socrático
  onAdicionarMensagemChat: (msg: Omit<MensagemSocratica, 'id' | 'timestamp'>) => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  problema,
  onAtualizarStatusProblema,
  onEditarDetalhes,
  onAbrirAta,
  onNavegarParaExportacoes,
  onAdicionarCausa,
  onAtualizarStatusCausa,
  onExcluirCausa,
  onIniciar5Porques,
  cadeiaAtivaId,
  onSelecionarCadeia,
  onAdicionarPasso,
  onAtualizarPasso,
  onExcluirPasso,
  onMarcarCausaRaiz,
  onIrParaPlanoAcao,
  onAdicionarAcao,
  onAtualizarAcao,
  onExcluirAcao,
  causaSugeridaTexto,
  onAdicionarMensagemChat,
}) => {
  const [subAba, setSubAba] = useState<'ishikawa' | 'porques' | 'acoes' | 'socatico'>('ishikawa');

  const temCausaRaiz = problema.cadeias5Porques.some(c => c.passos.some(p => p.isCausaRaiz));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      
      {/* 1. Problem Header Information */}
      <ProblemHeader
        problema={problema}
        onAtualizarStatus={onAtualizarStatusProblema}
        onEditarDetalhes={onEditarDetalhes}
      />

      {/* 2. Focused Workspace Area */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Navigation Cockpit Sub-Tabs & Export Actions in ZeBeyond Industrial Style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          
          {/* Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            {/* Tab: Ishikawa 6M */}
            <button
              onClick={() => setSubAba('ishikawa')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subAba === 'ishikawa'
                  ? 'bg-slate-900 text-amber-400 dark:bg-[#141C29] dark:text-amber-400 border border-slate-700/80 dark:border-amber-400/40 shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-[#121824] dark:hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Diagrama de Ishikawa (6M)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                subAba === 'ishikawa' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {problema.causas6M.length}
              </span>
            </button>

            {/* Tab: 5 Porquês */}
            <button
              onClick={() => setSubAba('porques')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subAba === 'porques'
                  ? 'bg-slate-900 text-amber-400 dark:bg-[#141C29] dark:text-amber-400 border border-slate-700/80 dark:border-amber-400/40 shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-[#121824] dark:hover:text-slate-200'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>Árvore dos 5 Porquês</span>
              {temCausaRaiz && (
                <span className="flex h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" title="Causa-Raiz confirmada" />
              )}
            </button>

            {/* Tab: Plano 5W2H */}
            <button
              onClick={() => setSubAba('acoes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subAba === 'acoes'
                  ? 'bg-slate-900 text-amber-400 dark:bg-[#141C29] dark:text-amber-400 border border-slate-700/80 dark:border-amber-400/40 shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-[#121824] dark:hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Plano de Ação 5W2H</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                subAba === 'acoes' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {problema.acoes.length}
              </span>
            </button>

            {/* Tab: Facilitador Socrático */}
            <button
              onClick={() => setSubAba('socatico')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subAba === 'socatico'
                  ? 'bg-slate-900 text-amber-400 dark:bg-[#141C29] dark:text-amber-400 border border-slate-700/80 dark:border-amber-400/40 shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-[#121824] dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Facilitador Virtual</span>
            </button>

          </div>

          {/* Quick Technical Dossier Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNavegarParaExportacoes}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Central de Exportações</span>
            </button>

            <button
              onClick={() => exportarAtaTecnicaCompletaPdf(problema)}
              title="Baixar Ata Técnica Completa em PDF"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141C29] px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dossiê 8D</span>
            </button>
          </div>

        </div>

        {/* 3. Sub-Tab Content Rendering */}
        {subAba === 'ishikawa' && (
          <IshikawaVisualizer
            problema={problema}
            onAdicionarCausa={onAdicionarCausa}
            onAtualizarStatusCausa={onAtualizarStatusCausa}
            onExcluirCausa={onExcluirCausa}
            onIniciar5Porques={(causa) => {
              onIniciar5Porques(causa);
              setSubAba('porques');
            }}
          />
        )}

        {subAba === 'porques' && (
          <FiveWhysCascade
            problema={problema}
            cadeiaAtivaId={cadeiaAtivaId}
            onSelecionarCadeia={onSelecionarCadeia}
            onAdicionarPasso={onAdicionarPasso}
            onAtualizarPasso={onAtualizarPasso}
            onExcluirPasso={onExcluirPasso}
            onMarcarCausaRaiz={onMarcarCausaRaiz}
            onCriarNovaCadeia={onIniciar5Porques}
            onIrParaPlanoAcao={(causaTexto) => {
              onIrParaPlanoAcao(causaTexto);
              setSubAba('acoes');
            }}
          />
        )}

        {subAba === 'acoes' && (
          <ActionPlanTable
            problema={problema}
            onAdicionarAcao={onAdicionarAcao}
            onAtualizarAcao={onAtualizarAcao}
            onExcluirAcao={onExcluirAcao}
            causaSugeridaTexto={causaSugeridaTexto}
          />
        )}

        {subAba === 'socatico' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-[#0E1524] border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
              <span className="font-bold">Guia de Investigação Gemba:</span> Use o Facilitador Socrático para desafiar suposições, apontar desvios de processo e evitar classificar sintomas superficiais como causas-raiz.
            </div>
            <SocraticFacilitator
              problema={problema}
              onAdicionarCausa={onAdicionarCausa}
              onAdicionarMensagemChat={onAdicionarMensagemChat}
              onAbrir5Porques={(cat, titulo) => {
                const causa = problema.causas6M.find(c => c.descricao === titulo);
                if (causa) {
                  onIniciar5Porques(causa);
                  setSubAba('porques');
                }
              }}
            />
          </div>
        )}

      </div>

    </div>
  );
};
