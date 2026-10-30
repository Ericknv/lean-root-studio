/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  tituloProblema: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  tituloProblema,
  onConfirmar,
  onCancelar,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white/95 p-6 shadow-2xl dark:border-red-900/60 dark:bg-[#0E141F]/95 backdrop-blur-xl">
        
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Confirmar Exclusão de Ocorrência
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tem certeza de que deseja excluir permanentemente a ocorrência:
            </p>
            <div className="mt-1.5 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100">
              "{tituloProblema}"
            </div>
            <p className="text-[11px] text-red-600 dark:text-red-400 mt-2">
              Esta ação removerá todas as causas do Ishikawa, a árvore dos 5 Porquês e as ações vinculadas. Não será possível desfazer.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onConfirmar}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirmar Exclusão</span>
          </button>
        </div>

      </div>
    </div>
  );
};
