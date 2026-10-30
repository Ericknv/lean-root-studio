/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IshikawaCategory = 
  | 'metodo' 
  | 'maquina' 
  | 'material' 
  | 'mao_de_obra' 
  | 'meio_ambiente' 
  | 'medicao';

export interface CategoryInfo {
  id: IshikawaCategory;
  name: string;
  shortLabel: string;
  description: string;
  guidingQuestion: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  exemplosTipicos: string[];
  dicaLean: string;
}

export const ISHIKAWA_CATEGORIES: Record<IshikawaCategory, CategoryInfo> = {
  metodo: {
    id: 'metodo',
    name: 'Método (Processos e Procedimentos)',
    shortLabel: 'Método',
    description: 'Instruções de trabalho, sequência operacional, parâmetros e padrões de fabricação.',
    guidingQuestion: 'O procedimento padrão é claro, está atualizado e foi testado em condições reais?',
    color: '#3B82F6', // Blue
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
    exemplosTipicos: [
      'Parâmetro de processo fora da janela operacional ideal (temperatura, pressão, velocidade)',
      'Instrução de trabalho (POP) ambígua, desatualizada ou ausente no posto',
      'Sequência de aperto, montagem ou tempo de cura executada fora da ordem padrão',
    ],
    dicaLean: 'Se o operador seguiu rigorosamente a instrução escrita e a falha ocorreu, o problema é do Método!',
  },
  maquina: {
    id: 'maquina',
    name: 'Máquina (Equipamentos e Ferramental)',
    shortLabel: 'Máquina',
    description: 'Condição mecânica, elétrica, hidráulica, desgaste, folgas e lubrificação.',
    guidingQuestion: 'Houve desgaste prematuro, falha em componente móvel ou perda de calibração?',
    color: '#F59E0B', // Amber
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    exemplosTipicos: [
      'Desgaste de bucha, fuso de esferas, guia linear ou folga em rolamento',
      'Vazamento pneumático/hidráulico gerando perda intermitente de pressão',
      'Superaquecimento de servoacionamento, falha de fim de curso ou encoder desregulado',
    ],
    dicaLean: 'Não assuma erro humano se a máquina apresenta microparadas cíclicas, vibração ou aquecimento.',
  },
  material: {
    id: 'material',
    name: 'Material (Matéria-prima e Insumos)',
    shortLabel: 'Material',
    description: 'Variação de lote, dureza, dimensões, pureza, validade ou especificação incorreta.',
    guidingQuestion: 'O insumo atendeu aos certificados de conformidade e testes de recebimento?',
    color: '#10B981', // Emerald
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    exemplosTipicos: [
      'Variação de lote de fornecedor (dureza do tarugo, rugosidade ou teor de impureza)',
      'Umidade residual na resina plástica ou matéria-prima antes do processamento',
      'Insumo de corte, adesivo ou óleo lubrificante vencido ou com viscosidade alterada',
    ],
    dicaLean: 'Se a anomalia começou logo após a troca de bobina, fardo ou fornecedor, priorize a verificação de Material.',
  },
  mao_de_obra: {
    id: 'mao_de_obra',
    name: 'Mão de Obra (Pessoas e Capacitação)',
    shortLabel: 'Mão de Obra',
    description: 'Matriz de competências, ergonomia, fadiga, treinamento ou comunicação no turno.',
    guidingQuestion: 'A equipe foi formalmente capacitada e o posto oferece ergonomia e condições adequadas?',
    color: '#8B5CF6', // Purple
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeText: 'text-purple-700 dark:text-purple-300',
    exemplosTipicos: [
      'Operador recente ou cobrindo posto sem capacitação formal na versão vigente do POP',
      'Fadiga muscular, má postura ergonômica ou iluminação insuficiente no ponto crítico',
      'Desalinhamento na passagem de serviço entre turnos ou comunicação truncada de alertas',
    ],
    dicaLean: 'Lema Lean: "Ataque o processo, apoie as pessoas". Na maioria das vezes a causa-raiz recai em Treinamento ou Método.',
  },
  meio_ambiente: {
    id: 'meio_ambiente',
    name: 'Meio Ambiente (Condições do Posto)',
    shortLabel: 'Meio Ambiente',
    description: 'Temperatura ambiente, umidade, vibração do piso, iluminação, poeira e cavacos.',
    guidingQuestion: 'Condições térmicas, poeira ou interferências do entorno afetaram o resultado?',
    color: '#EC4899', // Pink
    badgeBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    badgeText: 'text-pink-700 dark:text-pink-300',
    exemplosTipicos: [
      'Dilatação térmica em peças de alta precisão durante picos de calor da tarde',
      'Poeira abrasiva, névoa de óleo ou cavacos depositados em lentes de sensores',
      'Vibração estrutural proveniente de prensa pesada vizinha afetando a calibração',
    ],
    dicaLean: 'Verifique se os desvios coincidem com oscilações climáticas (chuva, calor do meio-dia) ou vibrações no chão.',
  },
  medicao: {
    id: 'medicao',
    name: 'Medição (Instrumentos e Critérios)',
    shortLabel: 'Medição',
    description: 'Calibração, repetibilidade (R&R), critérios subjetivos de inspeção e sensores.',
    guidingQuestion: 'O instrumento de medição é confiável e a tolerância foi respeitada?',
    color: '#06B6D4', // Cyan
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    exemplosTipicos: [
      'Paquímetro, relógio comparador ou torquímetro descalibrado ou com desgaste',
      'Critério de aprovação visual subjetivo (ausência de padrão de limite visual claro)',
      'Sensor óptico com desvio térmico (drift) ou erro de amostragem no plano de controle',
    ],
    dicaLean: 'Valide a peça com um segundo padrão calibrado antes de desmontar o equipamento. O desvio pode estar na Medição!',
  },
};

