/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProblemaOperacional, ISHIKAWA_CATEGORIES } from '../types/leanRoot';

const PRIMARY_COLOR: [number, number, number] = [15, 23, 42]; // Slate 900
const ACCENT_COLOR: [number, number, number] = [217, 119, 6]; // Amber 600
const SECONDARY_COLOR: [number, number, number] = [71, 85, 105]; // Slate 600
const DARK_TEXT: [number, number, number] = [15, 23, 42];
const LIGHT_BG: [number, number, number] = [248, 250, 252];
const BORDER_COLOR: [number, number, number] = [203, 213, 225];
const SUCCESS_GREEN: [number, number, number] = [16, 149, 106];

function aplicarCabecalhoPadrao(doc: jsPDF, titulo: string, subtitulo: string, codigo: string, status: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = margin;

  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(margin, currentY, pageWidth - margin * 2, 3.5, 'F');
  currentY += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT_COLOR);
  doc.text('LEANROOT RCA STUDIO · SISTEMA INTEGRADO DE ENGENHARIA & QUALIDADE', margin, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...DARK_TEXT);
  doc.text(titulo.toUpperCase(), margin, currentY);

  const boxWidth = 52;
  const boxHeight = 16;
  const boxX = pageWidth - margin - boxWidth;
  const boxY = currentY - 8;

  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text(`DOC: ${codigo}`, boxX + 3, boxY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SECONDARY_COLOR);
  doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')}`, boxX + 3, boxY + 9);
  doc.text(`Status: ${status.toUpperCase()}`, boxX + 3, boxY + 13.5);

  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...SECONDARY_COLOR);
  doc.text(subtitulo, margin, currentY);

  currentY += 6;
  return currentY;
}

function aplicarRodapePadrao(doc: jsPDF, codigo: string): void {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - margin + 2, pageWidth - margin, pageHeight - margin + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...SECONDARY_COLOR);
    doc.text(
      `LeanRoot RCA · ${codigo} · Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      margin,
      pageHeight - margin + 6
    );

    doc.text(
      `Página ${p} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - margin + 6,
      { align: 'right' }
    );
  }
}

function sanitizarNomeArquivo(codigo: string, sufixo: string, extensao: string): string {
  const limpo = codigo.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `LeanRoot_${limpo}_${sufixo}.${extensao}`;
}

