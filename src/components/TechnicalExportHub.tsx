/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  GitBranch, 
  GitCommit, 
  CheckSquare, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ProblemaOperacional } from '../types/leanRoot';
import { 
  exportarAtaTecnicaCompletaExcel, 
  exportarAtaTecnicaCompletaPdf,
  exportarIshikawaExcel,
  exportarIshikawaPdf,
  exportar5PorquesExcel,
  exportar5PorquesPdf,
  exportar5W2HExcel,
  exportar5W2HPdf,
  exportarMatrizAcoesConsolidadaExcel,
  exportarMatrizAcoesConsolidadaPdf
} from '../services/technicalExportService';
import { exportarAtaParaPdf } from '../services/pdfExportService';

interface TechnicalExportHubProps {
  problemas: ProblemaOperacional[];
  problemaAtivo: ProblemaOperacional | undefined;
  onSelecionarProblema: (id: string) => void;
  onNavegarParaInvestigacao: () => void;
  onToast: (msg: string) => void;
}

export const TechnicalExportHub: React.FC<TechnicalExportHubProps> = ({
  problemas,
  problemaAtivo,
  onSelecionarProblema,
  onNavegarParaInvestigacao,
  onToast,
}) => {
  const [exportando, setExportando] = useState<string | null>(null);

  const executarExportacao = (id: string, funcao: () => void, mensagem: string) => {
    setExportando(id);
    try {
      funcao();
      onToast(mensagem);
    } catch (e) {
      console.error(e);
      onToast('Erro ao gerar documento para exportação.');
    } finally {
      setTimeout(() => setExportando(null), 600);
    }
  };

  if (!problemaAtivo && problemas.length === 0) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="max-w-md text-center p-8 bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Layers className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Nenhum Registro Disponível</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cadastre uma anomalia para desbloquear a central de relatórios de engenharia.</p>
        </div>
      </div>
    );
  }

  const problemaAtual = problemaAtivo || problemas[0];
  const temCausaRaiz = problemaAtual.cadeias5Porques.some(c => c.passos.some(p => p.isCausaRaiz));
  const totalCausas6M = problemaAtual.causas6M.length;
  const totalAcoes = problemaAtual.acoes.length;
  const acoesConcluidas = problemaAtual.acoes.filter(a => a.status === 'concluido').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
      
      {/* Top Banner de Engenharia */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 dark:border-slate-800/80 dark:bg-[#0E1420]/90 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CENTRAL TÉCNICA DE EXPORTAÇÃO (ISO / IATF / 8D)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Exportação Granular & Dossiês Completos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Gere documentos oficiais de engenharia tanto em <strong>formato PDF estruturado para impressão A4</strong> quanto em <strong>planilhas nativas Excel (.xlsx)</strong> para auditorias, prestação de contas com clientes e integração no ERP.
            </p>
          </div>

          {/* Seletor de Ocorrência em Análise */}
          <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 dark:bg-[#141C29] p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="text-xs">
              <label htmlFor="export-hub-problem-selector" className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-slate-500 block">
                Ocorrência em Foco
              </label>
              <select
                id="export-hub-problem-selector"
                value={problemaAtual.id}
                onChange={(e) => onSelecionarProblema(e.target.value)}
                className="mt-1 bg-white dark:bg-[#0C1019] text-xs font-bold text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {problemas.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.titulo.substring(0, 32)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onNavegarParaInvestigacao}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
            >
              <span>Abrir Mesa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Diagnóstico de Auditoria e Resumo da Ocorrência Selecionada */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#121824]/70 border border-slate-200/80 dark:border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block">Ocorrência</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">
              {problemaAtual.codigo} · {problemaAtual.titulo}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {problemaAtual.linha} ({problemaAtual.equipamento})
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#121824]/70 border border-slate-200/80 dark:border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block">Cobertura 6M</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">{totalCausas6M}</span>
              <span className="text-xs text-slate-500">hipóteses cadastradas</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
              {problemaAtual.causas6M.filter(c => c.status === 'validada').length} hipóteses validadas
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#121824]/70 border border-slate-200/80 dark:border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block">Causa-Raiz (5 Porquês)</span>
            <div className="flex items-center gap-1.5 mt-1">
              {temCausaRaiz ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Confirmada & Travada</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Em Investigação</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {problemaAtual.cadeias5Porques.length} cadeia(s) mapeada(s)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#121824]/70 border border-slate-200/80 dark:border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block">Plano 5W2H</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">{totalAcoes}</span>
              <span className="text-xs text-slate-500">ações cadastradas</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {acoesConcluidas} concluídas ({totalAcoes > 0 ? Math.round((acoesConcluidas / totalAcoes) * 100) : 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Exportação Individual & Dossiê Completo */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Relatórios Oficiais da Ocorrência Ativa</span>
          <span className="font-mono text-xs text-amber-500 dark:text-amber-400 font-semibold">[{problemaAtual.codigo}]</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* CARD 1: ATA TÉCNICA COMPLETA (8D / A3) */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 dark:border-amber-400/40 bg-gradient-to-br from-amber-50/40 via-white to-white dark:from-[#151D2A] dark:via-[#0F1522] dark:to-[#0A0E17] p-6 shadow-md transition-all hover:border-amber-400">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3">
              <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg shadow-sm">
                <Award className="w-3 h-3" />
                Padrão Completo 8D
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                <FileText className="w-7 h-7" />
              </div>
              <div className="flex-1 pr-12">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Ata Técnica Completa (Relatório 8D / A3)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Dossiê completo contendo metadados industriais, descrição factual, matriz Ishikawa 6M, árvore dos 5 Porquês com causa-raiz, plano de ação 5W2H e campos de homologação.
                </p>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800">
                  <button
                    onClick={() => executarExportacao('ata-completa-pdf', () => exportarAtaTecnicaCompletaPdf(problemaAtual), 'PDF da Ata Técnica Completa baixado com sucesso!')}
                    disabled={exportando === 'ata-completa-pdf'}
                    className="btn-safety-yellow flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PDF (8D Completo)</span>
                  </button>

                  <button
                    onClick={() => executarExportacao('ata-completa-excel', () => exportarAtaTecnicaCompletaExcel(problemaAtual), 'Planilha Excel da Ata Técnica Completa gerada com sucesso!')}
                    disabled={exportando === 'ata-completa-excel'}
                    className="flex items-center gap-2 rounded-lg border border-emerald-600/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40 px-4 py-2 text-xs font-bold transition-all shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Baixar Excel (.xlsx com 4 abas)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: DIAGRAMA DE ISHIKAWA 6M (INDIVIDUAL) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1420] p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <GitBranch className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Diagrama de Ishikawa (6M) Individual
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {totalCausas6M} hipóteses
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Exporta exclusivamente o diagrama de causa e efeito categorizado nos 6 eixos, com o status das hipóteses, alertas de sintoma e evidências registradas.
                </p>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => executarExportacao('ishikawa-pdf', () => exportarIshikawaPdf(problemaAtual), 'PDF do Diagrama de Ishikawa baixado com sucesso!')}
                    disabled={exportando === 'ishikawa-pdf'}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#161F2E] dark:hover:bg-[#1C273B] text-slate-800 dark:text-slate-200 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>PDF Ishikawa</span>
                  </button>

                  <button
                    onClick={() => executarExportacao('ishikawa-excel', () => exportarIshikawaExcel(problemaAtual), 'Planilha Excel do Ishikawa gerada com sucesso!')}
                    disabled={exportando === 'ishikawa-excel'}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-white hover:bg-emerald-50 dark:border-emerald-600/30 dark:bg-[#121A26] dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Excel (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: ÁRVORE DOS 5 PORQUÊS & CAUSA-RAIZ (INDIVIDUAL) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1420] p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <GitCommit className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Árvore dos 5 Porquês & Causa-Raiz Individual
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {problemaAtual.cadeias5Porques.length} cadeias
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Exporta a sequência investigativa vertical do 1º ao 5º porquê com perguntas, fatos comprovados e destaque explícito da Causa-Raiz confirmada.
                </p>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => executarExportacao('porques-pdf', () => exportar5PorquesPdf(problemaAtual), 'PDF dos 5 Porquês baixado com sucesso!')}
                    disabled={exportando === 'porques-pdf'}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#161F2E] dark:hover:bg-[#1C273B] text-slate-800 dark:text-slate-200 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-500" />
                    <span>PDF 5 Porquês</span>
                  </button>

                  <button
                    onClick={() => executarExportacao('porques-excel', () => exportar5PorquesExcel(problemaAtual), 'Planilha Excel dos 5 Porquês gerada com sucesso!')}
                    disabled={exportando === 'porques-excel'}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-white hover:bg-emerald-50 dark:border-emerald-600/30 dark:bg-[#121A26] dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Excel (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: PLANO DE AÇÃO 5W2H (INDIVIDUAL) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1420] p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Plano de Ação 5W2H Individual
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {totalAcoes} ações
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Exporta a matriz de ações de contenção e ações corretivas definitivas, com responsáveis, prazos de execução e critérios de verificação de eficácia.
                </p>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => executarExportacao('5w2h-pdf', () => exportar5W2HPdf(problemaAtual), 'PDF do Plano 5W2H baixado com sucesso!')}
                    disabled={exportando === '5w2h-pdf'}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#161F2E] dark:hover:bg-[#1C273B] text-slate-800 dark:text-slate-200 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-500" />
                    <span>PDF 5W2H</span>
                  </button>

                  <button
                    onClick={() => executarExportacao('5w2h-excel', () => exportar5W2HExcel(problemaAtual), 'Planilha Excel do Plano 5W2H gerada com sucesso!')}
                    disabled={exportando === '5w2h-excel'}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-white hover:bg-emerald-50 dark:border-emerald-600/30 dark:bg-[#121A26] dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Excel (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 5: ATA DE REUNIÃO RESUMIDA */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1420] p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Ata de Reunião de Alinhamento
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {problemaAtual.data}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Documento formal da sessão de RCA com lista de participantes, apontamentos do facilitador, síntese e ata executiva para arquivamento.
                </p>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => executarExportacao('ata-reuniao-pdf', () => exportarAtaParaPdf(problemaAtual), 'PDF da Ata de Reunião gerado!')}
                    disabled={exportando === 'ata-reuniao-pdf'}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#161F2E] dark:hover:bg-[#1C273B] text-slate-800 dark:text-slate-200 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>PDF Ata Reunião</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 6: MATRIZ CONSOLIDADA DA FÁBRICA */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1420] p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Matriz Consolidada da Planta (Todas as Ações)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold">
                    {problemas.length} ocorrências
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Consolida todas as contramedidas de todas as ocorrências da fábrica em uma única visão integrada de gestão para comitês gerenciais.
                </p>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => executarExportacao('matriz-planta-pdf', () => exportarMatrizAcoesConsolidadaPdf(problemas), 'PDF da Matriz Consolidada da Fábrica baixado!')}
                    disabled={exportando === 'matriz-planta-pdf'}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#161F2E] dark:hover:bg-[#1C273B] text-slate-800 dark:text-slate-200 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-500" />
                    <span>PDF Paisagem Planta</span>
                  </button>

                  <button
                    onClick={() => executarExportacao('matriz-planta-excel', () => exportarMatrizAcoesConsolidadaExcel(problemas), 'Planilha Excel de todas as ações da planta baixada!')}
                    disabled={exportando === 'matriz-planta-excel'}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-white hover:bg-emerald-50 dark:border-emerald-600/30 dark:bg-[#121A26] dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Excel (.xlsx) Planta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