export type CauseStatus = 
  | 'hipotese' 
  | 'sintoma' 
  | 'validada' 
  | 'descartada' 
  | 'causa_raiz';

export interface Causa6M {
  id: string;
  categoria: IshikawaCategory;
  descricao: string;
  status: CauseStatus;
  evidencia?: string;
  isSintoma?: boolean;
  alertaSintoma?: string;
  dataCriacao: string;
}

export interface No5Porques {
  id: string;
  ordem: number; // 1 a 5
  pergunta: string;
  resposta: string;
  evidencia: string;
  isCausaRaiz: boolean;
  alertaValidacao?: string;
}

export interface Cadeia5Porques {
  id: string;
  causaOrigemId: string;
  tituloCausaOrigem: string;
  categoria6M: IshikawaCategory;
  passos: No5Porques[];
  causaRaizDefinida?: string;
}

export type TipoAcao = 'contencao' | 'corretiva';
export type StatusAcao = 'pendente' | 'em_andamento' | 'concluido';

export interface ItemPlanoAcao {
  id: string;
  tipo: TipoAcao;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: StatusAcao;
  comoVerificarEficacia: string;
  causaAssociadaId?: string;
  categoria6M?: IshikawaCategory;
}

export type StatusProblema = 
  | 'investigando' 
  | 'causa_identificada' 
  | 'em_acoes' 
  | 'concluido';

export type TurnoTrabalho = 
  | '1º Turno' 
  | '2º Turno' 
  | '3º Turno' 
  | 'Turno Administrativo' 
  | 'Revezamento';

export interface MensagemSocratica {
  id: string;
  remetente: 'facilitador' | 'usuario';
  texto: string;
  timestamp: string;
  sugestao6M?: IshikawaCategory;
  isAlertaSintoma?: boolean;
  alertaMotivo?: string;
  perguntaInvestigativa?: string;
}

export interface ProblemaOperacional {
  id: string;
  codigo: string; // Ex: INC-2026-001
  titulo: string;
  descricao: string;
  linha: string;
  equipamento: string;
  data: string;
  turno: TurnoTrabalho;
  facilitador: string;
  equipeParticipante: string; // Lista separada por vírgula ou texto
  status: StatusProblema;
  causas6M: Causa6M[];
  cadeias5Porques: Cadeia5Porques[];
  acoes: ItemPlanoAcao[];
  historicoSocratico: MensagemSocratica[];
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface MetricasAnalise {
  totalProblemas: number;
  causasMapeadas: number;
  causasValidadas: number;
  causasRaizIdentificadas: number;
  acoesAbertas: number;
  acoesConcluidas: number;
}

export interface MetricasEficienciaEquipe {
  tempoMedioResolucaoDias: number;
  tempoMedioInvestigacaoHoras: number;
  taxaEficaciaAcoesCorretivas: number; // Porcentagem (0 a 100)
  taxaAderencia6M: number; // Porcentagem de eixos cobertos
  totalAcoesCorretivas: number;
  totalAcoesCorretivasConcluidas: number;
  totalAcoesContencao: number;
  totalAcoesContencaoConcluidas: number;
  distribuicaoPor6M: Array<{
    categoria: IshikawaCategory;
    nome: string;
    total: number;
    validadas: number;
    cor: string;
  }>;
  distribuicaoStatusAcoes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

