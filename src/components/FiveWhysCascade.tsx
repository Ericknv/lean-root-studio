/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GitCommit, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowDown, 
  ShieldCheck, 
  PlusCircle, 
  Target,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ProblemaOperacional, 
  Cadeia5Porques, 
  No5Porques, 
  ISHIKAWA_CATEGORIES, 
  Causa6M 
} from '../types/leanRoot';
import { avaliarSeEhSintoma } from '../services/socraticEngine';
import { exportar5PorquesExcel, exportar5PorquesPdf } from '../services/technicalExportService';
import { FileSpreadsheet, FileText } from 'lucide-react';

interface FiveWhysCascadeProps {
  problema: ProblemaOperacional;
  cadeiaAtivaId?: string;
  onSelecionarCadeia: (cadeiaId: string) => void;
  onAdicionarPasso: (cadeiaId: string, pergunta: string, resposta: string, evidencia: string) => void;
  onAtualizarPasso: (cadeiaId: string, passoId: string, campos: Partial<No5Porques>) => void;
  onExcluirPasso: (cadeiaId: string, passoId: string) => void;
  onMarcarCausaRaiz: (cadeiaId: string, passoId: string, isRaiz: boolean) => void;
  onCriarNovaCadeia: (causa: Causa6M) => void;
  onIrParaPlanoAcao: (causaTexto: string, cadeiaId: string) => void;
}

