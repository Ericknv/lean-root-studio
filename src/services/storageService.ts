/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ProblemaOperacional, 
  MetricasAnalise, 
  MetricasEficienciaEquipe, 
  ISHIKAWA_CATEGORIES, 
  IshikawaCategory 
} from '../types/leanRoot';

const STORAGE_KEY = 'leanroot_data_v1';
const THEME_KEY = 'leanroot_theme';

export const EXEMPLO_INDUSTRIAL: ProblemaOperacional = {
  id: 'prob-cnc-001',
  codigo: 'RCA-2026-042',
  titulo: 'Sobreaquecimento e Parada Anômala do Eixo-Árvore (Spindle CNC-04)',
  descricao: 'Durante a usinagem de acabamento dos blocos de motor de alumínio, o Centro de Usinagem CNC-04 disparou alarme de sobrecarga térmica e travou o fuso, resultando em 4 horas de linha parada e 12 peças refugadas por marcas de trepidação.',
  linha: 'Linha 02 - Usinagem de Blocos',
  equipamento: 'Centro de Usinagem Horizontal CNC-04 (Tag: USIN-H04)',
  data: '2026-10-28',
  turno: '2º Turno',
  facilitador: 'Eng. Roberto Albuquerque (Black Belt Lean)',
  equipeParticipante: 'Carlos M. (Líder Produção), Denise S. (Especialista Manutenção), Fábio L. (Qualidade)',
  status: 'causa_identificada',
  causas6M: [
    {
      id: 'c-01',
      categoria: 'maquina',
      descricao: 'Bomba secundária de fluido de arrefecimento com vazão 40% abaixo da nominal',
      status: 'validada',
      evidencia: 'Medição com rotâmetro de bancada acusou 12 L/min em vez dos 20 L/min requeridos.',
      dataCriacao: '2026-10-28T14:30:00Z',
    },
    {
      id: 'c-02',
      categoria: 'metodo',
      descricao: 'Plano de manutenção preventiva quinzenal não contemplava inspeção do filtro de sucção da bomba',
      status: 'validada',
      evidencia: 'Procedimento MP-USIN-04 verificado: não há item de checagem do elemento filtrante.',
      dataCriacao: '2026-10-28T14:45:00Z',
    },
    {
      id: 'c-03',
      categoria: 'material',
      descricao: 'Fluido refrigerante com concentração fora de especificação ou borra acumulada',
      status: 'descartada',
      evidencia: 'Ensaio com refratômetro óptico comprovou 8% de concentração (faixa tolerada: 7% a 9%).',
      dataCriacao: '2026-10-28T15:00:00Z',
    },
    {
      id: 'c-04',
      categoria: 'mao_de_obra',
      descricao: 'Operador esqueceu de checar o nível do reservatório no início do turno',
      status: 'sintoma',
      isSintoma: true,
      alertaSintoma: 'O erro humano é sintoma. Por que o reservatório não possui sensor de nível mínimo intertravado no CLP?',
      evidencia: 'O nível estava no mínimo aceitável, mas o alarme sonoro estava desativado.',
      dataCriacao: '2026-10-28T15:15:00Z',
    },
    {
      id: 'c-05',
      categoria: 'medicao',
      descricao: 'Termopar de monitoramento de temperatura do mancal dianteiro com leitura defasada',
      status: 'validada',
      evidencia: 'Calibração com termômetro infravermelho de precisão Fluke mostrou desvio de +14°C.',
      dataCriacao: '2026-10-28T15:30:00Z',
    },
    {
      id: 'c-06',
      categoria: 'meio_ambiente',
      descricao: 'Calor excessivo no galpão industrial (temperatura ambiente atingiu 34°C)',
      status: 'descartada',
      evidencia: 'O trocador de calor do gabinete elétrico/fuso é projetado para operar até 45°C.',
      dataCriacao: '2026-10-28T15:45:00Z',
    },
  ],
  cadeias5Porques: [
    {
      id: 'whys-01',
      causaOrigemId: 'c-01',
      tituloCausaOrigem: 'Bomba secundária de fluido de arrefecimento com vazão 40% abaixo da nominal',
      categoria6M: 'maquina',
      causaRaizDefinida: 'Ausência de rotina de substituição preditiva e sensor de pressão diferencial no filtro de lubrificação.',
      passos: [
        {
          id: 'step-1',
          ordem: 1,
          pergunta: 'Por que a vazão do fluido de refrigeração caiu 40%?',
          resposta: 'Porque o rotor da bomba centrífuga estava cavitando devido à obstrução no filtro de sucção.',
          evidencia: 'Filtro removido apresentava impregnação severa de microcavacos de usinagem.',
          isCausaRaiz: false,
        },
        {
          id: 'step-2',
          ordem: 2,
          pergunta: 'Por que o filtro de sucção estava com acúmulo de microcavacos?',
          resposta: 'Porque a tela magnética do decantador primário rasgou e permitiu a passagem de partículas finas para o reservatório limpo.',
          evidencia: 'Fissura física de 15mm detectada na malha de aço inoxidável da tela.',
          isCausaRaiz: false,
        },
        {
          id: 'step-3',
          ordem: 3,
          pergunta: 'Por que a tela magnética rasgou sem que ninguém percebesse?',
          resposta: 'Porque não havia inspeção visual programada na manutenção autônoma diária do operador.',
          evidencia: 'Checklist do operador (LPP) contempla apenas limpeza externa da bancada.',
          isCausaRaiz: false,
        },
        {
          id: 'step-4',
          ordem: 4,
          pergunta: 'Por que a rotina de manutenção não contemplava a verificação da tela magnética?',
          resposta: 'Porque o plano preventivo original foi copiado de um modelo de fresadora convencional sem circuito refrigerante de alta pressão.',
          evidencia: 'Histórico de FMEA de processo (PFMEA) do equipamento nunca foi revisado após upgrade de refrigeração.',
          isCausaRaiz: false,
        },
        {
          id: 'step-5',
          ordem: 5,
          pergunta: 'Por que o PFMEA não foi revisado após a modificação de engenharia?',
          resposta: 'Porque o procedimento de Gestão de Mudanças (MOC) não possuía gatilho de atualização obrigatória dos planos de manutenção e FMEA.',
          evidencia: 'Relatório de MOC nº 2024-118 fechado sem assinatura da engenharia de manutenção preventiva.',
          isCausaRaiz: true,
          alertaValidacao: 'Causa-raiz sistêmica identificada: Falha no processo de Gestão de Mudança e atualização de FMEA.',
        },
      ],
    },
  ],
  acoes: [
    {
      id: 'act-01',
      tipo: 'contencao',
      descricao: 'Substituição imediata da tela magnética e limpeza completa com troca de 250L do fluido refrigerante.',
      responsavel: 'Denise S. (Manutenção)',
      prazo: '2026-10-29',
      status: 'concluido',
      comoVerificarEficacia: 'Medição da vazão do fuso restaurada para 21 L/min sem alarmes térmicos no turno.',
      causaAssociadaId: 'c-01',
      categoria6M: 'maquina',
    },
    {
      id: 'act-02',
      tipo: 'contencao',
      descricao: 'Instalação de manômetro temporário com indicador visual verde/vermelho na linha de recalque.',
      responsavel: 'Carlos M. (Produção)',
      prazo: '2026-10-30',
      status: 'em_andamento',
      comoVerificarEficacia: 'Conferência visual a cada início de turno registrada na folha de controle da célula.',
      causaAssociadaId: 'c-01',
      categoria6M: 'medicao',
    },
    {
      id: 'act-03',
      tipo: 'corretiva',
      descricao: 'Instalação de pressostato diferencial digital intertravado ao CLP da máquina (bloqueio do fuso se pressão cair).',
      responsavel: 'Fábio L. (Engenharia de Automação)',
      prazo: '2026-11-10',
      status: 'pendente',
      comoVerificarEficacia: 'Simulação de falha com válvula fechada: máquina deve interromper ciclo antes de aquecer.',
      causaAssociadaId: 'c-01',
      categoria6M: 'maquina',
    },
    {
      id: 'act-04',
      tipo: 'corretiva',
      descricao: 'Revisão do Procedimento Corporativo de Gestão de Mudança (MOC) tornando obrigatória a aprovação do plano de manutenção.',
      responsavel: 'Eng. Roberto Albuquerque (Qualidade)',
      prazo: '2026-11-20',
      status: 'pendente',
      comoVerificarEficacia: 'Auditoria de processo nos 5 últimos projetos de melhoria implantados na fábrica.',
      causaAssociadaId: 'c-02',
      categoria6M: 'metodo',
    },
  ],
  historicoSocratico: [
    {
      id: 'msg-01',
      remetente: 'facilitador',
      texto: 'Olá, equipe. Vamos iniciar a investigação da parada no CNC-04. Primeiramente, no momento do travamento do fuso, quais parâmetros anômalos foram registrados pelo painel de controle?',
      timestamp: '2026-10-28T14:10:00Z',
      sugestao6M: 'maquina',
    },
    {
      id: 'msg-02',
      remetente: 'usuario',
      texto: 'O painel acusou sobrecorrente de 48A e alarme de temperatura acima de 78°C no mancal frontal.',
      timestamp: '2026-10-28T14:15:00Z',
    },
    {
      id: 'msg-03',
      remetente: 'facilitador',
      texto: 'Excelente evidência quantitativa. O mancal é refrigerado pelo circuito fechado de óleo/fluido. A vazão do circuito de refrigeração estava dentro da faixa estipulada em catálogo?',
      timestamp: '2026-10-28T14:18:00Z',
      sugestao6M: 'maquina',
    },
  ],
  dataCriacao: '2026-10-28T14:00:00Z',
  dataAtualizacao: '2026-10-28T16:30:00Z',
};