// 1. Dossiê Completo em Excel
export function exportarAtaTecnicaCompletaExcel(problema: ProblemaOperacional): void {
  const wb = XLSX.utils.book_new();

  // Aba 1: Resumo
  const dadosGerais = [
    ['LEANROOT RCA STUDIO - ATA TÉCNICA COMPLETA DE ENGENHARIA (8D / A3)'],
    ['Código da Ocorrência', problema.codigo],
    ['Título da Anomalia', problema.titulo],
    ['Status PDCA', problema.status.toUpperCase()],
    ['Linha / Posto', problema.linha],
    ['Equipamento', problema.equipamento],
    ['Data do Ocorrido', problema.data],
    ['Turno Operacional', problema.turno],
    ['Facilitador Técnico', problema.facilitador],
    ['Equipe Multidisciplinar', problema.equipeParticipante || 'Produção, Manutenção e Qualidade'],
    ['Data de Geração do Arquivo', `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`],
    [],
    ['DESCRIÇÃO FACTUAL DO EVENTO'],
    [problema.descricao],
    [],
    ['RESUMO QUANTITATIVO DA ANÁLISE'],
    ['Hipóteses Mapeadas no Ishikawa 6M', problema.causas6M.length],
    ['Hipóteses Validadas / Investigadas', problema.causas6M.filter(c => c.status === 'validada' || c.status === 'causa_raiz').length],
    ['Cadeias de 5 Porquês Desdobradas', problema.cadeias5Porques.length],
    ['Causas-Raiz Confirmadas', problema.cadeias5Porques.filter(c => c.causaRaizDefinida).length],
    ['Ações de Contenção Imediata', problema.acoes.filter(a => a.tipo === 'contencao').length],
    ['Ações Corretivas / Definitivas', problema.acoes.filter(a => a.tipo === 'corretiva').length],
  ];
  const wsGerais = XLSX.utils.aoa_to_sheet(dadosGerais);
  wsGerais['!cols'] = [{ wch: 32 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsGerais, '1. Resumo & Metadados');

  // Aba 2: Ishikawa 6M
  const dadosIshikawa = [
    ['EIXO 6M', 'CATEGORIA TÉCNICA', 'HIPÓTESE / DESCRIÇÃO DA ANOMALIA', 'STATUS', 'É SINTOMA?', 'EVIDÊNCIA / DADO COLETADO', 'DATA REGISTRO'],
    ...problema.causas6M.map(c => [
      c.categoria.toUpperCase(),
      ISHIKAWA_CATEGORIES[c.categoria]?.name || c.categoria,
      c.descricao,
      c.status.toUpperCase(),
      c.isSintoma ? 'SIM (Sintoma identificado)' : 'Não',
      c.evidencia || 'Pendente de verificação empírica',
      c.dataCriacao ? new Date(c.dataCriacao).toLocaleDateString('pt-BR') : '-',
    ]),
  ];
  const wsIshikawa = XLSX.utils.aoa_to_sheet(dadosIshikawa);
  wsIshikawa['!cols'] = [{ wch: 16 }, { wch: 32 }, { wch: 45 }, { wch: 16 }, { wch: 14 }, { wch: 40 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsIshikawa, '2. Ishikawa 6M');

  // Aba 3: 5 Porquês
  const dadosPorques: (string | number)[][] = [
    ['CADEIA Nº', 'CAUSA DE ORIGEM (ISHIKAWA)', 'EIXO 6M', 'NÍVEL', 'PERGUNTA INVESTIGATIVA', 'RESPOSTA / FATO COMPROVADO', 'EVIDÊNCIA', 'CLASSIFICAÇÃO'],
  ];
  problema.cadeias5Porques.forEach((cadeia, idx) => {
    cadeia.passos.forEach(passo => {
      dadosPorques.push([
        `Cadeia #${idx + 1}`,
        cadeia.tituloCausaOrigem,
        cadeia.categoria6M.toUpperCase(),
        `${passo.ordem}º Porquê`,
        passo.pergunta,
        passo.resposta,
        passo.evidencia || 'Não informada',
        passo.isCausaRaiz ? '★ CAUSA-RAIZ CONFIRMADA' : 'Desdobramento causal',
      ]);
    });
  });
  const wsPorques = XLSX.utils.aoa_to_sheet(dadosPorques);
  wsPorques['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 40 }, { wch: 45 }, { wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsPorques, '3. 5 Porquês & Causa Raiz');

  // Aba 4: 5W2H
  const dadosAcoes = [
    ['TIPO DE AÇÃO', 'O QUÊ (DESCRIÇÃO DA AÇÃO)', 'QUEM (RESPONSÁVEL)', 'QUANDO (PRAZO)', 'STATUS', 'COMO VERIFICAR EFICÁCIA (MÉTRICA / INDICADOR)', 'CAUSA ASSOCIADA'],
    ...problema.acoes.map(a => [
      a.tipo === 'contencao' ? 'Contenção Imediata' : 'Corretiva / Definitiva',
      a.descricao,
      a.responsavel,
      a.prazo,
      a.status.toUpperCase(),
      a.comoVerificarEficacia,
      a.categoria6M ? a.categoria6M.toUpperCase() : 'Geral',
    ]),
  ];
  const wsAcoes = XLSX.utils.aoa_to_sheet(dadosAcoes);
  wsAcoes['!cols'] = [{ wch: 20 }, { wch: 45 }, { wch: 24 }, { wch: 14 }, { wch: 16 }, { wch: 45 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsAcoes, '4. Plano de Ação 5W2H');

  const nomeArquivo = sanitizarNomeArquivo(problema.codigo, 'AtaTecnicaCompleta', 'xlsx');
  XLSX.writeFile(wb, nomeArquivo);
}

// 1. Dossiê Completo em PDF
export function exportarAtaTecnicaCompletaPdf(problema: ProblemaOperacional): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let currentY = aplicarCabecalhoPadrao(
    doc,
    'Relatório Técnico 8D & Análise de Causa-Raiz (A3)',
    'Dossiê completo contendo Ishikawa 6M, 5 Porquês e Plano de Contramedidas 5W2H',
    problema.codigo,
    problema.status
  );

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: BORDER_COLOR, lineWidth: 0.2, textColor: DARK_TEXT },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    body: [
      [
        { content: 'Equipamento:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG, cellWidth: 26 } },
        { content: problema.equipamento, styles: { cellWidth: 65 } },
        { content: 'Linha / Posto:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG, cellWidth: 26 } },
        { content: problema.linha },
      ],
      [
        { content: 'Data / Turno:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG } },
        { content: `${problema.data} · Turno ${problema.turno}` },
        { content: 'Facilitador:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG } },
        { content: problema.facilitador },
      ],
      [
        { content: 'Equipe Técnica:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG } },
        { content: problema.equipeParticipante || 'Equipe multidisciplinar operacional e de manutenção', colSpan: 3 },
      ],
    ],
  });

  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 5;

  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(margin, currentY, 2.5, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_TEXT);
  doc.text('1. DESCRIÇÃO FACTUAL DA NÃO CONFORMIDADE', margin + 5, currentY + 3.2);
  currentY += 5.5;

  const descLines = doc.splitTextToSize(problema.descricao, contentWidth - 8);
  const descHeight = 7 + descLines.length * 3.8;
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, currentY, contentWidth, descHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`Ocorrência: ${problema.titulo}`, margin + 3.5, currentY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_TEXT);
  doc.text(descLines, margin + 3.5, currentY + 8.5);

  currentY += descHeight + 5;

  // Ishikawa
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(margin, currentY, 2.5, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_TEXT);
  doc.text('2. INVESTIGAÇÃO 6M (DIAGRAMA DE CAUSA E EFEITO)', margin + 5, currentY + 3.2);
  currentY += 5;

  const ishikawaRows: Array<[string, string, string]> = [];
  for (const [key, info] of Object.entries(ISHIKAWA_CATEGORIES)) {
    const causas = problema.causas6M.filter(c => c.categoria === key);
    let textoCausas = 'Nenhum desvio identificado.';
    if (causas.length > 0) {
      textoCausas = causas
        .map(c => `• [${c.status.toUpperCase()}] ${c.descricao}${c.evidencia ? ` (Ev: ${c.evidencia})` : ''}`)
        .join('\n');
    }
    ishikawaRows.push([`${info.shortLabel}\n(${info.name})`, `${causas.length}`, textoCausas]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, lineColor: BORDER_COLOR, lineWidth: 0.2, textColor: DARK_TEXT },
    headStyles: { fillColor: [241, 245, 249], textColor: DARK_TEXT, fontStyle: 'bold', fontSize: 7.5 },
    head: [['Eixo 6M', 'Qtd', 'Hipóteses Mapeadas & Evidências Observadas']],
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 'auto' },
    },
    body: ishikawaRows,
  });

  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 6;

  // 5 Porquês
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(margin, currentY, 2.5, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_TEXT);
  doc.text('3. DESDOBRAMENTO VERTICAL DOS 5 PORQUÊS & CAUSA-RAIZ', margin + 5, currentY + 3.2);
  currentY += 5;

  const porquesRows: Array<[string, string, string, string]> = [];
  problema.cadeias5Porques.forEach((cadeia, idx) => {
    cadeia.passos.forEach(passo => {
      porquesRows.push([
        `Cadeia #${idx + 1}\n(${cadeia.categoria6M.toUpperCase()})`,
        `${passo.ordem}º Porquê${passo.isCausaRaiz ? '\n★ CAUSA-RAIZ' : ''}`,
        passo.pergunta,
        `${passo.resposta}${passo.evidencia ? `\n[Evidência: ${passo.evidencia}]` : ''}`,
      ]);
    });
  });

  if (porquesRows.length === 0) {
    porquesRows.push(['-', '-', 'Nenhuma cadeia de 5 Porquês registrada.', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, lineColor: BORDER_COLOR, lineWidth: 0.2, textColor: DARK_TEXT },
    headStyles: { fillColor: [241, 245, 249], textColor: DARK_TEXT, fontStyle: 'bold', fontSize: 7.5 },
    head: [['Origem', 'Nível', 'Pergunta Investigativa', 'Resposta / Fato Comprovado']],
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 24, fontStyle: 'bold', halign: 'center' },
      2: { cellWidth: 55 },
      3: { cellWidth: 'auto' },
    },
    body: porquesRows,
    didParseCell: data => {
      if (data.row.raw && Array.isArray(data.row.raw) && String(data.row.raw[1]).includes('CAUSA-RAIZ')) {
        if (data.section === 'body') {
          data.cell.styles.fillColor = [254, 243, 199];
          data.cell.styles.textColor = [180, 83, 9];
        }
      }
    },
  });

  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 6;

  // 5W2H
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(margin, currentY, 2.5, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_TEXT);
  doc.text('4. PLANO DE AÇÃO 5W2H (CONTENÇÃO & CONTRAMEDIDAS)', margin + 5, currentY + 3.2);
  currentY += 5;

  const acoesRows = problema.acoes.map(a => [
    a.tipo === 'contencao' ? 'Contenção' : 'Corretiva',
    a.descricao,
    a.responsavel,
    a.prazo,
    a.status.toUpperCase(),
    a.comoVerificarEficacia,
  ]);

  if (acoesRows.length === 0) {
    acoesRows.push(['-', 'Nenhuma ação cadastrada.', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, lineColor: BORDER_COLOR, lineWidth: 0.2, textColor: DARK_TEXT },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    head: [['Tipo', 'Ação / O Quê Fazer', 'Responsável', 'Prazo', 'Status', 'Verificação de Eficácia']],
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 26 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 'auto' },
    },
    body: acoesRows,
  });

  aplicarRodapePadrao(doc, problema.codigo);
  const nomeArquivo = sanitizarNomeArquivo(problema.codigo, 'AtaTecnicaCompleta', 'pdf');
  doc.save(nomeArquivo);
}

