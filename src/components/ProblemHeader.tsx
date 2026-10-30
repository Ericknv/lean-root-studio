/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Wrench, 
  Calendar, 
  Users, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Edit3 
} from 'lucide-react';
import { ProblemaOperacional, StatusProblema, ISHIKAWA_CATEGORIES } from '../types/leanRoot';

interface ProblemHeaderProps {
  problema: ProblemaOperacional;
  onAtualizarStatus: (novoStatus: StatusProblema) => void;
  onEditarDetalhes: () => void;
}

export const ProblemHeader: React.FC<ProblemHeaderProps> = ({
  problema,
  onAtualizarStatus,
  onEditarDetalhes,
}) => {
  const [expandirDescricao, setExpandirDescricao] = useState(false);

  const temCausaRaiz = problema.cadeias5Porques.some(c => c.passos.some(p => p.isCausaRaiz));
  const temAcaoCorretiva = problema.acoes.some(a => a.tipo === 'corretiva');
  const alertaSemAcaoCorretiva = temCausaRaiz && !temAcaoCorretiva;

  return (
    <div className="border-b border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-[#0A0E17]/85 backdrop-blur-md p-4 sm:p-6 transition-colors">
      
      {/* Top Meta Line: Code, Line, Equipment and Status selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono font-bold text-amber-500 dark:text-amber-400 bg-amber-400/10 dark:bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/30 shadow-[0_0_8px_rgba(250,204,21,0.15)]">
            {problema.codigo}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{problema.linha}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <div className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
            <Wrench className="w-3.5 h-3.5 text-slate-400" />
            <span>{problema.equipamento}</span>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-select" className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ciclo PDCA:
          </label>
          <select
            id="status-select"
            value={problema.status}
            onChange={(e) => onAtualizarStatus(e.target.value as StatusProblema)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-amber-400 focus:bg-white focus:outline-hidden dark:border-slate-700/70 dark:bg-[#121824] dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <option value="investigando">Investigando (P - Plan)</option>
            <option value="causa_identificada">Causa-Raiz Definida (D - Do)</option>
            <option value="em_acoes">Ações em Execução (C - Check)</option>
            <option value="concluido">Concluído e Padronizado (A - Act)</option>
          </select>
        </div>
      </div>

      {/* Main Title and Quick Action */}
      <div className="flex items-start justify-between gap-4 my-2">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
          {problema.titulo}
        </h1>
        <button
          onClick={onEditarDetalhes}
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-300 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#161F2E] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title="Editar dados da ocorrência"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Editar</span>
        </button>
      </div>

      {/* Factual Context Strip */}
      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{problema.data}</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>{problema.turno}</span>
        </div>

        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>

        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Facilitador: <strong className="font-semibold text-slate-700 dark:text-slate-300">{problema.facilitador}</strong></span>
        </div>

        {problema.equipeParticipante && (
          <>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
            <div className="text-slate-600 dark:text-slate-400 truncate max-w-md">
              Equipe: {problema.equipeParticipante}
            </div>
          </>
        )}
      </div>

      {/* Detailed Operational Description with Toggle */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div 
          onClick={() => setExpandirDescricao(!expandirDescricao)}
          className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
        >
          <span className="uppercase text-[10.5px] font-mono tracking-wider text-slate-500 dark:text-slate-400">Descrição Factual da Falha & Impacto Operacional:</span>
          <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span>{expandirDescricao ? 'Recolher' : 'Expandir'}</span>
            {expandirDescricao ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className={`mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed ${expandirDescricao ? '' : 'line-clamp-2'}`}>
          {problema.descricao}
        </p>
      </div>

      {/* Systemic Warning Alert: Root Cause without Corrective Action */}
      {alertaSemAcaoCorretiva && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-400/40 bg-amber-400/10 dark:bg-amber-400/[0.08] p-3 text-xs text-amber-900 dark:text-amber-200 shadow-[0_0_16px_rgba(250,204,21,0.12)]">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Aviso Metodológico Kaizen:</span>
            <p>
              Uma causa-raiz fundamental já foi demarcada na árvore dos 5 Porquês, porém <strong>ainda não existe nenhuma Ação Corretiva sistêmica cadastrada</strong> para evitar a reincidência. Vá à aba de Plano de Ação para registrar uma contramedida definitiva.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
