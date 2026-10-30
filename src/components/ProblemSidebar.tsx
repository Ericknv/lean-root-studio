/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  PlusCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Layers,
  X,
  Wrench,
  SlidersHorizontal
} from 'lucide-react';
import { ProblemaOperacional, StatusProblema } from '../types/leanRoot';

interface ProblemSidebarProps {
  problemas: ProblemaOperacional[];
  problemaAtivoId: string | null;
  onSelecionarProblema: (id: string) => void;
  onNovoProblema: () => void;
  onExcluirProblema: (id: string, titulo: string) => void;
  onRestaurarExemplo: () => void;
  onExportarJSON: () => void;
  onImportarJSON: (conteudo: string) => void;
}

const STATUS_CONFIG: Record<StatusProblema, { label: string; bg: string; text: string }> = {
  investigando: {
    label: 'Em Investigação',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
  },
  causa_identificada: {
    label: 'Causa Identificada',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  em_acoes: {
    label: 'Ações em Andamento',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  concluido: {
    label: 'Concluído',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
};

type CampoBusca = 'todos' | 'titulo' | 'equipamento';

export const ProblemSidebar: React.FC<ProblemSidebarProps> = ({
  problemas,
  problemaAtivoId,
  onSelecionarProblema,
  onNovoProblema,
  onExcluirProblema,
  onRestaurarExemplo,
  onExportarJSON,
  onImportarJSON,
}) => {
  const [busca, setBusca] = useState('');
  const [campoBusca, setCampoBusca] = useState<CampoBusca>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const problemasFiltrados = problemas.filter(p => {
    const termo = busca.trim().toLowerCase();
    
    let matchTexto = true;
    if (termo) {
      if (campoBusca === 'titulo') {
        matchTexto = p.titulo.toLowerCase().includes(termo);
      } else if (campoBusca === 'equipamento') {
        matchTexto = p.equipamento.toLowerCase().includes(termo);
      } else {
        matchTexto = 
          p.titulo.toLowerCase().includes(termo) ||
          p.equipamento.toLowerCase().includes(termo) ||
          p.codigo.toLowerCase().includes(termo) ||
          p.linha.toLowerCase().includes(termo);
      }
    }
    
    if (filtroStatus === 'todos') return matchTexto;
    return matchTexto && p.status === filtroStatus;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) onImportarJSON(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <aside className="flex flex-col w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-[#0A0E17]/90 backdrop-blur-md h-full">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Ocorrências ({problemas.length})
            </h2>
          </div>
          <button
            onClick={onNovoProblema}
            className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Enhanced Search Bar: Title and Equipment Filter */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={
                campoBusca === 'titulo'
                  ? 'Buscar por título da ocorrência...'
                  : campoBusca === 'equipamento'
                  ? 'Buscar por equipamento / máquina...'
                  : 'Buscar por título ou equipamento...'
              }
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setBusca('');
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:outline-hidden dark:border-slate-700/70 dark:bg-[#121824]/90 dark:text-slate-100 dark:placeholder:text-slate-500 transition-all shadow-2xs"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Targets: Ambos, Título, Equipamento */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Filtrar:</span>
              <button
                type="button"
                onClick={() => setCampoBusca('todos')}
                className={`px-1.5 py-0.5 rounded text-[10.5px] font-medium transition-colors ${
                  campoBusca === 'todos'
                    ? 'bg-amber-400/20 text-amber-800 dark:text-amber-300 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Ambos
              </button>
              <button
                type="button"
                onClick={() => setCampoBusca('titulo')}
                className={`px-1.5 py-0.5 rounded text-[10.5px] font-medium transition-colors ${
                  campoBusca === 'titulo'
                    ? 'bg-amber-400/20 text-amber-800 dark:text-amber-300 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Título
              </button>
              <button
                type="button"
                onClick={() => setCampoBusca('equipamento')}
                className={`px-1.5 py-0.5 rounded text-[10.5px] font-medium transition-colors ${
                  campoBusca === 'equipamento'
                    ? 'bg-amber-400/20 text-amber-800 dark:text-amber-300 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Equipamento
              </button>
            </div>

            {busca && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium">
                {problemasFiltrados.length} de {problemas.length}
              </span>
            )}
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
              filtroStatus === 'todos'
                ? 'bg-slate-900 text-white dark:bg-[#182030] dark:text-amber-400 dark:border dark:border-amber-400/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#121824]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroStatus('investigando')}
            className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
              filtroStatus === 'investigando'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#121824]'
            }`}
          >
            Investigação
          </button>
          <button
            onClick={() => setFiltroStatus('causa_identificada')}
            className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
              filtroStatus === 'causa_identificada'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(250,204,21,0.25)]'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#121824]'
            }`}
          >
            Causa-Raiz
          </button>
        </div>
      </div>

      {/* Problem Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {problemasFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600" />
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {busca ? `Nenhuma ocorrência encontrada para "${busca}"` : 'Nenhuma ocorrência encontrada.'}
            </p>
            <p className="text-[11px] text-slate-500">
              {busca 
                ? 'Verifique se digitou o título ou equipamento corretamente ou mude o filtro.' 
                : 'Cadastre sua primeira anomalia ou restaure o caso modelo.'}
            </p>
            {busca ? (
              <button
                onClick={() => setBusca('')}
                className="mt-2 flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar filtro de busca</span>
              </button>
            ) : (
              <button
                onClick={onRestaurarExemplo}
                className="mt-2 flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Carregar Exemplo Prático (CNC)</span>
              </button>
            )}
          </div>
        ) : (
          problemasFiltrados.map((prob) => {
            const isAtivo = prob.id === problemaAtivoId;
            const statusCfg = STATUS_CONFIG[prob.status] || STATUS_CONFIG.investigando;
            const totalCausas = prob.causas6M.length;
            const temCausaRaiz = prob.cadeias5Porques.some(c => c.passos.some(p => p.isCausaRaiz));

            return (
              <div
                key={prob.id}
                onClick={() => onSelecionarProblema(prob.id)}
                className={`group relative rounded-xl border p-3.5 cursor-pointer transition-all ${
                  isAtivo
                    ? 'border-amber-400/80 bg-amber-500/5 shadow-[0_0_16px_rgba(250,204,21,0.12)] dark:border-amber-400/70 dark:bg-amber-400/[0.04]'
                    : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800/80 dark:bg-[#111723]/75 dark:hover:border-slate-700/80 dark:hover:bg-[#161F2E]/85 backdrop-blur-xs'
                }`}
              >
                {/* Header row: Code & Status */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {prob.codigo}
                  </span>
                  <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-sm ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`text-xs font-bold line-clamp-2 mb-2 leading-relaxed ${
                  busca && prob.titulo.toLowerCase().includes(busca.toLowerCase().trim())
                    ? 'text-amber-900 dark:text-amber-200'
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {prob.titulo}
                </h3>

                {/* Location & Machine */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 mb-2.5">
                  <div className="truncate">
                    <span className="text-slate-400 dark:text-slate-600">Linha:</span> {prob.linha}
                  </div>
                  <div className={`truncate font-mono text-[10.5px] flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-colors ${
                    busca && prob.equipamento.toLowerCase().includes(busca.toLowerCase().trim())
                      ? 'bg-amber-400/10 text-amber-900 dark:bg-amber-400/10 dark:text-amber-300 font-semibold border border-amber-400/30'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-[#161F2E]/60 border border-slate-200/50 dark:border-slate-800'
                  }`}>
                    <Wrench className="w-3 h-3 shrink-0 text-slate-400" />
                    <span>Equip: {prob.equipamento}</span>
                  </div>
                </div>

                {/* Footer indicators & Delete button */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[10.5px]">
                    <span>{totalCausas} causas</span>
                    <span>·</span>
                    <span className={temCausaRaiz ? 'text-amber-500 dark:text-amber-400 font-bold' : ''}>
                      {temCausaRaiz ? '✓ Raiz identificada' : 'Em porquês'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExcluirProblema(prob.id, prob.titulo);
                    }}
                    title="Excluir ocorrência"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer with Storage & Backup Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 flex items-center justify-between gap-2 text-xs">
        <label className="cursor-pointer flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium">
          <Upload className="w-3.5 h-3.5" />
          <span>Importar</span>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <span className="text-slate-300 dark:text-slate-700">·</span>

        <button
          onClick={onExportarJSON}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700">·</span>

        <button
          onClick={onRestaurarExemplo}
          title="Recarregar caso industrial modelo"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exemplo</span>
        </button>
      </div>

    </aside>
  );
};