export const FiveWhysCascade: React.FC<FiveWhysCascadeProps> = ({
  problema,
  cadeiaAtivaId,
  onSelecionarCadeia,
  onAdicionarPasso,
  onAtualizarPasso,
  onExcluirPasso,
  onMarcarCausaRaiz,
  onCriarNovaCadeia,
  onIrParaPlanoAcao,
}) => {
  const [novoPorQuePergunta, setNovoPorQuePergunta] = useState('');
  const [novoPorQueResposta, setNovoPorQueResposta] = useState('');
  const [novoPorQueEvidencia, setNovoPorQueEvidencia] = useState('');
  const [alertaSintomaLocal, setAlertaSintomaLocal] = useState<string | null>(null);
  const [passoSelecionadoId, setPassoSelecionadoId] = useState<string | null>(null);
  const [passoHoveredId, setPassoHoveredId] = useState<string | null>(null);
  const [passoFocadoId, setPassoFocadoId] = useState<string | null>(null);
  const [isFocandoNovoPasso, setIsFocandoNovoPasso] = useState(false);

  // Cadeia atualmente selecionada
  const cadeiaAtiva = problema.cadeias5Porques.find(c => c.id === cadeiaAtivaId) 
    || problema.cadeias5Porques[0];

  // Causas validadas que ainda não têm cadeia dos 5 Porquês
  const causasDisponiveis = problema.causas6M.filter(c => 
    c.status === 'validada' && !problema.cadeias5Porques.some(cad => cad.causaOrigemId === c.id)
  );

  const handleRespostaChange = (val: string) => {
    setNovoPorQueResposta(val);
    if (val.trim().length > 5) {
      const diag = avaliarSeEhSintoma(val);
      if (diag.isSintoma) {
        setAlertaSintomaLocal(diag.alertaMotivo || 'Possível resposta sintomática.');
      } else {
        setAlertaSintomaLocal(null);
      }
    } else {
      setAlertaSintomaLocal(null);
    }
  };

  const handleAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadeiaAtiva || !novoPorQueResposta.trim()) return;

    const ordem = cadeiaAtiva.passos.length + 1;
    const perguntaPadrao = novoPorQuePergunta.trim() || `Por quê? (Nível ${ordem})`;

    onAdicionarPasso(
      cadeiaAtiva.id,
      perguntaPadrao,
      novoPorQueResposta.trim(),
      novoPorQueEvidencia.trim()
    );

    setNovoPorQuePergunta('');
    setNovoPorQueResposta('');
    setNovoPorQueEvidencia('');
    setAlertaSintomaLocal(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Barra de Ferramentas de Exportação dos 5 Porquês */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-[#0E1420]/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
            <GitCommit className="w-4 h-4 text-amber-500" />
            <span>Desdobramento Causal (5 Porquês & Causa-Raiz)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            ({problema.cadeias5Porques.length} cadeia(s))
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportar5PorquesPdf(problema)}
            title="Exportar Árvore dos 5 Porquês em PDF"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700/80 dark:bg-[#141C29] dark:hover:bg-[#1A2436] text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Exportar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => exportar5PorquesExcel(problema)}
            title="Exportar Planilha Excel (.xlsx) dos 5 Porquês"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-600/30 dark:bg-[#121A26] dark:hover:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Selector of 5 Whys Chains if multiple exist */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Cadeia em Análise:
          </span>

          {problema.cadeias5Porques.length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              Nenhuma cadeia iniciada ainda. Selecione uma causa abaixo.
            </span>
          ) : (
            problema.cadeias5Porques.map((cad) => {
              const isAtiva = cadeiaAtiva?.id === cad.id;
              const temRaiz = cad.passos.some(p => p.isCausaRaiz);

              return (
                <button
                  key={cad.id}
                  onClick={() => onSelecionarCadeia(cad.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isAtiva
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cad.tituloCausaOrigem.slice(0, 32)}...</span>
                  {temRaiz && (
                    <Target className="w-3 h-3 text-amber-300 dark:text-amber-400" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Start new chain from validated cause */}
        {causasDisponiveis.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 hidden sm:inline">Desdobrar outra causa:</span>
            <select
              onChange={(e) => {
                const causaAlvo = causasDisponiveis.find(c => c.id === e.target.value);
                if (causaAlvo) onCriarNovaCadeia(causaAlvo);
              }}
              defaultValue=""
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="" disabled>Selecionar causa validada...</option>
              {causasDisponiveis.map(c => (
                <option key={c.id} value={c.id}>
                  [{ISHIKAWA_CATEGORIES[c.categoria].shortLabel}] {c.descricao.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Cascade Tree */}
      {!cadeiaAtiva ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <GitCommit className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Nenhuma cadeia dos 5 Porquês ativa
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Vá até a aba do <strong>Diagrama de Ishikawa</strong>, marque uma causa como <strong>Validada</strong> e clique em <strong>5 Porquês</strong> para iniciar o desdobramento vertical.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Origin Cause Card */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Ponto de Partida (Causa Validada no Ishikawa):
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-blue-200/80 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200 font-semibold">
                Eixo {ISHIKAWA_CATEGORIES[cadeiaAtiva.categoria6M].shortLabel}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {cadeiaAtiva.tituloCausaOrigem}
            </h3>
          </div>

          {/* Steps List */}
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:bottom-3 before:top-3 before:left-3 sm:before:left-4 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-950">
            <AnimatePresence initial={false}>
              {cadeiaAtiva.passos.map((passo, idx) => {
                const isUltimo = idx === cadeiaAtiva.passos.length - 1;
                const isSelected = passoSelecionadoId === passo.id;
                const isHovered = passoHoveredId === passo.id;
                const isFocado = passoFocadoId === passo.id;
                const isPaiDoNovoPasso = isFocandoNovoPasso && isUltimo;
                const isNodeAtivo = isSelected || isHovered || isFocado || isPaiDoNovoPasso;
                const existeNodeAtivo = passoSelecionadoId !== null || passoHoveredId !== null || passoFocadoId !== null || isFocandoNovoPasso;

                return (
                  <motion.div
                    key={passo.id}
                    layout
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{
                      opacity: existeNodeAtivo ? (isNodeAtivo ? 1.0 : 0.7) : 1.0,
                      scale: isNodeAtivo ? 1.018 : 1.0,
                      filter: isNodeAtivo ? 'brightness(1.08)' : existeNodeAtivo ? 'brightness(0.95)' : 'brightness(1.0)',
                      boxShadow: isSelected 
                        ? '0 8px 24px -4px rgba(59, 130, 246, 0.28), 0 0 0 2px rgba(59, 130, 246, 0.6)' 
                        : isNodeAtivo
                        ? '0 4px 16px -2px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.4)'
                        : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                    whileHover={{
                      scale: 1.018,
                      opacity: 1.0,
                      filter: 'brightness(1.05)',
                    }}
                    onMouseEnter={() => setPassoHoveredId(passo.id)}
                    onMouseLeave={() => setPassoHoveredId(null)}
                    onFocusCapture={() => setPassoFocadoId(passo.id)}
                    onBlurCapture={() => setPassoFocadoId(null)}
                    exit={{ opacity: 0, x: -30, scale: 0.92, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setPassoSelecionadoId(isSelected ? null : passo.id)}
                    className={`relative rounded-xl border p-4 transition-colors shadow-xs cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 dark:border-amber-400 dark:bg-amber-400/10 shadow-[0_0_16px_rgba(250,204,21,0.2)]'
                        : passo.isCausaRaiz
                        ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/30 dark:border-amber-400 dark:bg-amber-400/[0.08] shadow-[0_0_20px_rgba(250,204,21,0.2)]'
                        : 'border-slate-200/80 bg-white/80 dark:border-slate-700/60 dark:bg-[#111723]/80 backdrop-blur-md'
                    }`}
                  >
                    {/* Step Bullet Dot */}
                    <motion.div 
                      layout
                      className={`absolute -left-6 sm:-left-8 top-5 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full text-[11px] font-bold shadow-xs ${
                        passo.isCausaRaiz
                          ? 'bg-amber-400 text-slate-950 font-bold ring-4 ring-amber-400/30 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                          : isSelected
                          ? 'bg-slate-900 text-amber-400 ring-4 ring-amber-400/20'
                          : 'bg-slate-800 text-slate-100 dark:bg-[#182030] dark:text-amber-400 border border-slate-700'
                      }`}
                    >
                      {passo.ordem}
                    </motion.div>

                    {/* Step Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {passo.ordem}º Porquê
                        </span>
                        {passo.isCausaRaiz && (
                          <span className="inline-flex items-center gap-1 rounded-sm bg-amber-400 text-slate-950 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider shadow-xs">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Causa-Raiz</span>
                          </span>
                        )}
                        {isSelected && !passo.isCausaRaiz && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sm font-mono font-bold bg-amber-400/20 text-amber-800 dark:text-amber-300">
                            Foco
                          </span>
                        )}
                      </div>

                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3"
                      >
                        {/* Root Cause Toggle Button in Safety Yellow */}
                        <button
                          onClick={() => onMarcarCausaRaiz(cadeiaAtiva.id, passo.id, !passo.isCausaRaiz)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                            passo.isCausaRaiz
                              ? 'btn-safety-yellow shadow-[0_0_14px_rgba(250,204,21,0.35)]'
                              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700/80 dark:bg-[#161F2E] dark:text-slate-300 dark:hover:bg-[#1E293B]'
                          }`}
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>{passo.isCausaRaiz ? 'Causa-Raiz Confirmada' : 'Definir como Causa-Raiz'}</span>
                        </button>

                        <button
                          onClick={() => onExcluirPasso(cadeiaAtiva.id, passo.id)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-md transition-colors"
                          title="Remover este porquê"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question and Answer */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {passo.pergunta}
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-[#0E1420]/70 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        {passo.resposta}
                      </p>
                    </div>

                    {/* Physical Evidence */}
                    {passo.evidencia && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100/60 dark:bg-[#161F2E]/80 p-2 rounded-md border border-slate-200/50 dark:border-slate-800">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Evidência factual:</strong> {passo.evidencia}</span>
                      </div>
                    )}

                    {/* Direct Action Plan trigger if Root Cause is confirmed in Safety Yellow */}
                    <AnimatePresence>
                      {passo.isCausaRaiz && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pt-3 border-t border-amber-400/30 dark:border-amber-400/30 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-semibold">
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            <span>Causa fundamental identificada! Próximo passo: definir contramedida 5W2H.</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onIrParaPlanoAcao(passo.resposta, cadeiaAtiva.id);
                            }}
                            className="btn-safety-yellow flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs"
                          >
                            <span>Criar Ação Corretiva</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Form to add next Why step (up to 5 or more) */}
          <motion.div 
            animate={{
              boxShadow: isFocandoNovoPasso ? '0 0 20px -2px rgba(59, 130, 246, 0.22)' : 'none',
              borderColor: isFocandoNovoPasso ? 'rgba(59, 130, 246, 0.7)' : undefined,
            }}
            transition={{ duration: 0.25 }}
            onFocus={() => setIsFocandoNovoPasso(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsFocandoNovoPasso(false);
              }
            }}
            className="mt-6 rounded-xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800/80 dark:bg-[#0E1420]/85 backdrop-blur-md shadow-xs transition-colors"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-amber-500" />
              <span>Desdobrar {cadeiaAtiva.passos.length + 1}º Porquê</span>
            </h4>

            <form onSubmit={handleAdicionar} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Pergunta Investigativa:
                </label>
                <input
                  type="text"
                  placeholder={`Por que a condição do nível ${cadeiaAtiva.passos.length || 1} ocorreu?`}
                  value={novoPorQuePergunta}
                  onChange={(e) => setNovoPorQuePergunta(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-hidden dark:border-slate-700/70 dark:bg-[#121824] dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Resposta Técnica da Equipe:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explique o mecanismo físico ou falha de processo subjacente..."
                  value={novoPorQueResposta}
                  onChange={(e) => handleRespostaChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-hidden dark:border-slate-700/70 dark:bg-[#121824] dark:text-slate-100 resize-none"
                />
              </div>

              {alertaSintomaLocal && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-300 bg-amber-50 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{alertaSintomaLocal} Descreva a razão técnica do erro.</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Evidência Física Comprobatória (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Relatório de MOC nº 2024-118, foto da fissura, medição de pressão..."
                  value={novoPorQueEvidencia}
                  onChange={(e) => setNovoPorQueEvidencia(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-hidden dark:border-slate-700/70 dark:bg-[#121824] dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!novoPorQueResposta.trim()}
                  className="btn-safety-yellow flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Salvar {cadeiaAtiva.passos.length + 1}º Porquê</span>
                </button>
              </div>
            </form>
          </motion.div>

        </div>
      )}

    </div>
  );
};
