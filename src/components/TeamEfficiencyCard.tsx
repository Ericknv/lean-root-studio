/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  BarChart2, 
  PieChart as PieIcon, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Activity, 
  Target 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricasEficienciaEquipe } from '../types/leanRoot';

interface TeamEfficiencyCardProps {
  metricas: MetricasEficienciaEquipe;
  tema: 'dark' | 'light';
}

export const TeamEfficiencyCard: React.FC<TeamEfficiencyCardProps> = ({
  metricas,
  tema,
}) => {
  const [expandido, setExpandido] = useState(true);

  const isDark = tema === 'dark';
  const corTextoAxis = isDark ? '#94A3B8' : '#64748B';
  const corGrid = isDark ? '#1C2536' : '#E2E8F0';
  const corTooltipBg = isDark ? '#080C13' : '#FFFFFF';
  const corTooltipBorder = isDark ? '#2D3A4F' : '#CBD5E1';
  const corTooltipText = isDark ? '#F8FAFC' : '#0F172A';

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-[#0A0E17]/85 backdrop-blur-md shadow-xs overflow-hidden transition-colors">
      
      {/* Header Bar */}
      <div 
        onClick={() => setExpandido(!expandido)}
        className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-[#0E1420]/80 border-b border-slate-200/80 dark:border-slate-800/80 cursor-pointer select-none hover:bg-slate-100/50 dark:hover:bg-[#121A2A]/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-500 border border-amber-400/25">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Métricas de Eficiência da Equipe & Eficácia Lean
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                IATF / ISO Benchmark
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tempo médio de resolução (MTTR RCA), eficácia de contramedidas e cobertura 6M
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick inline KPIs visible even when collapsed */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono tabular-nums">
            <span className="text-slate-500 dark:text-slate-400">
              MTTR: <strong className="text-slate-900 dark:text-slate-100">{metricas.tempoMedioResolucaoDias}d</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              Eficácia: <strong className="text-emerald-600 dark:text-emerald-400">{metricas.taxaEficaciaAcoesCorretivas}%</strong>
            </span>
          </div>

          <button 
            type="button" 
            aria-label="Expandir ou recolher card de eficiência"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="p-4 sm:p-6 space-y-6"
          >
            {/* Top 4 KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* 1. MTTR / Tempo Médio de Resolução */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-[#111723]/70 backdrop-blur-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Tempo Médio (MTTR)
                  </span>
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                    {metricas.tempoMedioResolucaoDias}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">dias</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                  <span>Meta Kaizen: &le; 4.0 dias</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">· Em conformidade</span>
                </div>
              </div>

              {/* 2. Taxa de Eficácia de Ações Corretivas */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-[#111723]/70 backdrop-blur-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Eficácia Corretiva
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {metricas.taxaEficaciaAcoesCorretivas}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500">concluídas</span>
                </div>
                <div className="mt-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                  <span>{metricas.totalAcoesCorretivasConcluidas} de {metricas.totalAcoesCorretivas || 1} contramedidas</span>
                </div>
              </div>

              {/* 3. Aderência Investigativa aos 6M */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-[#111723]/70 backdrop-blur-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Aderência aos 6M
                  </span>
                  <Target className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                    {metricas.taxaAderencia6M}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500">cobertura</span>
                </div>
                <div className="mt-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                  <span>Evita viés prematuro de causa</span>
                </div>
              </div>

              {/* 4. Ações de Contenção Concluídas */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-[#111723]/70 backdrop-blur-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Contenção (D3)
                  </span>
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                    {metricas.totalAcoesContencaoConcluidas}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/ {metricas.totalAcoesContencao || 1} ativas</span>
                </div>
                <div className="mt-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                  <span>Proteção imediata do turno</span>
                </div>
              </div>

            </div>

            {/* Recharts Visual Charts Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              {/* Chart 1: Distribuição de Causas e Validadas por Eixo 6M (BarChart) */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-[#111723]/60 backdrop-blur-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Investigação por Eixo Ishikawa (6M)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Total vs. Validadas com Evidência</span>
                </div>

                <div className="h-56 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metricas.distribuicaoPor6M}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis 
                        dataKey="nome" 
                        stroke={corTextoAxis} 
                        fontSize={11} 
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke={corTextoAxis} 
                        fontSize={11} 
                        allowDecimals={false} 
                        tickLine={false} 
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: corTooltipBg,
                          borderColor: corTooltipBorder,
                          borderRadius: '8px',
                          color: corTooltipText,
                          fontSize: '11px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      />
                      <Bar 
                        dataKey="total" 
                        name="Hipóteses Totais" 
                        fill="#3B82F6" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="validadas" 
                        name="Causas Validadas" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Status do Plano de Ação 5W2H (Donut / PieChart) */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-[#111723]/60 backdrop-blur-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Progresso do Plano de Ação 5W2H
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Taxa de Conclusão Operacional</span>
                </div>

                <div className="h-56 w-full text-xs flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metricas.distribuicaoStatusAcoes}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {metricas.distribuicaoStatusAcoes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: corTooltipBg,
                          borderColor: corTooltipBorder,
                          borderRadius: '8px',
                          color: corTooltipText,
                          fontSize: '11px',
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