// 2. Ishikawa Individual Excel
export function exportarIshikawaExcel(problema: ProblemaOperacional): void {
  const wb = XLSX.utils.book_new();
  const linhas = [
    ['LEANROOT RCA STUDIO - DIAGRAMA DE ISHIKAWA 6M (CAUSA E EFEITO)'],
    ['Código do Problema', problema.codigo],
    ['Título da Anomalia', problema.titulo],
    ['Equipamento', problema.equipamento],
    ['Linha / Posto', problema.linha],
    ['Data do Evento', problema.data],
    [],
    ['EIXO 6M', 'CATEGORIA TÉCNICA', 'DESCRIÇÃO DA HIPÓTESE DE FALHA', 'STATUS DA ANÁLISE', 'CLASSIFICADO COMO SINTOMA?', 'EVIDÊNCIA / DADO COLETADO', 'DATA REGISTRO'],
    ...problema.causas6M.map(c => [
      c.categoria.toUpperCase(),
      ISHIKAWA_CATEGORIES[c.categoria]?.name || c.categoria,
      c.descricao,
      c.status.toUpperCase(),
      c.isSintoma ? 'SIM (Sintoma identificado)' : 'Não',
      c.evidencia || 'Aguardando teste/coleta',
      c.dataCriacao ? new Date(c.dataCriacao).toLocaleDateString('pt-BR') : '-',
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(linhas);
  ws['!cols'] = [{ wch: 16 }, { wch: 32 }, { wch: 45 }, { wch: 18 }, { wch: 14 }, { wch: 40 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Ishikawa 6M');
  const nomeArquivo = sanitizarNomeArquivo(problema.codigo, 'Ishikawa_6M', 'xlsx');
  XLSX.writeFile(wb, nomeArquivo);
}

// 2. Ishikawa Individual PDF
export function exportarIshikawaPdf(problema: ProblemaOperacional): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;

  let currentY = aplicarCabecalhoPadrao(
    doc,
    'Diagrama de Ishikawa (6M) - Causa & Efeito',
    'Mapeamento analítico de hipóteses de falha estruturadas nas 6 dimensões industriais',
    problema.codigo,
    problema.status
  );

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: BORDER_COLOR, lineWidth: 0.2, textColor: DARK_TEXT },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold' },
    body: [
      [
        { content: 'Anomalia:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG, cellWidth: 26 } },
        { content: `${problema.titulo} (${problema.equipamento} - Linha ${problema.linha})` },
      ],
      [
        { content: 'Descrição:', styles: { fontStyle: 'bold', fillColor: LIGHT_BG } },
        { content: problema.descricao },
      ],
    ],
  });

  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 6;

  const rows: Array<[string, string, string, string]> = [];
  problema.causas6M.forEach(c => {
    rows.push([
      ISHIKAWA_CATEGORIES[c.categoria]?.shortLabel.toUpperCase() || c.categoria.toUpperCase(),
      c.descricao,
      c.status.toUpperCase(),
      c.evidencia || 'Pendente de validação no gemba',
    ]);
  });

  if (rows.length === 0) {
    rows.push(['-', 'Nenhuma hipótese cadastrada no momento.', '-', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.2, lineColor: BORDER_COLOR, lineWidth: 0.2, textColor: DARK_TEXT },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    head: [['Eixo 6M', 'Hipótese Formulada', 'Status', 'Evidência / Fato Observado']],
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 'auto' },
    },
    body: rows,
  });

  aplicarRodapePadrao(doc, problema.codigo);
  const nomeArquivo = sanitizarNomeArquivo(problema.codigo, 'Ishikawa_6M', 'pdf');
  doc.save(nomeArquivo);
}

