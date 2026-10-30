/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  Timer,
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  PlusCircle, 
  Zap, 
  ArrowRight, 
  Search, 
  FileText, 
  RotateCcw,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { ProblemaOperacional, MetricasEficienciaEquipe, MetricasAnalise } from '../types/leanRoot';
import { TeamEfficiencyCard } from './TeamEfficiencyCard';

interface ExecutiveDashboardViewProps {
  problemas: ProblemaOperacional[];
  metricasEficiencia: MetricasEficienciaEquipe;
  metricasGerais: MetricasAnalise;
  tema: 'dark' | 'light';
  onSelecionarProblemaEInvestigar: (problemaId: string) => void;
  onAbrirNovoProblema: () => void;
  onAbrirCapturaRapida: () => void;
  onRestaurarExemplo: () => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  problemas,
  metricasEficiencia,
  metricasGerais,
  tema,
  onSelecionarProblemaEInvestigar,
  onAbrirNovoProblema,
  onAbrirCapturaRapida,
  onRestaurarExemplo,
}) => {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');

  const opcoesFiltro: { id: string; label: string; dotColor: string }[] = [
    { id: 'todos', label: 'Todos', dotColor: 'bg-slate-400' },
    { id: 'investigando', label: 'Investigando', dotColor: 'bg-blue-500' },
    { id: 'causa_identificada', label: 'Causa Identificada', dotColor: 'bg-amber-500' },
    { id: 'em_acoes', label: 'Em Ações', dotColor: 'bg-indigo-500' },
    { id: 'concluido', label: 'Concluído', dotColor: 'bg-emerald-500' },
  ];

  const contagemPorStatus = {
    todos: problemas.length,
    investigando: problemas.filter(p => p.status === 'investigando').length,
    causa_identificada: problemas.filter(p => p.status === 'causa_identificada').length,
    em_acoes: problemas.filter(p => p.status === 'em_acoes').length,
    concluido: problemas.filter(p => p.status === 'concluido').length,
  };

  // Cálculo do Tempo Médio de Resolução (TMR) para problemas com status 'Concluído'
  // Regra solicitada: subtraindo a data de criação da data atual
  const metricasTMR = useMemo(() => {
    const problemasConcluidos = problemas.filter(p => p.status === 'concluido');
    const agora = new Date().getTime();

    if (problemasConcluidos.length === 0) {
      return {
        totalConcluidos: 0,
        mediaDias: null,
        mediaHoras: null,
        displayValor: '—',
        displayUnidade: 'dias',
        detalhe: '0 ocorrências concluídas',
        temDados: false,
      };
    }

    const duracoesDias = problemasConcluidos.map(p => {
      const dataRef = p.dataCriacao || p.data;
      const dataInicio = new Date(dataRef).getTime();
      const diffMs = isNaN(dataInicio) ? 0 : Math.max(0, agora - dataInicio);
      return diffMs / (1000 * 60 * 60 * 24);
    });

    const somaDias = duracoesDias.reduce((acc, d) => acc + d, 0);
    const mediaDias = somaDias / duracoesDias.length;
    const mediaHoras = mediaDias * 24;

    return {
      totalConcluidos: problemasConcluidos.length,
      mediaDias: Number(mediaDias.toFixed(1)),
      mediaHoras: Number(mediaHoras.toFixed(1)),
      displayValor: mediaDias >= 1 ? mediaDias.toFixed(1) : (mediaHoras < 0.1 ? '< 0.1' : mediaHoras.toFixed(1)),
      displayUnidade: mediaDias >= 1 ? 'dias' : 'horas',
      detalhe: `${problemasConcluidos.length} ${problemasConcluidos.length === 1 ? 'ocorrência concluída' : 'ocorrências concluídas'}`,
      temDados: true,
    };
  }, [problemas]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return {
          label: 'Concluído',
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        };
      case 'causa_identificada':
        return {
          label: 'Causa Identificada',
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
        };
      case 'em_acoes':
        return {
          label: 'Em Ações',
          className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
        };
      case 'investigando':
      default:
        return {
          label: 'Investigando',
          className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
        };
    }
  };

  const problemasFiltrados = problemas.filter(p => {
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    const matchBusca = 
      !termoBusca ||
      p.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p.equipamento.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p.linha.toLowerCase().includes(termoBusca.toLowerCase());

    return matchStatus && matchBusca;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
      
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5">
            <BarChart3 className="w-3 h-3" />
            <span>Cockpit Executivo de Engenharia & Confiabilidade</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Visão Geral de Desempenho Operacional
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitoramento em tempo real de causas de falha, MTTR, resolução de anomalias e eficácia de contramedidas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onAbrirCapturaRapida}
            className="btn-safety-yellow flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Captura Rápida</span>
          </button>

          <button
            onClick={onAbrirNovoProblema}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-700/80 dark:bg-[#161F2E] dark:text-slate-100 dark:hover:bg-[#1E293B] px-4 py-2 text-xs font-bold transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Nova Anomalia</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Destaque Superior com Indicador TMR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Ocorrências Ativas</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">{metricasGerais.totalProblemas}</span>
            <span className="text-xs text-slate-500 font-mono">cadastradas</span>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 block truncate">
            {problemas.filter(p => p.status === 'investigando').length} em fase de diagnóstico
          </span>
        </div>

        {/* Indicador de Tempo Médio de Resolução (TMR) para problemas com status 'Concluído' */}
        <div 
          onClick={() => setFiltroStatus('concluido')}
          className="p-4 rounded-xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800/80 shadow-xs cursor-pointer hover:border-emerald-500/60 transition-all group relative"
          title="Filtrar ocorrências concluídas (Fórmula: Data Atual - Data de Criação)"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider group-hover:text-emerald-500 transition-colors">
              TMR (Concluídos)
            </span>
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-500">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
              {metricasTMR.displayValor}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {metricasTMR.displayUnidade} (TMR)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span className="truncate">{metricasTMR.detalhe}</span>
            <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded font-bold shrink-0 ml-1">
              Hoje − Criação
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Ciclo PDCA (MTTR)</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
              {metricasEficiencia.tempoMedioResolucaoDias}
            </span>
            <span className="text-xs text-slate-500 font-mono">dias</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block truncate">
            Ciclo médio de investigação
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Taxa Eficácia 5W2H</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {metricasEficiencia.taxaEficaciaAcoesCorretivas}%
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono font-bold">ações</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block truncate">
            {metricasEficiencia.totalAcoesCorretivasConcluidas} de {metricasEficiencia.totalAcoesCorretivas} validadas
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0E1420] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Causas-Raiz Travadas</span>
            <GitBranch className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-mono font-bold text-amber-500 dark:text-amber-400">
              {metricasGerais.causasRaizIdentificadas}
            </span>
            <span className="text-xs text-slate-500 font-mono">raiz</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block truncate">
            Comprovadas via 5 Porquês
          </span>
        </div>
      </div>

      {/* Cartão de Eficiência da Equipe com Gráficos Recharts */}
      <TeamEfficiencyCard metricas={metricasEficiencia} tema={tema} />

      {/* Lista Executiva de Ocorrências com Seletor de Filtros Avançado */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Fila de Anomalias Operacionais & Rastreabilidade
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {problemasFiltrados.length} {problemasFiltrados.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Clique em qualquer ocorrência para abrir imediatamente a mesa técnica de investigação socrática.
              </p>
            </div>

            {/* Caixa de Busca com Ícone e Limpeza */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por código, máquina ou linha..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121824] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 w-full sm:w-64 shadow-2xs"
              />
              {termoBusca && (
                <button
                  onClick={() => setTermoBusca('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-mono"
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Seletor de Filtros por Status (Segmented Pill Buttons) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono mr-1">
                Status:
              </span>
              {opcoesFiltro.map((opcao) => {
                const count = contagemPorStatus[opcao.id as keyof typeof contagemPorStatus] ?? 0;
                const isSelected = filtroStatus === opcao.id;

                return (
                  <button
                    key={opcao.id}
                    onClick={() => setFiltroStatus(opcao.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/50 shadow-xs font-bold'
                        : 'bg-white dark:bg-[#121824] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opcao.dotColor} shrink-0`} />
                    <span>{opcao.label}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      isSelected
                        ? 'bg-amber-500/25 text-amber-900 dark:text-amber-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {(filtroStatus !== 'todos' || termoBusca !== '') && (
              <button
                onClick={() => {
                  setFiltroStatus('todos');
                  setTermoBusca('');
                }}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 font-mono font-semibold"
              >
                <span>Limpar filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Grade de Ocorrências em formato de Cards Operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problemasFiltrados.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white dark:bg-[#0E1420] rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400">
                Nenhuma ocorrência encontrada para os filtros selecionados.
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setFiltroStatus('todos');
                    setTermoBusca('');
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Ver todas as ocorrências ({problemas.length})
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  onClick={onRestaurarExemplo}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:underline inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar dados de exemplo</span>
                </button>
              </div>
            </div>
          ) : (
            problemasFiltrados.map((prob) => {
              const temRaiz = prob.cadeias5Porques.some(c => c.passos.some(p => p.isCausaRaiz));
              const acoesFeitas = prob.acoes.filter(a => a.status === 'concluido').length;
              const badge = getStatusBadge(prob.status);

              return (
                <div
                  key={prob.id}
                  onClick={() => onSelecionarProblemaEInvestigar(prob.id)}
                  className="group relative cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1420] p-4 shadow-xs transition-all hover:border-amber-400/80 dark:hover:border-amber-400/50 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                        {prob.codigo}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {prob.titulo}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {prob.descricao}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{prob.linha}</span>
                      <span className="mx-1">·</span>
                      <span>{prob.equipamento}</span>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 opacity-90 group-hover:translate-x-0.5 transition-transform">
                      <span>Investigar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
