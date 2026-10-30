/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProblemaOperacional, ISHIKAWA_CATEGORIES } from '../types/leanRoot';

/**
 * Gera e realiza o download de um documento PDF A4 profissional estruturado
 * de acordo com os padrões industriais de RCA (Root Cause Analysis), 8D e Kaizen.
 */
export function exportarAtaParaPdf(problema: ProblemaOperacional): void {
  // Inicializa documento A4 em modo retrato (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Paleta industrial
  const primaryColor: [number, number, number] = [30, 58, 138]; // Azul escuro industrial (#1e3a8a)
  const secondaryColor: [number, number, number] = [71, 85, 105]; // Slate (#475569)
  const darkText: [number, number, number] = [15, 23, 42]; // Slate 900
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate 50
  const borderColor: [number, number, number] = [203, 213, 225]; // Slate 300
  const accentGreen: [number, number, number] = [16, 149, 106]; // Emerald 600
  const accentAmber: [number, number, number] = [217, 119, 6]; // Amber 600

  // Função auxiliar para verificar e quebrar página
  const checkPageBreak = (neededHeight: number): void => {
    if (currentY + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      currentY = margin;
      drawSubsequentHeader();
    }
  };

  const drawSubsequentHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(`LeanRoot RCA - Relatório 8D / Kaizen | ${problema.codigo} - ${problema.titulo.substring(0, 40)}`, margin, currentY);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 7;
  };

  // ==========================================
  // CABEÇALHO DO DOCUMENTO (ISO / IATF Standard)
  // ==========================================
  // Faixa decorativa superior
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 3, 'F');
  currentY += 6;

  // Box superior com dados da organização e código do documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('SISTEMA DE GESTÃO DA QUALIDADE & MELHORIA CONTÍNUA (LEANROOT)', margin, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...darkText);
  doc.text('ATA DE ANÁLISE DE CAUSA-RAIZ & PLANO DE AÇÃO 5W2H', margin, currentY);

  // Box Documental no canto superior direito
  const docBoxWidth = 48;
  const docBoxHeight = 16;
  const docBoxX = pageWidth - margin - docBoxWidth;
  const docBoxY = currentY - 8.5;

  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(docBoxX, docBoxY, docBoxWidth, docBoxHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text(`DOC: ${problema.codigo}`, docBoxX + 3, docBoxY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')}`, docBoxX + 3, docBoxY + 9);
  doc.text(`Status PDCA: ${problema.status.toUpperCase()}`, docBoxX + 3, docBoxY + 13.5);

  currentY += 8;

  // ==========================================
  // METADADOS OPERACIONAIS (Grid em Tabela)
  // ==========================================
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: borderColor,
      lineWidth: 0.2,
      textColor: darkText,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    body: [
      [
        { content: 'Equipamento:', styles: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 26 } },
        { content: problema.equipamento, styles: { cellWidth: 65 } },
        { content: 'Linha / Posto:', styles: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 26 } },
        { content: problema.linha },
      ],
      [
        { content: 'Data / Turno:', styles: { fontStyle: 'bold', fillColor: lightBg } },
        { content: `${problema.data} · Turno ${problema.turno}` },
        { content: 'Facilitador:', styles: { fontStyle: 'bold', fillColor: lightBg } },
        { content: problema.facilitador },
      ],
      [
        { content: 'Equipe Técnica:', styles: { fontStyle: 'bold', fillColor: lightBg } },
        { content: problema.equipeParticipante || 'Equipe multidisciplinar de produção e manutenção', colSpan: 3 },
      ],
    ],
  });

  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 6;

  // ==========================================
  // SEÇÃO 1: DESCRIÇÃO FACTUAL DO EVENTO
  // ==========================================
  checkPageBreak(30);

  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, 2.5, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkText);
  doc.text('1. DESCRIÇÃO FACTUAL DO PROBLEMA / ANOMALIA', margin + 5, currentY + 3.8);

  currentY += 6.5;

  // Título e Descrição dentro de um card com fundo cinza suave
  const descLines = doc.splitTextToSize(problema.descricao, contentWidth - 8);
  const descHeight = 8 + descLines.length * 4.2;

  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, currentY, contentWidth, descHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text(`Ocorrência: ${problema.titulo}`, margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkText);
  doc.text(descLines, margin + 4, currentY + 9.5);

  currentY += descHeight + 6;

  // ==========================================
  // SEÇÃO 2: DIAGRAMA DE ISHIKAWA (6M)
  // ==========================================
  checkPageBreak(40);

  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, 2.5, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkText);
  doc.text('2. INVESTIGAÇÃO SISTEMÁTICA - DIAGRAMA DE ISHIKAWA (6M)', margin + 5, currentY + 3.8);

  currentY += 6.5;

  // Monta tabela do Ishikawa com as 6 categorias
  const ishikawaRows: Array<[string, string, string]> = [];

  for (const [key, info] of Object.entries(ISHIKAWA_CATEGORIES)) {
    const causas = problema.causas6M.filter((c) => c.categoria === key);
    let textoCausas = '';

    if (causas.length === 0) {
      textoCausas = 'Nenhum desvio identificado neste eixo.';
    } else {
      textoCausas = causas
        .map((c) => {
          let str = `• [${c.status.toUpperCase()}] ${c.descricao}`;
          if (c.evidencia) str += ` (Evidência: ${c.evidencia})`;
          return str;
        })
        .join('\n');
    }

    ishikawaRows.push([
      `${info.shortLabel}\n(${info.name})`,
      `${causas.length} hipótese(s)`,
      textoCausas,
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: borderColor,
      lineWidth: 0.2,
      textColor: darkText,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      fontSize: 8,
    },
    head: [['Eixo 6M', 'Qtd', 'Hipóteses Mapeadas & Evidências Observadas']],
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 'auto' },
    },
    body: ishikawaRows,
  });

  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 6;

  // ==========================================
  // SEÇÃO 3: CADEIA DOS 5 PORQUÊS & CAUSA-RAIZ
  // ==========================================
  checkPageBreak(40);

  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, 2.5, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkText);
  doc.text('3. DESDOBRAMENTO VERTICAL DOS 5 PORQUÊS (ANÁLISE DE CAUSA-RAIZ)', margin + 5, currentY + 3.8);

  currentY += 6.5;

  if (problema.cadeias5Porques.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text('Nenhuma cadeia de 5 Porquês foi desdobrada para esta ocorrência.', margin, currentY + 3);
    currentY += 8;
  } else {
    // Processa cada cadeia
    for (let i = 0; i < problema.cadeias5Porques.length; i++) {
      const cadeia = problema.cadeias5Porques[i];
      const categoriaInfo = ISHIKAWA_CATEGORIES[cadeia.categoria6M];

      checkPageBreak(25);

      // Título da Cadeia
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text(
        `Cadeia #${i + 1}: Origem em "${cadeia.tituloCausaOrigem}" [${categoriaInfo.shortLabel}]`,
        margin,
        currentY + 3
      );
      currentY += 5;

      const fiveWhysRows = cadeia.passos.map((p) => {
        let tag = `${p.ordem}º Porquê`;
        if (p.isCausaRaiz) {
          tag += '\n★ CAUSA-RAIZ';
        }

        let respCompleta = p.resposta;
        if (p.evidencia) {
          respCompleta += `\n[Evidência: ${p.evidencia}]`;
        }

        return [tag, p.pergunta, respCompleta];
      });

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          lineColor: borderColor,
          lineWidth: 0.2,
          textColor: darkText,
        },
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [30, 41, 59],
          fontStyle: 'bold',
          fontSize: 7.5,
        },
        head: [['Nível', 'Pergunta Investigativa', 'Resposta da Equipe & Fato Comprovado']],
        columnStyles: {
          0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
          1: { cellWidth: 62 },
          2: { cellWidth: 'auto' },
        },
        body: fiveWhysRows,
        didParseCell: (data) => {
          // Destaca a célula da causa raiz
          if (data.row.raw && Array.isArray(data.row.raw) && String(data.row.raw[0]).includes('CAUSA-RAIZ')) {
            if (data.section === 'body') {
              data.cell.styles.fillColor = [238, 242, 255]; // Azul índigo muito suave
              if (data.column.index === 0) {
                data.cell.styles.textColor = primaryColor;
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        },
      });

      // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
      currentY = doc.lastAutoTable.finalY + 5;
    }
  }

  // ==========================================
  // SEÇÃO 4: PLANO DE AÇÃO 5W2H (CONTENÇÃO & CORREÇÃO)
  // ==========================================
  checkPageBreak(40);

  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, 2.5, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkText);
  doc.text('4. PLANO DE AÇÃO 5W2H (CONTENÇÃO IMEDIATA & CONTRAMEDIDAS SISTÊMICAS)', margin + 5, currentY + 3.8);

  currentY += 6.5;

  const actionRows = problema.acoes.map((a) => {
    return [
      a.tipo === 'contencao' ? 'Contenção' : 'Corretiva',
      a.descricao,
      a.responsavel,
      a.prazo,
      a.status.toUpperCase(),
      a.comoVerificarEficacia,
    ];
  });

  if (actionRows.length === 0) {
    actionRows.push(['-', 'Nenhuma ação cadastrada até o momento.', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: borderColor,
      lineWidth: 0.2,
      textColor: darkText,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    head: [['Tipo', 'Ação / O Quê Fazer', 'Responsável', 'Prazo', 'Status', 'Verificação de Eficácia']],
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 26 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 'auto' },
    },
    body: actionRows,
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        if (data.cell.text[0] === 'Contenção') {
          data.cell.styles.textColor = accentAmber;
        } else if (data.cell.text[0] === 'Corretiva') {
          data.cell.styles.textColor = primaryColor;
        }
      }
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.text[0] === 'CONCLUIDA') {
          data.cell.styles.textColor = accentGreen;
        } else if (data.cell.text[0] === 'PENDENTE') {
          data.cell.styles.textColor = accentAmber;
        }
      }
    },
  });

  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 8;

  // ==========================================
  // SEÇÃO 5: ASSINATURAS E HOMOLOGAÇÃO
  // ==========================================
  checkPageBreak(35);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...secondaryColor);
  doc.text('HOMOLOGAÇÃO DA ANÁLISE E FECHAMENTO DO CICLO DE MELHORIA:', margin, currentY);

  currentY += 12;

  const colWidth = (contentWidth - 16) / 3;

  // Linha 1: Facilitador
  const x1 = margin;
  doc.setDrawColor(...darkText);
  doc.setLineWidth(0.3);
  doc.line(x1, currentY, x1 + colWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkText);
  doc.text(problema.facilitador, x1 + colWidth / 2, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...secondaryColor);
  doc.text('Facilitador Kaizen / Engenharia', x1 + colWidth / 2, currentY + 7.5, { align: 'center' });

  // Linha 2: Liderança Operacional
  const x2 = margin + colWidth + 8;
  doc.line(x2, currentY, x2 + colWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkText);
  doc.text('Liderança de Produção', x2 + colWidth / 2, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...secondaryColor);
  doc.text('Responsável pela Área / Linha', x2 + colWidth / 2, currentY + 7.5, { align: 'center' });

  // Linha 3: Garantia da Qualidade
  const x3 = margin + (colWidth + 8) * 2;
  doc.line(x3, currentY, x3 + colWidth, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkText);
  doc.text('Garantia da Qualidade', x3 + colWidth / 2, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...secondaryColor);
  doc.text('Validação de Eficácia ISO/IATF', x3 + colWidth / 2, currentY + 7.5, { align: 'center' });

  // ==========================================
  // RODAPÉ COM NUMERAÇÃO DE PÁGINAS EM TODAS AS PÁGINAS
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - margin + 2, pageWidth - margin, pageHeight - margin + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...secondaryColor);
    doc.text(
      `LeanRoot - Plataforma de Resolução Sistemática de Falhas | Registrado em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
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

  // Nome de arquivo limpo para chão de fábrica e auditoria
  const codigoSanitizado = problema.codigo.replace(/[^a-zA-Z0-9-_]/g, '_');
  const nomeArquivo = `LeanRoot_Ata_${codigoSanitizado}.pdf`;

  // Dispara o download direto
  doc.save(nomeArquivo);
}