// 3. 5 Porquês Individual Excel
export function exportar5PorquesExcel(problema: ProblemaOperacional): void {
  const wb = XLSX.utils.book_new();
  const dados: (string | number)[][] = [
    ['LEANROOT RCA STUDIO - DESDOBRAMENTO VERTICAL DOS 5 PORQUÊS & CAUSA-RAIZ'],
    ['Código do Problema', problema.codigo],
    ['Título da Anomalia', problema.titulo],
    ['Equipamento', problema.equipamento],
    ['Facilitador', problema.facilitador],
    ['Total de Cadeias Investigadas', problema.cadeias5Porques.length],
    [],
    ['CADEIA Nº', 'ORIGEM NO ISHIKAWA', 'EIXO 6M', 'NÍVEL', 'PERGUNTA INVESTIGATIVA', 'RESPOSTA / FATO COMPROVADO', 'EVIDÊNCIA / REGISTRO', 'CLASSIFICAÇÃO'],
  ];

  problema.cadeias5Porques.forEach((cadeia, idx) => {
    cadeia.passos.forEach(passo => {
      dados.push([
        `Cadeia #${idx + 1}`,
        cadeia.tituloCausaOrigem,
        cadeia.categoria6M.toUpperCase(),
        `${passo.ordem}º Porquê`,
        passo.pergunta,
        passo.resposta,
        passo.evidencia || 'Não preenchida',
        passo.isCausaRaiz ? '★ CAUSA-RAIZ DEFINITIVA' : 'Passo Intermediário',
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(dados);
  ws['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 40 }, { wch: 45 }, { wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws, '5 Porquês');
  const nomeArquivo = sanitizarNomeArquivo(problema.codigo, '5Porques_CausaRaiz', 'xlsx');
  XLSX.writeFile(wb, nomeArquivo);
}

// 3. 5 Porquês Individual PDF
export function exportar5PorquesPdf(problema: ProblemaOperacional): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;

  let currentY = aplicarCabecalhoPadrao(
    doc,
    'Árvore dos 5 Porquês & Identificação de Causa-Raiz',
    'Desdobramento causal vertical partindo do sintoma até o mecanismo raiz de falha',
    problema.codigo,
    problema.status
  );

  const porquesRows: Array<[string, string, string, string]> = [];
  problema.cadeias5Porques.forEach((cadeia, idx) => {
    cadeia.passos.forEach(passo => {
      porquesRows.push([
        `Cadeia #${idx + 1}\n[${cadeia.categoria6M.toUpperCase()}]`,
        `${passo.ordem}º Porquê${passo.isCausaRaiz ? '\n★ CAUSA-RAIZ' : ''}`,
        passo.pergunta,
        `${passo.resposta}${passo.evidencia ? `\n[Evidência: ${passo.evidencia}]` : ''}`,
      ]);
    });
  });

  if (porquesRows.length === 0) {
    porquesRows.push(['-', '-', 'Nenhuma cadeia de 5 Porquês registrada.', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.2, lineColor: BORDER_COLOR, lineWidth: 0.2, textColor: DARK_TEXT },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    head: [['Origem', 'Nível Causal', 'Pergunta Investigativa', 'Resposta / Fato Comprovado']],
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
      2: { cellWidth: 55 },
      3: { cellWidth: 'auto' },
    },
    body: porquesRows,
  });

  aplicarRodapePadrao(doc, problema.codigo);
  const nomeArquivo = sanitizarNomeArquivo(problema.codigo, '5Porques_CausaRaiz', 'pdf');
  doc.save(nomeArquivo);
}

// 4. 5W2H Individual Excel
export function exportar5W2HExcel(problema: ProblemaOperacional): void {
  const wb = XLSX.utils.book_new();
  const linhas = [
    ['LEANROOT RCA STUDIO - PLANO DE AÇÃO 5W2H (CONTENÇÃO & CONTRAMEDIDAS)'],
    ['Código do Problema', problema.codigo],
    ['Título da Anomalia', problema.titulo],
    ['Linha', problema.linha],
    ['Equipamento', problema.equipamento],
    ['Total de Ações', problema.acoes.length],
    [],
    ['ID', 'TIPO (CONTENÇÃO / CORRETIVA)', 'O QUÊ (AÇÃO CORRETIVA)', 'QUEM (RESPONSÁVEL)', 'QUANDO (PRAZO)', 'STATUS', 'COMO VERIFICAR EFICÁCIA (MÉTRICA / CONTROLE)', 'EIXO 6M RELACIONADO'],
    ...problema.acoes.map((a, i) => [
      `ACT-${i + 1}`,
      a.tipo === 'contencao' ? 'Contenção Imediata' : 'Corretiva Definitiva',
      a.descricao,
      a.responsavel,
      a.prazo,
      a.status.toUpperCase(),
      a.comoVerificarEficacia,
      a.categoria6M ? a.categoria6M.toUpperCase() : 'Geral',
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(linhas);
  ws['!cols'] = [{ wch: 10 }, { wch: 22 }, { wch: 45 }, { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 45 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Plano 5W2H');
  const nomeArquivo = sanitizarNomeArquivo(problema.codigo, 'Plano_5W2H', 'xlsx');
  XLSX.writeFile(wb, nomeArquivo);
}

// 4. 5W2H Individual PDF
export function exportar5W2HPdf(problema: ProblemaOperacional): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;

  let currentY = aplicarCabecalhoPadrao(
    doc,
    'Plano de Ação 5W2H - Contramedidas Sistêmicas',
    'Matriz de ações de contenção imediata e contramedidas definitivas para bloqueio da causa-raiz',
    problema.codigo,
    problema.status
  );

  const rows = problema.acoes.map(a => [
    a.tipo === 'contencao' ? 'Contenção' : 'Corretiva',
    a.descricao,
    a.responsavel,
    a.prazo,
    a.status.toUpperCase(),
    a.comoVerificarEficacia,
  ]);

  if (rows.length === 0) {
    rows.push(['-', 'Nenhuma ação registrada até o momento.', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.2, lineColor: BORDER_COLOR, lineWidth: 0.2, textColor: DARK_TEXT },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    head: [['Tipo', 'Ação / O Quê Fazer', 'Responsável', 'Prazo', 'Status', 'Verificação de Eficácia']],
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 26 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 'auto' },
    },
    body: rows,
  });

  aplicarRodapePadrao(doc, problema.codigo);
  const nomeArquivo = sanitizarNomeArquivo(problema.codigo, 'Plano_5W2H', 'pdf');
  doc.save(nomeArquivo);
}

// 5. Matriz Consolidada Excel
export function exportarMatrizAcoesConsolidadaExcel(problemas: ProblemaOperacional[]): void {
  const wb = XLSX.utils.book_new();
  const linhas: (string | number)[][] = [
    ['LEANROOT RCA STUDIO - MATRIZ CONSOLIDADA DE AÇÕES 5W2H DA PLANTA'],
    ['Total de Ocorrências Analisadas', problemas.length],
    ['Data do Relatório', `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`],
    [],
    ['CÓDIGO OCORRÊNCIA', 'TÍTULO DO PROBLEMA', 'LINHA', 'EQUIPAMENTO', 'TIPO DE AÇÃO', 'O QUÊ (AÇÃO)', 'QUEM (RESPONSÁVEL)', 'QUANDO (PRAZO)', 'STATUS', 'VERIFICAÇÃO DE EFICÁCIA'],
  ];

  problemas.forEach(prob => {
    prob.acoes.forEach(acao => {
      linhas.push([
        prob.codigo,
        prob.titulo,
        prob.linha,
        prob.equipamento,
        acao.tipo === 'contencao' ? 'Contenção Imediata' : 'Corretiva Definitiva',
        acao.descricao,
        acao.responsavel,
        acao.prazo,
        acao.status.toUpperCase(),
        acao.comoVerificarEficacia,
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(linhas);
  ws['!cols'] = [
    { wch: 16 },
    { wch: 30 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
    { wch: 45 },
    { wch: 22 },
    { wch: 14 },
    { wch: 16 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Matriz Consolidada 5W2H');
  XLSX.writeFile(wb, `LeanRoot_MatrizConsolidada_5W2H_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// 5. Matriz Consolidada PDF
export function exportarMatrizAcoesConsolidadaPdf(problemas: ProblemaOperacional[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 12;

  let currentY = margin;
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(margin, currentY, doc.internal.pageSize.getWidth() - margin * 2, 3, 'F');
  currentY += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT_COLOR);
  doc.text('LEANROOT RCA STUDIO · GESTÃO CONSOLIDADA DA PLANTA', margin, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...DARK_TEXT);
  doc.text('MATRIZ CONSOLIDADA DE AÇÕES 5W2H (CONTENÇÃO & CORREÇÃO)', margin, currentY);

  currentY += 6;

  const rows: string[][] = [];
  problemas.forEach(prob => {
    prob.acoes.forEach(a => {
      rows.push([
        prob.codigo,
        `${prob.linha} / ${prob.equipamento}`,
        a.tipo === 'contencao' ? 'Contenção' : 'Corretiva',
        a.descricao,
        a.responsavel,
        a.prazo,
        a.status.toUpperCase(),
        a.comoVerificarEficacia,
      ]);
    });
  });

  if (rows.length === 0) {
    rows.push(['-', '-', '-', 'Nenhuma ação cadastrada em toda a planta.', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, lineColor: BORDER_COLOR, lineWidth: 0.2, textColor: DARK_TEXT },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    head: [['Ocorrência', 'Local / Máquina', 'Tipo', 'Ação / O Quê Fazer', 'Responsável', 'Prazo', 'Status', 'Verificação de Eficácia']],
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' },
      1: { cellWidth: 35 },
      2: { cellWidth: 20, fontStyle: 'bold' },
      3: { cellWidth: 75 },
      4: { cellWidth: 26 },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 'auto' },
    },
    body: rows,
  });

  aplicarRodapePadrao(doc, 'PLANT_WIDE');
  doc.save(`LeanRoot_MatrizConsolidada_5W2H_${new Date().toISOString().split('T')[0]}.pdf`);
}
