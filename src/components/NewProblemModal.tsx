/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Layers, PlusCircle, Check } from 'lucide-react';
import { ProblemaOperacional, TurnoTrabalho } from '../types/leanRoot';

interface NewProblemModalProps {
  problemaParaEditar?: ProblemaOperacional;
  onSalvar: (problema: Partial<ProblemaOperacional>) => void;
  onFechar: () => void;
}

const TURNOS: TurnoTrabalho[] = [
  '1º Turno',
  '2º Turno',
  '3º Turno',
  'Turno Administrativo',
  'Revezamento',
];

export const NewProblemModal: React.FC<NewProblemModalProps> = ({
  problemaParaEditar,
  onSalvar,
  onFechar,
}) => {
  const isEdicao = !!problemaParaEditar;

  const [codigo, setCodigo] = useState(
    problemaParaEditar?.codigo || `RCA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [titulo, setTitulo] = useState(problemaParaEditar?.titulo || '');
  const [descricao, setDescricao] = useState(problemaParaEditar?.descricao || '');
  const [linha, setLinha] = useState(problemaParaEditar?.linha || '');
  const [equipamento, setEquipamento] = useState(problemaParaEditar?.equipamento || '');
  const [data, setData] = useState(
    problemaParaEditar?.data || new Date().toISOString().split('T')[0]
  );
  const [turno, setTurno] = useState<TurnoTrabalho>(problemaParaEditar?.turno || '1º Turno');
  const [facilitador, setFacilitador] = useState(problemaParaEditar?.facilitador || '');
  const [equipeParticipante, setEquipeParticipante] = useState(
    problemaParaEditar?.equipeParticipante || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !linha.trim() || !equipamento.trim()) return;

    onSalvar({
      codigo: codigo.trim(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      linha: linha.trim(),
      equipamento: equipamento.trim(),
      data,
      turno,
      facilitador: facilitador.trim() || 'Facilitador Lean',
      equipeParticipante: equipeParticipante.trim(),
    });

    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-300/80 bg-white/95 p-6 shadow-2xl dark:border-slate-700/70 dark:bg-[#0E141F]/95 backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-500 border border-amber-400/25">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isEdicao ? 'Editar Ocorrência Operacional' : 'Cadastrar Nova Ocorrência Operacional'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informações de contexto para início da investigação metódica
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Código / Tag da Ocorrência:
              </label>
              <input
                type="text"
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Data do Incidente:
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Turno de Trabalho:
              </label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value as TurnoTrabalho)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {TURNOS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Título da Ocorrência / Falha:
            </label>
            <input
              type="text"
              required
              placeholder="Ex.: Sobreaquecimento e travamento do fuso CNC-04"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Linha / Célula Afetada:
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: Linha 02 - Usinagem de Blocos"
                value={linha}
                onChange={(e) => setLinha(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Equipamento / Máquina / Tag:
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: Centro de Usinagem CNC-04 (Tag USIN-H04)"
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Descrição Factual do Evento & Impacto Operacional:
            </label>
            <textarea
              rows={3}
              required
              placeholder="Descreva o que ocorreu no momento da anomalia, sintomas observados, paradas de linha geradas e peças refugadas..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Facilitador da Análise (Engenharia / Qualidade):
              </label>
              <input
                type="text"
                placeholder="Ex.: Eng. Roberto Albuquerque"
                value={facilitador}
                onChange={(e) => setFacilitador(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Equipe Participante:
              </label>
              <input
                type="text"
                placeholder="Ex.: Carlos M. (Produção), Denise S. (Manutenção)"
                value={equipeParticipante}
                onChange={(e) => setEquipeParticipante(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-safety-yellow flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEdicao ? 'Salvar Alterações' : 'Iniciar Investigação'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
