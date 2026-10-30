/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IshikawaCategory, ProblemaOperacional, Causa6M, ISHIKAWA_CATEGORIES } from '../types/leanRoot';

interface AnaliseSintomaResult {
  isSintoma: boolean;
  alertaMotivo?: string;
  perguntaDesafio?: string;
  categoriaSugerida?: IshikawaCategory;
}

// Dicionário de padrões sintomáticos frequentes em análises superficiais de chão de fábrica
const PADROES_SINTOMATICOS = [
  {
    regex: /(falha humana|erro do operador|falta de aten[çc][aã]o|desaten[çc][aã]o|operador esqueceu|n[aã]o viu|distra[çc][aã]o|descuido|imper[íi]cia|n[aã]o prestou aten[çc][aã]o)/i,
    motivo: 'O erro humano é quase sempre um sintoma e consequência de um processo frágil, e nunca a causa-raiz final.',
    perguntaDesafio: 'Por que o sistema ou instrução de trabalho permitiu que a distração ocorresse sem um dispositivo à prova de erros (Poka-Yoke)?',
    categoria: 'metodo' as IshikawaCategory,
  },
  {
    regex: /(quebrou|rompeu|estragou|danificou|queimou|travou|desgastou|sensor queimou|fus[íi]vel abriu|parafuso soltou|trincou)/i,
    motivo: 'A falha ou quebra mecânica/elétrica é o dano físico aparente (efeito imediato), não a causa geradora.',
    perguntaDesafio: 'Qual solicitação anômala (sobrecarga, falta de lubrificação, vibração excessiva ou fadiga de material) induziu este dano?',
    categoria: 'maquina' as IshikawaCategory,
  },
  {
    regex: /(fornecedor mandou ruim|material defeituoso|mat[ée]ria[- ]prima ruim|lote veio com defeito|pe[çc]a fora da medida)/i,
    motivo: 'Transferir a causa inteiramente para o fornecedor é sintomático se não investigarmos a barreira de recebimento.',
    perguntaDesafio: 'Por que a inspeção de recebimento ou o controle dimensional na alimentação da linha não detectou a inconformidade antes do processamento?',
    categoria: 'medicao' as IshikawaCategory,
  },
  {
    regex: /(n[aã]o deu tempo|muita correria|pressa|meta muito alta|cobran[çc]a|sobrecarga de trabalho)/i,
    motivo: 'A pressão de tempo mascara falta de balanceamento de linha ou tempo de ciclo mal dimensionado.',
    perguntaDesafio: 'O Takt Time da operação estava compatível com o tempo padrão medido? O processo possui balanceamento formal?',
    categoria: 'metodo' as IshikawaCategory,
  },
  {
    regex: /(muito calor|muito frio|estava escuro|muita poeira|umidade)/i,
    motivo: 'Condições ambientais afetam componentes e operadores, mas é preciso verificar a especificação do equipamento.',
    perguntaDesafio: 'A temperatura ou umidade ultrapassou os limites nominais de catálogo do equipamento? Há isolamento ou climatização prevista no projeto?',
    categoria: 'meio_ambiente' as IshikawaCategory,
  },
];

// Identificador automático de categoria 6M por palavras-chave técnicas
export function inferirCategoria6M(texto: string): IshikawaCategory {
  const t = texto.toLowerCase();

  if (/(sensor|paqu[íi]metro|micr[ôo]metro|calibra|medi[çc]|toler[âa]ncia|leitura|teste|ensaio|inspe[çc]|gabarito|r&r)/i.test(t)) {
    return 'medicao';
  }
  if (/(temperatura|umidade|calor|frio|vibra|poeira|ilumina|ru[íi]do|piso|ambiente|vento|sujeira)/i.test(t)) {
    return 'meio_ambiente';
  }
  if (/(operador|treinamento|capacita|ergonomia|fadiga|comunica|turno|ajudante|lideran[çc]a|equipe)/i.test(t)) {
    return 'mao_de_obra';
  }
  if (/(mat[ée]ria|a[çc]o|resina|pol[íi]mero|lote|insumo|fornecedor|dureza|espessura|rebarba|embalagem|graxa|flu[íi]do)/i.test(t)) {
    return 'material';
  }
  if (/(fuso|rolamento|cilindro|motor|bomba|v[áa]lvula|correia|engrenagem|desgaste|folga|hidr[áa]ulic|pneum[áa]tic|el[ée]tric|redutor)/i.test(t)) {
    return 'maquina';
  }
  return 'metodo'; // Default estruturado para processos
}

