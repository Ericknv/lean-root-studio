/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  ArrowUpRight
} from 'lucide-react';
import { ProblemaOperacional, ItemPlanoAcao, StatusAcao, TipoAcao } from '../types/leanRoot';
import { 
  exportarMatrizAcoesConsolidadaExcel, 
  exportarMatrizAcoesConsolidadaPdf 
} from '../services/technicalExportService';

interface ActionWithContext extends ItemPlanoAcao {
  problemaId: string;
  problemaCodigo: string;
  problemaTitulo: string;
  linha: string;
  equipamento: string;
}

interface ConsolidatedActionMatrixProps {
  problemas: ProblemaOperacional[];
  onAtualizarAcaoStatus: (problemaId: string, acaoId: string, novoStatus: StatusAcao) => void;
  onSelecionarProblema: (problemaId: string) => void;
  onNavegarParaInvestigacao: () => void;
  onToast: (msg: string) => void;
}

export const ConsolidatedActionMatrix: React.FC<ConsolidatedActionMatrixProps> = ({
  problemas,
  onAtualizarAcaoStatus,
  onSelecionarProblema,
  onNavegarParaInvestigacao,
  onToast,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoAcao>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | StatusAcao>('todos');
  const [buscaTexto, setBuscaTexto] = useState('');

  // Compila todas as ações com seus contextos de ocorrência
  const todasAcoes = useMemo(() => {
    const list: ActionWithContext[] = [];
    problemas.forEach(prob => {
      prob.acoes.forEach(acao => {
        list.push({
          ...acao,
          problemaId: prob.id,
          problemaCodigo: prob.codigo,
          problemaTitulo: prob.titulo,
          linha: prob.linha,
          equipamento: prob.equipamento,
        });
      });
    });
    return list;
  }, [problemas]);

  // Ações filtradas
  const acoesFiltradas = useMemo(() => {
    return todasAcoes.filter(a => {
      const matchTipo = filtroTipo === 'todos' || a.tipo === filtroTipo;
      const matchStatus = filtroStatus === 'todos' || a.status === filtroStatus;
      const matchTexto = 
        !buscaTexto ||
        a.descricao.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        a.responsavel.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        a.problemaCodigo.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        a.equipamento.toLowerCase().includes(buscaTexto.toLowerCase());

      return matchTipo && matchStatus && matchTexto;
    });
  }, [todasAcoes, filtroTipo, filtroStatus, buscaTexto]);

  // Estatísticas rápidas
  const totalContencao = todasAcoes.filter(a => a.tipo === 'contencao').length;
  const totalCorretiva = todasAcoes.filter(a => a.tipo === 'corretiva').length;
  const concluidas = todasAcoes.filter(a => a.status === 'concluido').length;
  const pendentes = todasAcoes.filter(a => a.status === 'pendente').length;
  const emAndamento = todasAcoes.filter(a => a.status === 'em_andamento').length;

  const taxaConclusao = todasAcoes.length > 0 ? Math.round((concluidas / todasAcoes.length) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
      
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5">
            <CheckSquare className="w-3 h-3" />
            <span>Matriz Consolidada da Planta</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Painel Central de Contramedidas 5W2H
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestão unificada de ações de contenção imediata e contramedidas sistêmicas de todas as anomalias da fábrica.
          </p>
        </div>

        {/* Botões de Exportação da Matriz */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              exportarMatrizAcoesConsolidadaExcel(problemas);
              onToast('Planilha Excel (.xlsx) da Matriz gerada com sucesso!');
            }}
            className="flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40 px-3.5 py-2 text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => {
              exportarMatrizAcoesConsolidadaPdf(problemas);
              onToast('Relatório PDF da Matriz gerado com sucesso!');
            }}
            className="btn-safety-yellow flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar PDF Paisagem</span>
          </button>
        </div>
      </div>

      {/* KPI Cards da Matriz */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block">Total de Ações</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">{todasAcoes.length}</span>
            <span className="text-[11px] text-slate-500 font-mono">({totalContencao} cont. · {totalCorretiva} corr.)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold block">Concluídas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{concluidas}</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold font-mono">({taxaConclusao}%)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-semibold block">Em Andamento</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">{emAndamento}</span>
            <span className="text-[11px] text-slate-500 font-mono">no prazo</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-semibold block">Pendentes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">{pendentes}</span>
            <span className="text-[11px] text-slate-500 font-mono">aguardando execução</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0E1420] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por ação, responsável, máquina ou código..."
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141C29] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Filtro de Tipo */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#141C29] p-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                filtroTipo === 'todos' ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-amber-400 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo('contencao')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                filtroTipo === 'contencao' ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Contenção
            </button>
            <button
              onClick={() => setFiltroTipo('corretiva')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                filtroTipo === 'corretiva' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Corretiva
            </button>
          </div>

          {/* Filtro de Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as 'todos' | StatusAcao)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#141C29] text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>

      {/* Tabela de Ações Consolidadas */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1420] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#121824]/90 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Ocorrência</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-4">Ação 5W2H (O Quê)</th>
                <th className="py-3 px-3">Responsável</th>
                <th className="py-3 px-3">Prazo</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Verificação de Eficácia</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {acoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Nenhuma ação encontrada com os critérios de filtro selecionados.
                  </td>
                </tr>
              ) : (
                acoesFiltradas.map((acao) => (
                  <tr key={acao.id} className="hover:bg-slate-50/70 dark:hover:bg-[#141C29]/50 transition-colors">
                    
                    {/* Ocorrência / Equipamento */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                        {acao.problemaCodigo}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                        {acao.linha} · {acao.equipamento}
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="py-3 px-3">
                      {acao.tipo === 'contencao' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                          Contenção
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                          Corretiva
                        </span>
                      )}
                    </td>

                    {/* Descrição */}
                    <td className="py-3 px-4 max-w-xs font-medium leading-relaxed">
                      {acao.descricao}
                    </td>

                    {/* Responsável */}
                    <td className="py-3 px-3 font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {acao.responsavel}
                    </td>

                    {/* Prazo */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                      {acao.prazo}
                    </td>

                    {/* Status Alterável */}
                    <td className="py-3 px-3">
                      <select
                        value={acao.status}
                        onChange={(e) => onAtualizarAcaoStatus(acao.problemaId, acao.id, e.target.value as StatusAcao)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-md border focus:outline-none ${
                          acao.status === 'concluido'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : acao.status === 'em_andamento'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </td>

                    {/* Verificação de Eficácia */}
                    <td className="py-3 px-4 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                      {acao.comoVerificarEficacia || 'Padrão não definido'}
                    </td>

                    {/* Ação de Navegar até a Ocorrência */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelecionarProblema(acao.problemaId);
                          onNavegarParaInvestigacao();
                        }}
                        title="Ir para a Mesa Técnica desta ocorrência"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline"
                      >
                        <span>Investigar</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
