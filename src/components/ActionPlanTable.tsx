/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Check, 
  Filter 
} from 'lucide-react';
import { 
  ItemPlanoAcao, 
  TipoAcao, 
  StatusAcao, 
  ProblemaOperacional 
} from '../types/leanRoot';
import { exportar5W2HExcel, exportar5W2HPdf } from '../services/technicalExportService';
import { FileSpreadsheet, FileText } from 'lucide-react';

interface ActionPlanTableProps {
  problema: ProblemaOperacional;
  onAdicionarAcao: (acao: Omit<ItemPlanoAcao, 'id'>) => void;
  onAtualizarAcao: (id: string, campos: Partial<ItemPlanoAcao>) => void;
  onExcluirAcao: (id: string) => void;
  causaSugeridaTexto?: string;
}

export const ActionPlanTable: React.FC<ActionPlanTableProps> = ({
  problema,
  onAdicionarAcao,
  onAtualizarAcao,
  onExcluirAcao,
  causaSugeridaTexto,
}) => {
  const [mostrarModalNova, setMostrarModalNova] = useState(!!causaSugeridaTexto);
  const [tipo, setTipo] = useState<TipoAcao>('corretiva');
  const [descricao, setDescricao] = useState(causaSugeridaTexto ? `Eliminar causa-raiz: ${causaSugeridaTexto}` : '');
  const [responsavel, setResponsavel] = useState(problema.facilitador || '');
  const [prazo, setPrazo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [comoVerificarEficacia, setComoVerificarEficacia] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'contencao' | 'corretiva'>('todos');

  const acoesFiltradas = problema.acoes.filter(a => {
    if (filtroTipo === 'todos') return true;
    return a.tipo === filtroTipo;
  });

  const temCausaRaiz = problema.cadeias5Porques.some(c => c.passos.some(p => p.isCausaRaiz));
  const temAcaoCorretiva = problema.acoes.some(a => a.tipo === 'corretiva');
  const avisoFaltaAcaoCorretiva = temCausaRaiz && !temAcaoCorretiva;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !responsavel.trim()) return;

    onAdicionarAcao({
      tipo,
      descricao: descricao.trim(),
      responsavel: responsavel.trim(),
      prazo,
      status: 'pendente',
      comoVerificarEficacia: comoVerificarEficacia.trim() || 'Auditoria de acompanhamento após implementação.',
    });

    setDescricao('');
    setComoVerificarEficacia('');
    setMostrarModalNova(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-[#0E1420]/85 backdrop-blur-md shadow-xs">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Plano de Ação 5W2H (Contenção & Correção)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            D3 (Contenção Imediata para Estancar o Efeito) e D5 (Ação Corretiva para Eliminar a Causa-Raiz)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botões de Exportação 5W2H */}
          <button
            type="button"
            onClick={() => exportar5W2HPdf(problema)}
            title="Exportar Plano 5W2H em PDF"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700/80 dark:bg-[#141C29] dark:hover:bg-[#1A2436] text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            <span>Exportar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => exportar5W2HExcel(problema)}
            title="Exportar Planilha Excel (.xlsx) do Plano 5W2H"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-600/30 dark:bg-[#121A26] dark:hover:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar Excel (.xlsx)</span>
          </button>
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#121824] rounded-lg text-xs border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filtroTipo === 'todos'
                  ? 'bg-slate-900 text-white shadow-2xs dark:bg-[#182030] dark:text-amber-400 dark:border dark:border-amber-400/30 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todas ({problema.acoes.length})
            </button>
            <button
              onClick={() => setFiltroTipo('contencao')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filtroTipo === 'contencao'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Contenção
            </button>
            <button
              onClick={() => setFiltroTipo('corretiva')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filtroTipo === 'corretiva'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(250,204,21,0.25)]'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Corretivas
            </button>
          </div>

          <button
            onClick={() => setMostrarModalNova(true)}
            className="btn-safety-yellow flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Ação</span>
          </button>
        </div>
      </div>

      {/* Warning if Root Cause without Corrective Action */}
      {avisoFaltaAcaoCorretiva && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 dark:bg-amber-400/[0.08] p-4 text-xs text-amber-900 dark:text-amber-200 shadow-[0_0_16px_rgba(250,204,21,0.12)]">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">
              Atenção: Causa-Raiz sem Ação Corretiva
            </h4>
            <p>
              A equipe identificou uma causa-raiz nos 5 Porquês, mas não há nenhuma <strong>Ação Corretiva sistêmica</strong> cadastrada. Ações de contenção apenas estancam a sangria; cadastre uma contramedida definitiva (Poka-Yoke, parametrização ou procedimento) para garantir que a falha não retorne.
            </p>
          </div>
        </div>
      )}

      {/* Actions Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-[#0A0E17]/85 backdrop-blur-md overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider dark:bg-[#121824]/90 dark:border-slate-800 text-[11px] font-mono">
              <tr>
                <th className="px-4 py-3 font-semibold w-28">Tipo</th>
                <th className="px-4 py-3 font-semibold">Ação / O que será feito</th>
                <th className="px-4 py-3 font-semibold w-36">Responsável</th>
                <th className="px-4 py-3 font-semibold w-28">Prazo</th>
                <th className="px-4 py-3 font-semibold w-36">Status</th>
                <th className="px-4 py-3 font-semibold">Verificação de Eficácia</th>
                <th className="px-4 py-3 font-semibold w-16 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {acoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                    Nenhuma ação cadastrada para este filtro. Clique em "+ Nova Ação" acima.
                  </td>
                </tr>
              ) : (
                acoesFiltradas.map((acao) => {
                  const isContencao = acao.tipo === 'contencao';

                  return (
                    <tr 
                      key={acao.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Tipo */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span 
                          className={`inline-block font-bold text-[10.5px] px-2 py-0.5 rounded-sm ${
                            isContencao
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {isContencao ? 'Contenção' : 'Corretiva'}
                        </span>
                      </td>

                      {/* Descricao */}
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 max-w-xs md:max-w-md">
                        {acao.descricao}
                      </td>

                      {/* Responsavel */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {acao.responsavel}
                      </td>

                      {/* Prazo */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {acao.prazo}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={acao.status}
                          onChange={(e) => onAtualizarAcao(acao.id, { status: e.target.value as StatusAcao })}
                          className={`rounded-md border text-[11px] font-semibold px-2 py-1 focus:outline-hidden ${
                            acao.status === 'concluido'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : acao.status === 'em_andamento'
                              ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="em_andamento">Em Andamento</option>
                          <option value="concluido">Concluído</option>
                        </select>
                      </td>

                      {/* Como Verificar */}
                      <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                        {acao.comoVerificarEficacia}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => onExcluirAcao(acao.id)}
                          title="Excluir ação"
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Form to add new action */}
      {mostrarModalNova && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              Cadastrar Nova Ação 5W2H
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Classificação da Ação:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipo('contencao')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-left ${
                      tipo === 'contencao'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 ring-2 ring-amber-500/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>Contenção (Imediata)</div>
                    <div className="text-[10px] font-normal text-slate-500">Estancar o problema no turno</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipo('corretiva')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-left ${
                      tipo === 'corretiva'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>Corretiva (Sistêmica)</div>
                    <div className="text-[10px] font-normal text-slate-500">Eliminar a causa-raiz (Poka-Yoke)</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  O que será feito (Descrição da Ação):
                </label>
                <textarea
                  required
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva a ação de forma clara e mensurável..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Quem (Responsável):
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    placeholder="Nome e área (ex.: Eng. Carlos)"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Quando (Prazo Limite):
                  </label>
                  <input
                    type="date"
                    required
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Como Verificar a Eficácia (Critério de Sucesso):
                </label>
                <input
                  type="text"
                  value={comoVerificarEficacia}
                  onChange={(e) => setComoVerificarEficacia(e.target.value)}
                  placeholder="Ex.: Auditoria de 30 dias sem nova ocorrência, medição de pressão..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMostrarModalNova(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-safety-yellow flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold"
                >
                  Salvar Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