export const EXEMPLO_CONCLUIDO: ProblemaOperacional = {
  id: 'prob-esteira-002',
  codigo: 'RCA-2026-039',
  titulo: 'Desalinhamento e Vibração Anômala no Mancal da Linha de Enchimento',
  descricao: 'Folga excessiva e ruído anormal de 85dB no mancal bipartido da esteira principal de transporte, acarretando micro-paradas operacionais e risco de parada crítica.',
  linha: 'Linha 01 - Envase & Embalagem',
  equipamento: 'Mancal Bipartido SN-515 (Tag: TR-ENCH01)',
  data: '2026-10-26',
  turno: '1º Turno',
  facilitador: 'Mariana Duarte (Especialista Confiabilidade)',
  equipeParticipante: 'Rodrigo P. (Mecânica), Samuel T. (Operação), Letícia B. (PCM)',
  status: 'concluido',
  causas6M: [
    {
      id: 'c-est-01',
      categoria: 'maquina',
      descricao: 'Desgaste da bucha cônica e folga diametral no rolamento autocompensador de esferas',
      status: 'validada',
      evidencia: 'Análise de vibração espectral acusou pico de BPFO de 4.8 mm/s RMS.',
      dataCriacao: '2026-10-26T08:30:00Z',
    },
    {
      id: 'c-est-02',
      categoria: 'metodo',
      descricao: 'Instrução de montagem sem especificação de torque e checagem de dobra da arruela MB',
      status: 'validada',
      evidencia: 'POP IT-MEC-014 verificado: não exigia conferência do travamento da aba.',
      dataCriacao: '2026-10-26T09:00:00Z',
    }
  ],
  cadeias5Porques: [
    {
      id: 'cad-est-01',
      causaOrigemId: 'c-est-01',
      tituloCausaOrigem: 'Folga diametral no rolamento autocompensador',
      categoria6M: 'maquina',
      passos: [
        {
          id: 'p-est-01',
          ordem: 1,
          pergunta: 'Por que o mancal apresentou vibração de 4.8 mm/s RMS?',
          resposta: 'Porque o rolamento autocompensador operava com folga excessiva no eixo.',
          evidencia: 'Medição com relógio comparador acusou 0.18mm.',
          isCausaRaiz: false,
        },
        {
          id: 'p-est-02',
          ordem: 2,
          pergunta: 'Por que operava com folga excessiva no eixo?',
          resposta: 'Porque a porca KM da bucha de fixação afrouxou com choques dinâmicos.',
          evidencia: 'Porca KM encontrada com folga de duas voltas completas.',
          isCausaRaiz: false,
        },
        {
          id: 'p-est-03',
          ordem: 3,
          pergunta: 'Por que a porca KM afrouxou durante a operação?',
          resposta: 'Porque a arruela de trava MB não teve a aba dobrada no rasgo correspondente.',
          evidencia: 'Inspeção direta confirmou abas da arruela retas e sem dobra de travamento.',
          isCausaRaiz: true,
        }
      ],
      causaRaizDefinida: 'Ausência de instrução visual e check-list de conferência do travamento da arruela MB no POP de montagem.',
    }
  ],
  acoes: [
    {
      id: 'act-est-01',
      tipo: 'contencao',
      descricao: 'Troca imediata do rolamento e travamento mecânico correto da arruela MB.',
      responsavel: 'Rodrigo P. (Mecânica)',
      prazo: '2026-10-27',
      status: 'concluido',
      comoVerificarEficacia: 'Vibração estabilizada em 0.9 mm/s RMS.',
      causaAssociadaId: 'c-est-01',
      categoria6M: 'maquina',
    },
    {
      id: 'act-est-02',
      tipo: 'corretiva',
      descricao: 'Revisão do POP IT-MEC-014 com LPP fotográfica de conferência e torque obrigatório.',
      responsavel: 'Letícia B. (PCM)',
      prazo: '2026-10-28',
      status: 'concluido',
      comoVerificarEficacia: 'Treinamento de 100% da equipe de manutenção com auditoria de 30 dias.',
      causaAssociadaId: 'c-est-02',
      categoria6M: 'metodo',
    }
  ],
  historicoSocratico: [],
  dataCriacao: '2026-10-26T08:00:00Z',
  dataAtualizacao: '2026-10-28T17:00:00Z',
};

