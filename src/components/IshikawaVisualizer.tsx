/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  HelpCircle,
  FileCheck,
  ChevronDown,
  Info,
  X,
  Target,
  Lightbulb,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ProblemaOperacional, 
  IshikawaCategory, 
  ISHIKAWA_CATEGORIES, 
  Causa6M, 
  CauseStatus 
} from '../types/leanRoot';
import { exportarIshikawaExcel, exportarIshikawaPdf } from '../services/technicalExportService';

interface IshikawaVisualizerProps {
  problema: ProblemaOperacional;
  onAdicionarCausa: (causa: Omit<Causa6M, 'id' | 'dataCriacao'>) => void;
  onAtualizarStatusCausa: (causaId: string, novoStatus: CauseStatus, evidencia?: string) => void;
  onExcluirCausa: (causaId: string) => void;
  onIniciar5Porques: (causa: Causa6M) => void;
}

const TOP_CATEGORIES: IshikawaCategory[] = ['metodo', 'maquina', 'material'];
const BOTTOM_CATEGORIES: IshikawaCategory[] = ['mao_de_obra', 'meio_ambiente', 'medicao'];

export const IshikawaVisualizer: React.FC<IshikawaVisualizerProps> = ({
  problema,
  onAdicionarCausa,
  onAtualizarStatusCausa,
  onExcluirCausa,
  onIniciar5Porques,
}) => {
  const [categoriaAdicao, setCategoriaAdicao] = useState<IshikawaCategory | null>(null);
  const [causaSelecionadaId, setCausaSelecionadaId] = useState<string | null>(null);
  const [causaHoveredId, setCausaHoveredId] = useState<string | null>(null);
  const [causaFocadaId, setCausaFocadaId] = useState<string | null>(null);
  const [colunaHovered, setColunaHovered] = useState<IshikawaCategory | null>(null);
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaEvidencia, setNovaEvidencia] = useState('');
  const [edicaoEvidenciaId, setEdicaoEvidenciaId] = useState<string | null>(null);
  const [textoEvidencia, setTextoEvidencia] = useState('');

  // Tooltip informativo por pilar 6M
  const [tooltipAberto, setTooltipAberto] = useState<IshikawaCategory | null>(null);
  const [tooltipFixado, setTooltipFixado] = useState<boolean>(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterTooltip = (catKey: IshikawaCategory) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    if (!tooltipFixado || tooltipAberto !== catKey) {
      setTooltipAberto(catKey);
    }
  };

  const handleMouseLeaveTooltip = () => {
    if (tooltipFixado) return;
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipAberto(null);
    }, 200);
  };

  const handleToggleTooltip = (catKey: IshikawaCategory) => {
    if (tooltipAberto === catKey && tooltipFixado) {
      setTooltipAberto(null);
      setTooltipFixado(false);
    } else {
      setTooltipAberto(catKey);
      setTooltipFixado(true);
    }
  };

  const handleFecharTooltip = () => {
    setTooltipAberto(null);
    setTooltipFixado(false);
  };

  // Atalho ESC para fechar tooltip e clique externo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFecharTooltip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!tooltipAberto) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-ishikawa-tooltip-root="true"]')) {
        handleFecharTooltip();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tooltipAberto]);

  const handleSalvarCausa = (categoria: IshikawaCategory) => {
    if (!novaDescricao.trim()) return;

    onAdicionarCausa({
      categoria,
      descricao: novaDescricao.trim(),
      status: 'hipotese',
      evidencia: novaEvidencia.trim() || undefined,
    });

    setNovaDescricao('');
    setNovaEvidencia('');
    setCategoriaAdicao(null);
  };

  const handleSalvarEvidencia = (causaId: string, statusAtual: CauseStatus) => {
    onAtualizarStatusCausa(causaId, statusAtual, textoEvidencia);
    setEdicaoEvidenciaId(null);
    setTextoEvidencia('');
  };

  const getTooltipAlignClass = (catKey: IshikawaCategory): string => {
    if (catKey === 'metodo' || catKey === 'mao_de_obra') return 'left-0';
    if (catKey === 'material' || catKey === 'medicao') return 'right-0';
    return 'left-0 sm:-left-6 md:-left-8';
  };

  // Helper para renderizar a coluna de um eixo
  const renderColunaEixo = (catKey: IshikawaCategory, isTop: boolean) => {
    const info = ISHIKAWA_CATEGORIES[catKey];
    const causas = problema.causas6M.filter(c => c.categoria === catKey);
    const isAdicionandoNesteEixo = categoriaAdicao === catKey;
    const isColunaAtiva = colunaHovered === catKey || isAdicionandoNesteEixo;
    const existeColunaAtiva = colunaHovered !== null || categoriaAdicao !== null;
    const isTooltipNestaColuna = tooltipAberto === catKey;

    return (
      <motion.div 
        key={catKey}
        onMouseEnter={() => setColunaHovered(catKey)}
        onMouseLeave={() => setColunaHovered(null)}
        animate={{
          opacity: existeColunaAtiva ? (isColunaAtiva ? 1.0 : 0.7) : 1.0,
          filter: isAdicionandoNesteEixo ? 'brightness(1.04)' : existeColunaAtiva && !isColunaAtiva ? 'brightness(0.95)' : 'brightness(1.0)',
          boxShadow: isAdicionandoNesteEixo 
            ? '0 0 16px -2px rgba(250, 204, 21, 0.28)' 
            : isColunaAtiva
            ? '0 4px 12px -2px rgba(0, 0, 0, 0.08)'
            : 'none',
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`flex flex-col flex-1 min-w-[260px] rounded-xl border bg-white/80 dark:bg-[#0E141F]/85 backdrop-blur-md shadow-2xs transition-colors relative ${
          isTooltipNestaColuna
            ? 'z-40 ring-2 ring-amber-400/40 border-amber-400/60'
            : isAdicionandoNesteEixo 
            ? 'z-20 border-amber-400 ring-2 ring-amber-400/20' 
            : 'z-10 border-slate-200/80 dark:border-slate-800/80'
        }`}
      >
        {/* Category Header */}
        <div 
          className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between rounded-t-xl relative bg-slate-50/50 dark:bg-[#121824]/50"
          style={{ borderTop: `3px solid ${info.color}` }}
          data-ishikawa-tooltip-root="true"
        >
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {info.shortLabel}
              </span>
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                ({causas.length})
              </span>

              {/* Informative Tooltip Trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleTooltip(catKey);
                }}
                onMouseEnter={() => handleMouseEnterTooltip(catKey)}
                onMouseLeave={handleMouseLeaveTooltip}
                onFocus={() => handleMouseEnterTooltip(catKey)}
                onBlur={handleMouseLeaveTooltip}
                aria-label={`Guia técnico do pilar ${info.shortLabel}: ${info.name}`}
                aria-expanded={isTooltipNestaColuna}
                className={`inline-flex items-center justify-center p-1 rounded-full transition-all ${
                  isTooltipNestaColuna
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs scale-110'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-400/10 dark:hover:text-amber-300 dark:hover:bg-[#182030]'
                }`}
                title={`Clique ou passe o mouse para ver o foco técnico e perguntas do pilar ${info.shortLabel}`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              {tooltipFixado && isTooltipNestaColuna && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300 border border-amber-400/30">
                  Guia fixado
                </span>
              )}
            </div>
            
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5" title={info.description}>
              {info.description}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setCategoriaAdicao(categoriaAdicao === catKey ? null : catKey);
                setNovaDescricao('');
                setNovaEvidencia('');
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-500 dark:text-amber-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors"
              title="Adicionar hipótese neste eixo"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Informative 6M Tooltip Popover */}
          <AnimatePresence>
            {isTooltipNestaColuna && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onMouseEnter={() => handleMouseEnterTooltip(catKey)}
                onMouseLeave={handleMouseLeaveTooltip}
                className={`absolute z-50 top-full mt-2 w-76 sm:w-80 md:w-88 rounded-xl border border-slate-700/80 bg-slate-900/98 dark:bg-slate-950/98 backdrop-blur-md text-slate-100 shadow-2xl p-4 text-left pointer-events-auto ${getTooltipAlignClass(catKey)}`}
                style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-2 ring-white/20" 
                      style={{ backgroundColor: info.color }} 
                    />
                    <div>
                      <span className="text-[10px] font-extrabold tracking-wider uppercase" style={{ color: info.color }}>
                        Pilar 6M • Ishikawa
                      </span>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {info.name}
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFecharTooltip();
                    }}
                    className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                    title="Fechar guia"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Technical Focus */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Target className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>Foco Técnico e Escopo</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-slate-200">
                    {info.description}
                  </p>
                </div>

                {/* Guiding Question */}
                <div 
                  className="mt-2.5 space-y-1 bg-slate-800/80 dark:bg-slate-900/90 rounded-lg p-2.5 border-l-2" 
                  style={{ borderColor: info.color }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    <HelpCircle className="w-3 h-3 shrink-0" />
                    <span>Pergunta Investigativa Chave</span>
                  </div>
                  <p className="text-[11px] italic text-slate-100 font-medium leading-relaxed">
                    "{info.guidingQuestion}"
                  </p>
                </div>

                {/* Typical Hypotheses Examples */}
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>Exemplos Típicos de Falha (Chão de Fábrica)</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {info.exemplosTipicos.map((exemplo, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-slate-500 font-mono text-[10px] mt-0.5">•</span>
                        <span>{exemplo}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lean Tip */}
                <div className="mt-3 rounded-lg bg-blue-950/60 border border-blue-800/50 p-2.5 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10.5px] text-blue-200 leading-snug">
                    <strong className="font-semibold text-blue-100">Dica Lean: </strong>
                    {info.dicaLean}
                  </p>
                </div>

                {/* Footer instructions */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Clique no ícone para fixar</span>
                  <span className="font-mono">ESC para fechar</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Inline Add Form */}
        <AnimatePresence>
          {categoriaAdicao === catKey && (
            <motion.div 
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="p-3 border-b border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-2"
            >
              <input
                type="text"
                autoFocus
                placeholder={`Nova hipótese em ${info.shortLabel}...`}
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSalvarCausa(catKey);
                }}
              />
              <input
                type="text"
                placeholder="Evidência ou dado observado (opcional)..."
                value={novaEvidencia}
                onChange={(e) => setNovaEvidencia(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setCategoriaAdicao(null)}
                  className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSalvarCausa(catKey)}
                  disabled={!novaDescricao.trim()}
                  className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Causes list under this M */}
        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-64">
          {causas.length === 0 ? (
            <div className="py-4 text-center text-[11px] text-slate-400 dark:text-slate-500 italic">
              Nenhuma causa mapeada neste eixo.
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {causas.map((causa) => {
                const tem5Porques = problema.cadeias5Porques.some(c => c.causaOrigemId === causa.id);
                const isSelected = causaSelecionadaId === causa.id;
                const isHovered = causaHoveredId === causa.id;
                const isFocado = causaFocadaId === causa.id || edicaoEvidenciaId === causa.id;
                const isItemAtivo = isSelected || isHovered || isFocado;
                const existeItemAtivo = causaSelecionadaId !== null || causaHoveredId !== null || causaFocadaId !== null || edicaoEvidenciaId !== null;

                return (
                  <motion.div
                    key={causa.id}
                    layout
                    initial={{ opacity: 0, y: -12, scale: 0.96 }}
                    animate={{
                      opacity: existeItemAtivo ? (isItemAtivo ? 1.0 : 0.7) : 1.0,
                      scale: isItemAtivo ? 1.02 : 1.0,
                      filter: isItemAtivo ? 'brightness(1.08)' : existeItemAtivo ? 'brightness(0.95)' : 'brightness(1.0)',
                      boxShadow: isSelected 
                        ? '0 6px 20px -2px rgba(59, 130, 246, 0.28), 0 0 0 2px rgba(59, 130, 246, 0.6)' 
                        : isItemAtivo
                        ? '0 4px 14px -2px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.4)'
                        : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                    whileHover={{
                      scale: 1.02,
                      opacity: 1.0,
                      filter: 'brightness(1.05)',
                    }}
                    onMouseEnter={() => setCausaHoveredId(causa.id)}
                    onMouseLeave={() => setCausaHoveredId(null)}
                    onFocusCapture={() => setCausaFocadaId(causa.id)}
                    onBlurCapture={() => setCausaFocadaId(null)}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setCausaSelecionadaId(isSelected ? null : causa.id)}
                    className={`group relative rounded-lg border p-2.5 text-xs transition-colors shadow-2xs cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 dark:border-amber-400 dark:bg-amber-400/10 shadow-[0_0_12px_rgba(250,204,21,0.2)]'
                        : causa.status === 'validada'
                        ? 'border-emerald-400/40 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20'
                        : causa.status === 'descartada'
                        ? 'border-slate-200 bg-slate-50 text-slate-400 line-through dark:border-slate-800 dark:bg-[#0D121B]/50 dark:text-slate-500'
                        : causa.status === 'sintoma' || causa.isSintoma
                        ? 'border-amber-300 bg-amber-50/40 dark:border-amber-800/60 dark:bg-amber-950/20'
                        : 'border-slate-200/80 bg-white/90 dark:border-slate-700/60 dark:bg-[#131A26]/80'
                    }`}
                  >
                    {/* Cause description */}
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-1 mr-1">
                        {isSelected && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        )}
                        <span className={`font-medium leading-snug ${isSelected ? 'text-blue-900 dark:text-blue-200 font-bold' : 'text-slate-900 dark:text-slate-100'}`}>
                          {causa.descricao}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExcluirCausa(causa.id);
                        }}
                        title="Excluir hipótese"
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Symptom warning if flagged */}
                    {(causa.isSintoma || causa.status === 'sintoma') && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-medium mb-1.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Sintoma superficial (requer 5 Porquês)</span>
                      </div>
                    )}

                    {/* Evidence summary or inline edit */}
                    {edicaoEvidenciaId === causa.id ? (
                      <div className="my-1.5 space-y-1">
                        <input
                          type="text"
                          autoFocus
                          value={textoEvidencia}
                          onChange={(e) => setTextoEvidencia(e.target.value)}
                          placeholder="Evidência (ex.: medição, foto, log)..."
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSalvarEvidencia(causa.id, causa.status);
                          }}
                        />
                        <div className="flex justify-end gap-1 text-[10px]">
                          <button
                            onClick={() => setEdicaoEvidenciaId(null)}
                            className="px-1.5 py-0.5 text-slate-500"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSalvarEvidencia(causa.id, causa.status)}
                            className="px-2 py-0.5 font-semibold text-blue-600"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : causa.evidencia ? (
                      <div 
                        onClick={() => {
                          setEdicaoEvidenciaId(causa.id);
                          setTextoEvidencia(causa.evidencia || '');
                        }}
                        className="my-1 text-[10.5px] text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/80 p-1.5 rounded-sm flex items-start gap-1 cursor-pointer hover:ring-1 hover:ring-slate-300 dark:hover:ring-slate-700"
                        title="Clique para editar evidência"
                      >
                        <FileCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">Evidência: {causa.evidencia}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEdicaoEvidenciaId(causa.id);
                          setTextoEvidencia('');
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 mb-1"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Adicionar evidência</span>
                      </button>
                    )}

                    {/* Actions footer: Status selector & 5 Whys trigger */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[10px]"
                    >
                      <select
                        value={causa.status}
                        onChange={(e) => onAtualizarStatusCausa(causa.id, e.target.value as CauseStatus, causa.evidencia)}
                        className="rounded-sm border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <option value="hipotese">Hipótese</option>
                        <option value="validada">Validada</option>
                        <option value="descartada">Descartada</option>
                        <option value="sintoma">Sintoma</option>
                      </select>

                      <button
                        onClick={() => onIniciar5Porques(causa)}
                        className={`flex items-center gap-1 font-semibold transition-colors px-1.5 py-0.5 rounded-sm ${
                          tem5Porques
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300'
                        }`}
                      >
                        <span>5 Porquês</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ferramentas de Exportação do Ishikawa 6M */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-[#0E1420]/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
            <GitBranch className="w-4 h-4 text-amber-500" />
            <span>Mapeamento Sistemático 6M</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            ({problema.causas6M.length} hipóteses registradas)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportarIshikawaPdf(problema)}
            title="Exportar Diagrama de Ishikawa em PDF A4"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700/80 dark:bg-[#141C29] dark:hover:bg-[#1A2436] text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Exportar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => exportarIshikawaExcel(problema)}
            title="Exportar Planilha Excel (.xlsx) das Hipóteses 6M"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-600/30 dark:bg-[#121A26] dark:hover:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar Excel (.xlsx)</span>
          </button>
        </div>
      </div>
      
      {/* Visual Fishbone Structure */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-100/50 p-4 dark:border-slate-800/80 dark:bg-[#080C13]/70 backdrop-blur-md overflow-x-auto">
        
        {/* Top 3 Ribs (Método, Máquina, Material) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {TOP_CATEGORIES.map(cat => renderColunaEixo(cat, true))}
        </div>

        {/* Central Spine Graphic Bar in Carbon High-Tech style */}
        <div className="relative my-3 flex items-center justify-between bg-slate-900 text-white dark:bg-[#111723] dark:border dark:border-slate-700/70 dark:text-slate-100 px-4 py-2.5 rounded-lg shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Espinha Central de Causalidade (Diagrama de Ishikawa 6M)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-mono">Efeito / Parada:</span>
            <span className="font-bold font-mono text-xs bg-red-600/90 text-white px-2.5 py-1 rounded-sm border border-red-500/40 shadow-xs truncate max-w-xs md:max-w-md">
              {problema.titulo}
            </span>
          </div>
        </div>

        {/* Bottom 3 Ribs (Mão de Obra, Meio Ambiente, Medição) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {BOTTOM_CATEGORIES.map(cat => renderColunaEixo(cat, false))}
        </div>

      </div>

    </div>
  );
};
