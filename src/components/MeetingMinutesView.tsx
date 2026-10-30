/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { ProblemaOperacional, ISHIKAWA_CATEGORIES } from '../types/leanRoot';
import { exportarAtaParaPdf } from '../services/pdfExportService';

interface MeetingMinutesViewProps {
  problema: ProblemaOperacional;
  onFechar: () => void;
}

export const MeetingMinutesView: React.FC<MeetingMinutesViewProps> = ({
  problema,
  onFechar,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const handleBaixarPdf = () => {
    try {
      setGerandoPdf(true);
      exportarAtaParaPdf(problema);
    } catch (err) {
      console.error('Falha ao gerar documento PDF com jsPDF:', err);
    } finally {
      setTimeout(() => setGerandoPdf(false), 500);
    }
  };

  // Gera texto estruturado para envio por e-mail, ERP ou Teams
  const gerarTextoEstruturado = (): string => {
    let t = `===========================================================\n`;
    t += `ATA CONSOLIDADA DE ANÁLISE DE CAUSA-RAIZ (LEANROOT)\n`;
    t += `===========================================================\n`;
    t += `Código: ${problema.codigo}\n`;
    t += `Título: ${problema.titulo}\n`;
    t += `Linha: ${problema.linha} | Equipamento: ${problema.equipamento}\n`;
    t += `Data: ${problema.data} | Turno: ${problema.turno}\n`;
    t += `Facilitador: ${problema.facilitador}\n`;
    t += `Equipe: ${problema.equipeParticipante || 'N/A'}\n`;
    t += `Status PDCA: ${problema.status.toUpperCase()}\n\n`;

    t += `1. DESCRIÇÃO FACTUAL DO EVENTO:\n`;
    t += `${problema.descricao}\n\n`;

    t += `2. DIAGRAMA DE ISHIKAWA (HIPÓTESES 6M):\n`;
    for (const [key, info] of Object.entries(ISHIKAWA_CATEGORIES)) {
      const causas = problema.causas6M.filter(c => c.categoria === key);
      t += `[${info.shortLabel.toUpperCase()}]:\n`;
      if (causas.length === 0) {
        t += `  - Nenhuma causa apontada.\n`;
      } else {
        causas.forEach(c => {
          t += `  - [${c.status.toUpperCase()}] ${c.descricao}`;
          if (c.evidencia) t += ` (Evidência: ${c.evidencia})`;
          t += `\n`;
        });
      }
    }
    t += `\n`;

    t += `3. DESDOBRAMENTO DOS 5 PORQUÊS:\n`;
    if (problema.cadeias5Porques.length === 0) {
      t += `  Nenhuma cadeia registrada.\n`;
    } else {
      problema.cadeias5Porques.forEach((cad, idx) => {
        t += `Cadeia #${idx + 1} - Origem: ${cad.tituloCausaOrigem}\n`;
        cad.passos.forEach(p => {
          t += `  ${p.ordem}º Por quê: ${p.pergunta}\n`;
          t += `     Resposta: ${p.resposta}`;
          if (p.isCausaRaiz) t += `  [CAUSA-RAIZ CONFIRMADA]`;
          if (p.evidencia) t += `  (Evidência: ${p.evidencia})`;
          t += `\n`;
        });
      });
    }
    t += `\n`;

    t += `4. PLANO DE AÇÃO 5W2H (CONTENÇÃO & CORREÇÃO):\n`;
    if (problema.acoes.length === 0) {
      t += `  Nenhuma ação registrada.\n`;
    } else {
      problema.acoes.forEach((a, idx) => {
        t += `#${idx + 1} [${a.tipo.toUpperCase()}] ${a.descricao}\n`;
        t += `   Responsável: ${a.responsavel} | Prazo: ${a.prazo} | Status: ${a.status.toUpperCase()}\n`;
        t += `   Eficácia: ${a.comoVerificarEficacia}\n`;
      });
    }
    t += `\n===========================================================\n`;
    t += `Relatório gerado automaticamente via LeanRoot em ${new Date().toLocaleDateString('pt-BR')}\n`;
    return t;
  };

  const handleCopiarTexto = () => {
    const texto = gerarTextoEstruturado();
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 sm:p-6 backdrop-blur-md flex justify-center items-start">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-[#0E141F]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 my-6 overflow-hidden">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#0E141F]/95">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Ata Consolidada de Análise de Falhas (A4)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopiarTexto}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleBaixarPdf}
              disabled={gerandoPdf}
              className="btn-safety-yellow flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all disabled:opacity-50"
              title="Gerar e fazer download do arquivo PDF formatado A4 (jsPDF)"
            >
              <Download className="w-4 h-4" />
              <span>{gerandoPdf ? 'Gerando PDF...' : 'Baixar PDF'}</span>
            </button>

            <button
              onClick={handleImprimir}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onFechar}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document Content */}
        <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900">
          
          {/* Document Header (ISO / IATF Standard) */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-blue-700">
                  SISTEMA DE GESTÃO DA QUALIDADE & MELHORIA CONTÍNUA
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-1">
                  ATA DE ANÁLISE DE CAUSA-RAIZ (RCA / 8D)
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Resolução Sistemática de Problemas Industriais e Contramedidas 5W2H
                </p>
              </div>

              <div className="text-right border border-slate-300 p-2 rounded-sm bg-slate-50 text-[11px]">
                <div className="font-bold text-slate-900">DOC: {problema.codigo}</div>
                <div className="text-slate-500">Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                <div className="text-slate-500">Revisão: 01 (Final)</div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Equipamento:</span>
                <span className="font-bold">{problema.equipamento}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Linha / Área:</span>
                <span className="font-semibold">{problema.linha}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Data do Evento & Turno:</span>
                <span className="font-semibold">{problema.data} · {problema.turno}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Facilitador Lean:</span>
                <span className="font-bold">{problema.facilitador}</span>
              </div>
            </div>

            {problema.equipeParticipante && (
              <div className="mt-2 text-xs text-slate-600">
                <span className="font-bold text-slate-700">Equipe Técnica Participante:</span> {problema.equipeParticipante}
              </div>
            )}
          </div>

          {/* Section 1: Problem Definition */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              1. Descrição Factual do Evento (O Quê, Onde, Impacto)
            </h2>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs leading-relaxed text-slate-800">
              <strong className="block text-slate-950 mb-1">{problema.titulo}</strong>
              {problema.descricao}
            </div>
          </div>

          {/* Section 2: Ishikawa 6M Hypotheses */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              2. Matriz de Investigação - Diagrama de Ishikawa (6M)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(ISHIKAWA_CATEGORIES).map(([catKey, info]) => {
                const causas = problema.causas6M.filter(c => c.categoria === catKey);

                return (
                  <div key={catKey} className="border border-slate-200 rounded-md p-2.5 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 pb-1 border-b border-slate-200">
                      <span>{info.name}</span>
                      <span className="text-[10px] text-slate-500">{causas.length} causa(s)</span>
                    </div>

                    <ul className="mt-1.5 space-y-1 text-xs">
                      {causas.length === 0 ? (
                        <li className="text-[11px] text-slate-400 italic">Nenhum fator anômalo registrado.</li>
                      ) : (
                        causas.map(c => (
                          <li key={c.id} className="text-[11px] text-slate-800 flex items-start gap-1">
                            <span className="font-bold text-blue-700">· [{c.status.toUpperCase()}]:</span>
                            <span>{c.descricao}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: 5 Whys Chains & Root Cause */}
          <div className="page-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              3. Desdobramento Vertical dos 5 Porquês & Causa-Raiz
            </h2>

            {problema.cadeias5Porques.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhuma cadeia dos 5 Porquês foi cadastrada.</p>
            ) : (
              problema.cadeias5Porques.map((cad, idx) => (
                <div key={cad.id} className="mb-4 border border-slate-200 rounded-md p-3 bg-slate-50/70">
                  <div className="text-xs font-bold text-blue-900 mb-2">
                    Cadeia #{idx + 1}: Origem em "{cad.tituloCausaOrigem}" ({ISHIKAWA_CATEGORIES[cad.categoria6M].shortLabel})
                  </div>

                  <div className="space-y-2">
                    {cad.passos.map(p => (
                      <div 
                        key={p.id}
                        className={`text-xs p-2 rounded-sm border ${
                          p.isCausaRaiz 
                            ? 'bg-blue-100/70 border-blue-400 font-semibold' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700">{p.ordem}º Porquê: {p.pergunta}</span>
                          {p.isCausaRaiz && (
                            <span className="bg-blue-700 text-white text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase">
                              Causa-Raiz Confirmada
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-slate-900">
                          Resposta: {p.resposta}
                        </div>
                        {p.evidencia && (
                          <div className="mt-1 text-[10.5px] text-slate-600 italic">
                            Evidência: {p.evidencia}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section 4: Action Plan 5W2H */}
          <div className="page-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              4. Plano de Ação 5W2H (Contenção & Correção Sistêmica)
            </h2>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-24">Tipo</th>
                  <th className="p-2 border-r border-slate-300">Ação / O quê</th>
                  <th className="p-2 border-r border-slate-300 w-28">Responsável</th>
                  <th className="p-2 border-r border-slate-300 w-24">Prazo</th>
                  <th className="p-2 border-r border-slate-300 w-24">Status</th>
                  <th className="p-2">Verificação Eficácia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {problema.acoes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                      Nenhuma ação cadastrada.
                    </td>
                  </tr>
                ) : (
                  problema.acoes.map(a => (
                    <tr key={a.id}>
                      <td className="p-2 font-bold border-r border-slate-200 uppercase text-[10px]">
                        {a.tipo === 'contencao' ? 'Contenção' : 'Corretiva'}
                      </td>
                      <td className="p-2 font-medium border-r border-slate-200">
                        {a.descricao}
                      </td>
                      <td className="p-2 border-r border-slate-200 whitespace-nowrap">
                        {a.responsavel}
                      </td>
                      <td className="p-2 border-r border-slate-200 whitespace-nowrap font-mono">
                        {a.prazo}
                      </td>
                      <td className="p-2 border-r border-slate-200 whitespace-nowrap font-bold text-[10px] uppercase">
                        {a.status}
                      </td>
                      <td className="p-2 text-[11px] text-slate-600">
                        {a.comoVerificarEficacia}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 5: Signatures and Audit Sign-off */}
          <div className="pt-8 border-t-2 border-slate-300 page-break-inside-avoid">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-6">
              Assinaturas de Homologação e Fechamento do Ciclo PDCA:
            </div>
            <div className="grid grid-cols-3 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-900 pb-1 mb-1 font-semibold">
                  {problema.facilitador}
                </div>
                <span className="text-[10px] text-slate-500">Facilitador Kaizen / Engenharia</span>
              </div>

              <div>
                <div className="border-b border-slate-900 pb-1 mb-1 font-semibold">
                  Liderança de Produção
                </div>
                <span className="text-[10px] text-slate-500">Responsável pela Área / Linha</span>
              </div>

              <div>
                <div className="border-b border-slate-900 pb-1 mb-1 font-semibold">
                  Garantia da Qualidade
                </div>
                <span className="text-[10px] text-slate-500">Validação e Auditoria ISO/IATF</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