export const LeanRootStorageService = {
  // Carrega lista de problemas
  carregarProblemas(): ProblemaOperacional[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Se vazio, salva os exemplos iniciais para enriquecer a experiência do usuário
        this.salvarProblemas([EXEMPLO_INDUSTRIAL, EXEMPLO_CONCLUIDO]);
        return [EXEMPLO_INDUSTRIAL, EXEMPLO_CONCLUIDO];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Se apenas o exemplo não-concluído estiver presente, adiciona o exemplo concluído para permitir validação imediata do TMR
        const temConcluido = parsed.some((p: ProblemaOperacional) => p.status === 'concluido');
        if (!temConcluido && parsed.length === 1 && parsed[0].id === EXEMPLO_INDUSTRIAL.id) {
          const combinada = [parsed[0], EXEMPLO_CONCLUIDO];
          this.salvarProblemas(combinada);
          return combinada;
        }
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('Falha ao carregar dados do localStorage:', e);
      return [EXEMPLO_INDUSTRIAL, EXEMPLO_CONCLUIDO];
    }
  },

  // Salva lista de problemas
  salvarProblemas(problemas: ProblemaOperacional[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(problemas));
    } catch (e) {
      console.error('Falha ao gravar no localStorage:', e);
    }
  },

  // Busca problema específico
  obterProblemaPorId(id: string): ProblemaOperacional | undefined {
    const lista = this.carregarProblemas();
    return lista.find(p => p.id === id);
  },

  // Salva ou atualiza um problema
  salvarProblema(problema: ProblemaOperacional): void {
    const lista = this.carregarProblemas();
    const index = lista.findIndex(p => p.id === problema.id);
    const atualizado = {
      ...problema,
      dataAtualizacao: new Date().toISOString(),
    };

    if (index >= 0) {
      lista[index] = atualizado;
    } else {
      lista.unshift(atualizado);
    }
    this.salvarProblemas(lista);
  },

  // Exclui um problema
  excluirProblema(id: string): ProblemaOperacional[] {
    const lista = this.carregarProblemas();
    const filtrada = lista.filter(p => p.id !== id);
    this.salvarProblemas(filtrada);
    return filtrada;
  },

  // Restaura exemplos práticos (em andamento e concluído)
  restaurarExemplo(): ProblemaOperacional[] {
    const lista = this.carregarProblemas();
    const existe = lista.some(p => p.id === EXEMPLO_INDUSTRIAL.id);
    if (!existe) {
      lista.unshift(EXEMPLO_INDUSTRIAL);
    }
    const existeConcluido = lista.some(p => p.id === EXEMPLO_CONCLUIDO.id);
    if (!existeConcluido) {
      lista.push(EXEMPLO_CONCLUIDO);
    }
    this.salvarProblemas(lista);
    return lista;
  },

  // Limpa tudo (para reset de testes)
  limparTudo(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Exportar JSON para download/backup
  exportarJSON(): string {
    const dados = this.carregarProblemas();
    return JSON.stringify(dados, null, 2);
  },

  // Importar JSON
  importarJSON(jsonStr: string): { sucesso: boolean; mensagem: string; problemas?: ProblemaOperacional[] } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) {
        return { sucesso: false, mensagem: 'O arquivo JSON deve conter uma lista de ocorrências.' };
      }
      // Validação básica de campos obrigatórios
      const validos = parsed.filter(item => item && item.id && item.titulo);
      if (validos.length === 0) {
        return { sucesso: false, mensagem: 'Nenhum registro de problema válido foi encontrado no JSON.' };
      }
      this.salvarProblemas(validos);
      return { sucesso: true, mensagem: `${validos.length} ocorrência(s) importada(s) com sucesso.`, problemas: validos };
    } catch (e) {
      return { sucesso: false, mensagem: 'Formato JSON inválido ou corrompido.' };
    }
  },

  // Calcula métricas de análise consolidadas
  calcularMetricas(problemas: ProblemaOperacional[]): MetricasAnalise {
    let causasMapeadas = 0;
    let causasValidadas = 0;
    let causasRaizIdentificadas = 0;
    let acoesAbertas = 0;
    let acoesConcluidas = 0;

    for (const prob of problemas) {
      causasMapeadas += prob.causas6M.length;
      causasValidadas += prob.causas6M.filter(c => c.status === 'validada').length;
      
      for (const cad of prob.cadeias5Porques) {
        if (cad.passos.some(p => p.isCausaRaiz)) {
          causasRaizIdentificadas++;
        }
      }

      for (const acao of prob.acoes) {
        if (acao.status === 'concluido') {
          acoesConcluidas++;
        } else {
          acoesAbertas++;
        }
      }
    }

    return {
      totalProblemas: problemas.length,
      causasMapeadas,
      causasValidadas,
      causasRaizIdentificadas,
      acoesAbertas,
      acoesConcluidas,
    };
  },

  // Calcula métricas aprofundadas de eficiência da equipe
  calcularMetricasEficiencia(problemas: ProblemaOperacional[]): MetricasEficienciaEquipe {
    let totalAcoesCorretivas = 0;
    let totalAcoesCorretivasConcluidas = 0;
    let totalAcoesContencao = 0;
    let totalAcoesContencaoConcluidas = 0;
    let acoesPendentes = 0;
    let acoesEmAndamento = 0;
    let acoesConcluidas = 0;

    const contagem6M: Record<IshikawaCategory, { total: number; validadas: number }> = {
      metodo: { total: 0, validadas: 0 },
      maquina: { total: 0, validadas: 0 },
      material: { total: 0, validadas: 0 },
      mao_de_obra: { total: 0, validadas: 0 },
      meio_ambiente: { total: 0, validadas: 0 },
      medicao: { total: 0, validadas: 0 },
    };

    let duracoesResolucaoHoras: number[] = [];

    for (const prob of problemas) {
      // Contagem 6M
      for (const c of prob.causas6M) {
        if (contagem6M[c.categoria]) {
          contagem6M[c.categoria].total++;
          if (c.status === 'validada') {
            contagem6M[c.categoria].validadas++;
          }
        }
      }

      // Ações
      for (const a of prob.acoes) {
        if (a.status === 'concluido') acoesConcluidas++;
        else if (a.status === 'em_andamento') acoesEmAndamento++;
        else acoesPendentes++;

        if (a.tipo === 'corretiva') {
          totalAcoesCorretivas++;
          if (a.status === 'concluido') totalAcoesCorretivasConcluidas++;
        } else {
          totalAcoesContencao++;
          if (a.status === 'concluido') totalAcoesContencaoConcluidas++;
        }
      }

      // Cálculo de tempo de resolução estimado em horas
      if (prob.dataCriacao && prob.dataAtualizacao) {
        const diffMs = Math.max(0, new Date(prob.dataAtualizacao).getTime() - new Date(prob.dataCriacao).getTime());
        const horas = Math.max(1.5, Number((diffMs / (1000 * 60 * 60)).toFixed(1)));
        duracoesResolucaoHoras.push(horas);
      }
    }

    // Tempo médio de resolução em dias e horas (benchmark Lean: 2.5 a 4.5 dias)
    const mediaHoras = duracoesResolucaoHoras.length > 0
      ? Number((duracoesResolucaoHoras.reduce((acc, h) => acc + h, 0) / duracoesResolucaoHoras.length).toFixed(1))
      : 3.5;
    const mediaDias = Number((mediaHoras / 8).toFixed(1)) || 2.8;

    // Taxa de eficácia de ações corretivas
    const taxaEficacia = totalAcoesCorretivas > 0
      ? Math.round((totalAcoesCorretivasConcluidas / totalAcoesCorretivas) * 100)
      : totalAcoesContencaoConcluidas > 0 ? 80 : 75;

    // Aderência 6M (quantos eixos possuem pelo menos 1 hipótese)
    const eixosAtivos = Object.values(contagem6M).filter(cat => cat.total > 0).length;
    const taxaAderencia = Math.round((eixosAtivos / 6) * 100);

    const distribuicaoPor6M = (Object.keys(contagem6M) as IshikawaCategory[]).map(catKey => ({
      categoria: catKey,
      nome: ISHIKAWA_CATEGORIES[catKey].shortLabel,
      total: contagem6M[catKey].total,
      validadas: contagem6M[catKey].validadas,
      cor: ISHIKAWA_CATEGORIES[catKey].color,
    }));

    const distribuicaoStatusAcoes = [
      { name: 'Concluídas', value: acoesConcluidas || (totalAcoesCorretivasConcluidas + totalAcoesContencaoConcluidas) || 1, color: '#10B981' },
      { name: 'Em Andamento', value: acoesEmAndamento || 1, color: '#3B82F6' },
      { name: 'Pendentes', value: acoesPendentes || 1, color: '#F59E0B' },
    ];

    return {
      tempoMedioResolucaoDias: mediaDias,
      tempoMedioInvestigacaoHoras: mediaHoras,
      taxaEficaciaAcoesCorretivas: taxaEficacia,
      taxaAderencia6M: taxaAderencia,
      totalAcoesCorretivas,
      totalAcoesCorretivasConcluidas,
      totalAcoesContencao,
      totalAcoesContencaoConcluidas,
      distribuicaoPor6M,
      distribuicaoStatusAcoes,
    };
  },

  // Preferência de tema
  obterTema(): 'dark' | 'light' {
    const salvo = localStorage.getItem(THEME_KEY);
    if (salvo === 'light' || salvo === 'dark') {
      return salvo;
    }
    // Default: dark mode industrial para chão de fábrica
    return 'dark';
  },

  salvarTema(tema: 'dark' | 'light'): void {
    localStorage.setItem(THEME_KEY, tema);
  },
};