// Analisador de causas sintomáticas
export function avaliarSeEhSintoma(texto: string): AnaliseSintomaResult {
  for (const padrao of PADROES_SINTOMATICOS) {
    if (padrao.regex.test(texto)) {
      return {
        isSintoma: true,
        alertaMotivo: padrao.motivo,
        perguntaDesafio: padrao.perguntaDesafio,
        categoriaSugerida: padrao.categoria,
      };
    }
  }

  // Se o texto for excessivamente curto (menos de 15 caracteres), é forte indício de resposta superficial
  if (texto.trim().length > 0 && texto.trim().length < 15) {
    return {
      isSintoma: true,
      alertaMotivo: 'Descrição muito sucinta. Detalhes técnicos e evidências factuais são essenciais para evitar conclusões rasas.',
      perguntaDesafio: 'Pode descrever com mais detalhes o que foi observado fisicamente (ruído, medição, folga, alarme)?',
      categoriaSugerida: inferirCategoria6M(texto),
    };
  }

  return {
    isSintoma: false,
    categoriaSugerida: inferirCategoria6M(texto),
  };
}

// Gerador de perguntas socráticas técnicas contextuais
export function gerarPerguntaSocratica(problema: ProblemaOperacional): {
  pergunta: string;
  categoriaSugerida: IshikawaCategory;
  explicacaoMetodologica: string;
} {
  const totalCausas = problema.causas6M.length;
  const causasPorCategoria: Record<IshikawaCategory, Causa6M[]> = {
    metodo: problema.causas6M.filter(c => c.categoria === 'metodo'),
    maquina: problema.causas6M.filter(c => c.categoria === 'maquina'),
    material: problema.causas6M.filter(c => c.categoria === 'material'),
    mao_de_obra: problema.causas6M.filter(c => c.categoria === 'mao_de_obra'),
    meio_ambiente: problema.causas6M.filter(c => c.categoria === 'meio_ambiente'),
    medicao: problema.causas6M.filter(c => c.categoria === 'medicao'),
  };

  // 1. Se não houver causas cadastradas, inicia provocando os eixos primários
  if (totalCausas === 0) {
    return {
      pergunta: `Considerando o evento "${problema.titulo}" no equipamento ${problema.equipamento} (${problema.linha}): No momento da parada, os parâmetros operacionais registrados pelo painel estavam em conformidade com a folha de processo padrão?`,
      categoriaSugerida: 'metodo',
      explicacaoMetodologica: 'Em análises Kaizen, o primeiro passo é verificar a adesão ao padrão antes de investigar falhas de máquina.',
    };
  }

  // 2. Busca eixos desassistidos (com 0 causas) para garantir investigação abrangente nos 6M
  const categoriasVazias: IshikawaCategory[] = (
    Object.keys(causasPorCategoria) as IshikawaCategory[]
  ).filter(cat => causasPorCategoria[cat].length === 0);

  if (categoriasVazias.length > 0) {
    const proxCategoria = categoriasVazias[0];
    const info = ISHIKAWA_CATEGORIES[proxCategoria];
    
    const perguntasPorEixo: Record<IshikawaCategory, string> = {
      medicao: `Ainda não investigamos o eixo de Medição. O instrumento de controle ou sensor de parada no ${problema.equipamento} possui calibração válida e repetibilidade comprovada?`,
      maquina: `No eixo Máquina: Há quanto tempo foi realizada a última manutenção preventiva no ${problema.equipamento}? Foram encontradas folgas, vibração anormal ou falta de lubrificação?`,
      material: `No eixo Material: Houve troca recente de lote de matéria-prima, variação na dureza ou alteração de fornecedor antes do incidente?`,
      metodo: `No eixo Método: A instrução de trabalho do posto foi revisada recentemente? O procedimento descreve claramente o que fazer em caso de oscilação?`,
      mao_de_obra: `No eixo Mão de Obra: O operador do ${problema.turno} possuía habilitação formal na matriz de polivalência para operar essa máquina específica?`,
      meio_ambiente: `No eixo Meio Ambiente: No momento da anomalia, foram registradas oscilações térmicas, poeira de usinagem excessiva ou vibrações transmitidas pelo piso?`,
    };

    return {
      pergunta: perguntasPorEixo[proxCategoria],
      categoriaSugerida: proxCategoria,
      explicacaoMetodologica: `O eixo ${info.name} ainda não possui nenhuma hipótese. Investigar todos os 6M evita o viés de confirmação.`,
    };
  }

  // 3. Se todos os eixos têm ao menos uma causa, questiona sobre validação por evidência
  const causasNaoValidadas = problema.causas6M.filter(c => c.status === 'hipotese');
  if (causasNaoValidadas.length > 0) {
    const causaAlvo = causasNaoValidadas[0];
    return {
      pergunta: `Temos a hipótese "${causaAlvo.descricao}" no eixo ${ISHIKAWA_CATEGORIES[causaAlvo.categoria].shortLabel}. Qual dado ou evidência física mensurável (fotos, relatórios de teste, logs de alarme) foi coletado para validar ou descartar essa suspeita?`,
      categoriaSugerida: causaAlvo.categoria,
      explicacaoMetodologica: 'No Lean, nenhuma hipótese deve ser assumida sem validação em campo (Genba - vá ao chão de fábrica e veja com seus próprios olhos).',
    };
  }

  // 4. Se causas já foram validadas, direciona para os 5 Porquês
  const causasValidadas = problema.causas6M.filter(c => c.status === 'validada');
  if (causasValidadas.length > 0) {
    const semPorques = causasValidadas.find(cv => 
      !problema.cadeias5Porques.some(cad => cad.causaOrigemId === cv.id)
    );
    if (semPorques) {
      return {
        pergunta: `A causa "${semPorques.descricao}" foi validada com sucesso. Vamos desdobrar os 5 Porquês: Por que exatamente essa condição ocorreu no equipamento ${problema.equipamento}?`,
        categoriaSugerida: semPorques.categoria,
        explicacaoMetodologica: 'Desdobrar verticalmente a causa validada é o que nos levará da falha aparente à falha sistêmica ou gerencial.',
      };
    }
  }

  // 5. Verificação de Ações
  const temCausaRaiz = problema.cadeias5Porques.some(c => c.passos.some(p => p.isCausaRaiz));
  const temAcaoCorretiva = problema.acoes.some(a => a.tipo === 'corretiva');

  if (temCausaRaiz && !temAcaoCorretiva) {
    return {
      pergunta: `Identificamos uma causa-raiz fundamental na análise dos 5 Porquês, mas ainda não registramos nenhuma Ação Corretiva sistêmica. Qual contramedida definitiva (ex.: alteração de engenharia, Poka-Yoke ou revisão de procedimento) impedirá a reincidência?`,
      categoriaSugerida: 'metodo',
      explicacaoMetodologica: 'Um Kaizen sem ação corretiva à prova de falhas não encerra o ciclo de melhoria contínua.',
    };
  }

  return {
    pergunta: `A equipe identificou outros fatores concorrentes no ${problema.equipamento}? Todas as contramedidas possuem responsáveis e datas acordadas com a supervisão?`,
    categoriaSugerida: 'metodo',
    explicacaoMetodologica: 'Revisão final de integridade da análise de causa-raiz.',
  };
}
