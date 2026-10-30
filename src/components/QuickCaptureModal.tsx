/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  X, 
  Check, 
  Clock, 
  Wrench, 
  MapPin, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { TurnoTrabalho } from '../types/leanRoot';

interface QuickCaptureModalProps {
  onSalvar: (dados: {
    titulo: string;
    linha: string;
    equipamento: string;
    descricao: string;
    turno: TurnoTrabalho;
    facilitador: string;
    abrirImediatamente: boolean;
  }) => void;
  onFechar: () => void;
  linhasSugeridas?: string[];
  equipamentosSugeridos?: string[];
}

const TURNOS: TurnoTrabalho[] = [
  '1º Turno',
  '2º Turno',
  '3º Turno',
  'Turno Administrativo',
  'Revezamento',
];

function obterTurnoAtual(): TurnoTrabalho {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 14) return '1º Turno';
  if (hora >= 14 && hora < 22) return '2º Turno';
  return '3º Turno';
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  onSalvar,
  onFechar,
  linhasSugeridas = [],
  equipamentosSugeridos = [],
}) => {
  const tituloInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState('');
  const [linha, setLinha] = useState(linhasSugeridas[0] || '');
  const [equipamento, setEquipamento] = useState(equipamentosSugeridos[0] || '');
  const [descricao, setDescricao] = useState('');
  const [turno, setTurno] = useState<TurnoTrabalho>(obterTurnoAtual());
  const [facilitador, setFacilitador] = useState('Líder de Linha');
  const [abrirImediatamente, setAbrirImediatamente] = useState(false);

  // Auto-foco imediato no campo do título
  useEffect(() => {
    tituloInputRef.current?.focus();
  }, []);

  // Atalhos de teclado no modal: Esc para fechar, Ctrl+Enter para salvar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onFechar();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executarEnvio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const executarEnvio = () => {
    if (!titulo.trim() || !linha.trim() || !equipamento.trim()) return;

    onSalvar({
      titulo: titulo.trim(),
      linha: linha.trim(),
      equipamento: equipamento.trim(),
      descricao: descricao.trim() || `Anomalia reportada na linha ${linha} para o equipamento ${equipamento}. Aguardando sessão de investigação técnica.`,
      turno,
      facilitador: facilitador.trim() || 'Líder de Turno',
      abrirImediatamente,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executarEnvio();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-slate-300/80 bg-white shadow-2xl dark:border-slate-700/70 dark:bg-[#0E141F]/95 backdrop-blur-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Quick-Banner */}
        <div className="bg-amber-400 text-[#080C13] px-5 py-2 flex items-center justify-between text-xs font-bold tracking-wide border-b border-amber-300">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-current text-[#080C13]" />
            <span className="uppercase font-mono text-[11px] font-black">Captura Rápida de Anomalia</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#080C13]/80 font-mono">
            <span>Atalho:</span>
            <kbd className="bg-black/15 px-1.5 py-0.5 rounded font-mono text-[10px] text-[#080C13] font-semibold">Ctrl+Enter</kbd>
            <kbd className="bg-black/15 px-1.5 py-0.5 rounded font-mono text-[10px] text-[#080C13] font-semibold">Esc</kbd>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Registrar Ocorrência em Segundos</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Salve os dados preliminares agora para análise socrática posterior sem interromper o fluxo da linha.
              </p>
            </div>
            <button
              onClick={onFechar}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Main Title (Autofocused) */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1 flex items-center justify-between">
                <span>O que ocorreu? (Título da Falha): *</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Obrigatório</span>
              </label>
              <input
                ref={tituloInputRef}
                type="text"
                required
                placeholder="Ex.: Parada brusca com vibração anormal no eixo Z"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 shadow-2xs"
              />
            </div>

            {/* Line & Equipment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Linha / Célula: *</span>
                </label>
                <input
                  type="text"
                  required
                  list="linhas-sugeridas"
                  placeholder="Ex.: Linha 03"
                  value={linha}
                  onChange={(e) => setLinha(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                {linhasSugeridas.length > 0 && (
                  <datalist id="linhas-sugeridas">
                    {linhasSugeridas.map((l, i) => (
                      <option key={i} value={l} />
                    ))}
                  </datalist>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  <span>Equipamento / Máquina: *</span>
                </label>
                <input
                  type="text"
                  required
                  list="equipamentos-sugeridos"
                  placeholder="Ex.: Prensa Hidráulica P-02"
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                {equipamentosSugeridos.length > 0 && (
                  <datalist id="equipamentos-sugeridos">
                    {equipamentosSugeridos.map((eq, i) => (
                      <option key={i} value={eq} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            {/* Shift & Responsible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Turno Atual:</span>
                </label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value as TurnoTrabalho)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {TURNOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Responsável pelo Registro:
                </label>
                <input
                  type="text"
                  value={facilitador}
                  onChange={(e) => setFacilitador(e.target.value)}
                  placeholder="Nome do líder"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Quick Observations / Symptoms */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Sintomas Observados / Evidência Rápida (opcional):
              </label>
              <textarea
                rows={2}
                placeholder="Ex.: Alarme de erro #304 no painel. Vazamento sutil de óleo hidráulico no retentor..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
              />
            </div>

            {/* Workflow Navigation Option */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={abrirImediatamente}
                  onChange={(e) => setAbrirImediatamente(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>Abrir e iniciar análise imediatamente agora (ao invés de manter na fila)</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic hidden sm:inline">
                A ocorrência entrará na fila com status "Em Investigação"
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onFechar}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!titulo.trim() || !linha.trim() || !equipamento.trim()}
                  className="btn-safety-yellow flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Anomalia [Ctrl+Enter]</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
