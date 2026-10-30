# LeanRoot — Assistente de Resolução de Problemas Lean (Ishikawa 6M & 5 Porquês)

Aplicação web client-side voltada para facilitação e condução metódica de sessões de PDCA, Kaizen e 8D em ambientes industriais, integrando motor socrático investigativo, mapeamento dinâmico em Diagrama de Ishikawa (6M), desdobramento vertical dos 5 Porquês, validação de causas sintomáticas versus causas-raiz, matriz de ações de contenção/correção e exportação de atas formais de reunião.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Ajustes confirmados na revisão de escopo:**
> - **Arquitetura 100% Client-Side**: Sem dependência de backend nesta primeira versão. Todas as regras de facilitação socrática, geração de perguntas investigativas, alertas de causas sintomáticas e persistência operam no navegador via TypeScript e `localStorage`.
> - **Operação Segura de Chão de Fábrica**: Funcionamento offline em tablets industriais e computadores de engenharia, garantindo privacidade fabril e resiliência sem falhas de rede.
> - **Gestão Multiproblemas**: Lista de ocorrências com seleção ativa, contadores de análise no topo, criação rápida e exclusão apenas com confirmação explícita em modal de segurança.
> - **Exportação Híbrida da Ata**: Suporte tanto à cópia em texto estruturado formatado (para e-mails e sistemas ERP/MES) quanto à visualização formal com layout pronto para impressão A4 / PDF.

---

## 1. Problema que o Aplicativo Resolve & Público

### 1.1 O Problema
Nas indústrias, reuniões de análise de falhas frequentemente terminam de forma precipitada e superficial. Problemas recorrentes são atribuídos a "falha humana", "falta de atenção" ou substituem-se componentes desgastados sem investigar o que causou o desgaste anormal. Isso gera reincidência de paradas, custos com refugo e desmotivação das equipes. A condução manual de Ishikawa e 5 Porquês muitas vezes perde a rastreabilidade e deixa hipóteses sem comprovação por evidências concretas ou causas-raiz sem ações corretivas atribuídas.

### 1.2 Público Principal
- **Engenheiros de Processos e Manufatura**: Lideram investigações técnicas e padronização.
- **Especialistas de Qualidade e Confiabilidade**: Garantem conformidade com IATF 16949, ISO 9001 e metodologias 8D/QRQC.
- **Líderes de Produção e Supervisores de Turno**: Alimentam dados imediatos do evento em tablets industriais no chão de fábrica.
- **Facilitadores de Kaizen e Especialistas Lean Six Sigma**: Conduzem dinâmica de grupo desafiando premissas fracas.

---

## 2. Requisitos Funcionais

1. **Cadastro e Gestão de Ocorrências Operacionais**:
   - Campos: Título, Descrição factual detalhada (O que ocorreu, onde e impacto), Linha/Célula, Equipamento/Tag, Data, Turno e Status da ocorrência (*Em Investigação*, *Causa-Raiz Identificada*, *Ações em Andamento*, *Concluído*).
   - Lista lateral ou suspensa de problemas cadastrados com contadores visuais (Total de problemas, Causas mapeadas, Ações abertas).
   - Exclusão com confirmação explícita de segurança (modal com duplo clique/confirmação).
   - Estado de tela inicial claro e amigável quando nenhum problema estiver cadastrado (com opção de carregar caso de exemplo da indústria automotiva/usinagem).

2. **Facilitador Socrático Virtual Inteligente (Frontend Engine)**:
   - Motor heurístico especializado em Lean Manufacturing que avalia a descrição da falha e as respostas fornecidas.
   - Geração de perguntas técnicas investigativas direcionadas por categoria do 6M (ex.: perguntas de *Método* sobre instruções de trabalho e parâmetros; *Máquina* sobre calibração, desgaste e manutenção preventiva; *Medição* sobre repetibilidade e calibração de instrumentos).
   - Detecção e alerta visual imediato de **Causas Sintomáticas** (ex.: identificar quando uma causa diz "operador se distraiu", "sensor quebrou", "peça veio ruim" e sugerir desdobramento sistêmico).
   - Botões de inserção rápida de respostas diretamente no Diagrama de Ishikawa ou na cadeia dos 5 Porquês.

3. **Diagrama de Ishikawa Interativo (6M)**:
   - Visualização organizada nos 6 eixos canônicos: **Método**, **Máquina**, **Material**, **Mão de Obra**, **Meio Ambiente**, **Medição**.
   - Alocação e edição de hipóteses com status definido: *Hipótese em Aberto*, *Validada com Evidência*, *Descartada*.
   - Sinalização de causas sintomáticas com badge de atenção e sugestão de aprofundamento.
   - Botão direto para "Desdobrar nos 5 Porquês".

4. **Desdobramento Vertical da Cadeia dos 5 Porquês**:
   - Conexão em cascata visual do Porquê 1 ao Porquê 5 (com suporte a níveis adicionais ou conclusão antecipada se a causa fundamental for encontrada).
   - Cada nível contém: Pergunta investigativa, Resposta da equipe, Evidência física registrada e marcação de *Causa-Raiz Confirmada*.
   - Alerta visual quando uma causa-raiz confirmada ainda não possui ações corretivas correspondentes.

5. **Plano de Ação Integrado (Contenção & Correção)**:
   - **Ações de Contenção (Imediatas)**: Bloqueio de lote, segregação de peças, inspeção 100%, ajuste temporário de setup.
   - **Ações Corretivas (Sistêmicas)**: Poka-Yoke (à prova de falhas), alteração de parâmetro de engenharia, revisão de plano de manutenção autônoma, atualização de procedimento padrão.
   - Atributos 5W2H essenciais: O que será feito, Responsável, Prazo de execução, Status (*Pendente*, *Em Andamento*, *Concluído*) e Método de Verificação da Eficácia.

6. **Exportação da Ata de Reunião**:
   - Exportação para Área de Transferência em **Texto Estruturado (Markdown/Plain Text)** para rápido envio por e-mail ou registro em chamados MES/ERP.
   - Visualização de **Ata Consolidada Executiva A4**, com formatação técnica para impressão física ou salvamento em PDF nativo do navegador (`window.print()`).

7. **Persistência de Dados (`localStorage`)**:
   - Serviço desacoplado `LeanRootStorageService` com serialização e desserialização robusta, validação de integridade e exportação/importação de arquivo `.json` para backup ou compartilhamento entre turnos.

---

## 3. Critérios de Teste e Aceitação (Primeira Versão)

| ID | Cenário de Teste | Critério de Aceitação / Resultado Esperado |
|---|---|---|
| **CT-01** | Zero-State & Caso de Demonstração | Ao abrir pela primeira vez sem dados, a interface exibe estado vazio instrucional e botão para "Carregar Exemplo Prático" (ex.: Parada por sobreaquecimento de fuso em centro de usinagem CNC). |
| **CT-02** | Cadastro e Persistência de Problema | Cadastrar um problema com linha, equipamento, turno e descrição detalhada. Ao recarregar a página (F5), todos os dados, causas e ações permanecem inalterados. |
| **CT-03** | Motor Socrático & Alerta de Sintoma | Ao inserir uma resposta comum como "operador esqueceu de lubrificar", o sistema emite um alerta explícito: *"Causa sintomática detectada: O erro humano é consequência, não a causa-raiz. Por que o procedimento não preveniu o esquecimento?"* |
| **CT-04** | Alocação no Ishikawa 6M | Inserir causas em diferentes eixos do 6M e alterar seu status para "Validada" ou "Descartada". O diagrama visualiza a distribuição equilibrada ou desbalanceada dos 6M. |
| **CT-05** | Encadeamento dos 5 Porquês | Selecionar uma causa validada do Ishikawa e desdobrar os 5 Porquês até marcar um nó como "Causa-Raiz Confirmada". O nó recebe destaque visual diferenciado. |
| **CT-06** | Vinculação com Plano de Ação | Criar uma ação de contenção e uma ação corretiva. Se a causa-raiz estiver identificada mas nenhuma ação corretiva estiver cadastrada, um banner de aviso orienta a equipe a preencher a ação. |
| **CT-07** | Exclusão Segura | Clicar em excluir um problema exige confirmação em modal de diálogo; ao confirmar, o item é removido do `localStorage` e a seleção retorna para o próximo problema ou zero-state. |
| **CT-08** | Exportação da Ata | Clicar em "Copiar Ata em Texto" transfere o resumo completo com Ishikawa e 5 Porquês para o clipboard com notificação de sucesso. Clicar em "Imprimir Ata A4" abre a prévia de impressão com visual limpo e diagramas nítidos. |
| **CT-09** | Alternância de Tema e Responsividade | Alternar entre Modo Claro e Escuro mantém alto contraste e legibilidade em todas as áreas; em viewport de tablet (768px - 1024px), os painéis adaptam-se sem cortes horizontais. |

---

## 4. User Experience & Visual Design

### Paleta e Tokens de Alto Contraste Industrial
- **Dual-Theme**:
  - *Modo Escuro Industrial*: Fundo `#0A0E17`, painéis `#121826`, bordas `border-slate-800`, textos primários `text-slate-100`, secundários `text-slate-400`.
  - *Modo Claro Técnico*: Fundo `#F8FAFC`, painéis `#FFFFFF`, bordas `border-slate-200`, textos primários `text-slate-900`, secundários `text-slate-600`.
- **Destaques de Estado Operacional (ISO/Segurança)**:
  - Causa-Raiz / Foco: Azul Cobalto (`#2563EB`)
  - Alerta de Sintoma: Laranja Âmbar (`#D97706`)
  - Ação Concluída / Causa Validada: Verde Esmeralda (`#059669`)
  - Hipótese Descartada: Cinza Muted (`#64748B`)
  - Parada / Severidade Alta: Vermelho Carmim (`#DC2626`)
- **Tipografia**:
  - Títulos e Navegação: `Plus Jakarta Sans` (peso 600 e 700).
  - Conteúdo e Descrições: `Plus Jakarta Sans` (14px–15px).
  - Dados Técnicos, Tags de Equipamento, Turnos e Contadores: `JetBrains Mono` com `font-variant-numeric: tabular-nums`.

---

## 5. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LeanRoot App (React + TS)                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ TopBar: Nome do App, Indicadores Rápidos (KPIs), Seletor de Tema │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌────────────────────┐ ┌───────────────────────────────────────────┐  │
│  │ Barra Lateral /    │ │ Painel Central de Análise                 │  │
│  │ Seletor Ocorrências│ │  - Detalhes da Ocorrência                 │  │
│  │  - Lista Problemas │ │  - Facilitador Socrático Integrado        │  │
│  │  - Novo Problema   │ │  - Visualização em Abas / Seções:         │  │
│  │  - Backup JSON     │ │    [1. Ishikawa 6M]  [2. 5 Porquês]       │  │
│  │                    │ │    [3. Plano Ação]   [4. Ata A4/Export]   │  │
│  └─────────┬──────────┘ └─────────────────────┬─────────────────────┘  │
│            │                                  │                        │
│            └──────────────────┬───────────────┘                        │
│                               ▼                                        │
│                ┌──────────────────────────────┐                        │
│                │      LeanRoot Core Engine    │                        │
│                │   - Socratic Rules Engine    │                        │
│                │   - Symptom Classifier       │                        │
│                │   - 6M Reasoner              │                        │
│                └──────────────┬───────────────┘                        │
│                               │                                        │
│                               ▼                                        │
│                ┌──────────────────────────────┐                        │
│                │    LeanRootStorageService    │                        │
│                │  (Persistência localStorage) │                        │
│                └──────────────────────────────┘                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Tipos de Dados e Interfaces (`src/types/leanRoot.ts`)

```typescript
export type IshikawaCategory = 
  | 'metodo' 
  | 'maquina' 
  | 'material' 
  | 'mao_de_obra' 
  | 'meio_ambiente' 
  | 'medicao';

export type CauseStatus = 'sintoma' | 'hipotese' | 'validada' | 'descartada' | 'causa_raiz';

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

export interface ItemPlanoAcao {
  id: string;
  tipo: 'contencao' | 'corretiva';
  descricao: string;
  responsavel: string;
  prazo: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  comoVerificarEficacia: string;
  causaAssociadaId?: string;
}

export type StatusProblema = 'investigando' | 'causa_identificada' | 'em_acoes' | 'concluido';

export interface MensagemSocratica {
  id: string;
  remetente: 'facilitador' | 'usuario';
  texto: string;
  timestamp: string;
  sugestao6M?: IshikawaCategory;
  isAlertaSintoma?: boolean;
}

export interface ProblemaOperacional {
  id: string;
  codigo: string; // Ex: INC-2026-001
  titulo: string;
  descricao: string;
  linha: string;
  equipamento: string;
  data: string;
  turno: '1º Turno' | '2º Turno' | '3º Turno' | 'Turno Administrativo';
  facilitador: string;
  equipeParticipante: string[];
  status: StatusProblema;
  causas6M: Causa6M[];
  cadeias5Porques: Cadeia5Porques[];
  acoes: ItemPlanoAcao[];
  historicoSocratico: MensagemSocratica[];
  dataCriacao: string;
  dataAtualizacao: string;
}
```

### Componentes Principais da Solução
- `src/types/leanRoot.ts`: Modelos de dados completos e tipagem estrita.
- `src/services/storageService.ts`: Serviço de persistência no `localStorage` (`leanroot_data_v1`), com seeding de dados realistas e importação/exportação JSON.
- `src/services/socraticEngine.ts`: Motor heurístico de perguntas investigativas 6M, analisador de causas sintomáticas e gerador de questionamentos desafiadores.
- `src/components/TopBar.tsx`: Cabeçalho padrão corporativo, contadores rápidos (Problemas, Causas, Ações), alternador Claro/Escuro e atalhos globais.
- `src/components/ProblemSidebar.tsx`: Lista e filtro de problemas, acionamento do modal de novo problema, modal de confirmação de exclusão e importação/exportação.
- `src/components/ProblemHeader.tsx`: Informações factuais do problema selecionado, status do ciclo PDCA e edição rápida.
- `src/components/SocraticFacilitator.tsx`: Assistente de diálogo investigativo com perguntas automáticas geradas a partir do contexto atual, formulário de resposta rápida e botão "Adicionar ao Ishikawa".
- `src/components/IshikawaVisualizer.tsx`: Diagrama gráfico de espinha de peixe (6M) interativo com cards de causa, classificação de status e botão para disparar 5 Porquês.
- `src/components/FiveWhysCascade.tsx`: Árvore vertical fluida dos 5 Porquês com validação de evidência, encadeamento lógico e marcação de causa-raiz.
- `src/components/ActionPlanTable.tsx`: Matriz 5W2H separada em Contenção (imediata) e Correção (sistêmica) com alertas de causas-raiz sem ação.
- `src/components/MeetingMinutesView.tsx`: Visualização e modal de ata pronta para cópia em texto estruturado e impressão A4 executiva.
- `src/components/NewProblemModal.tsx` e `ConfirmDeleteModal.tsx`: Modais acessíveis para gerenciamento seguro dos registros.

---

## 7. Atualização de Arquitetura: Transição para SPA & Central de Exportações Técnicas (Concluído)

### 7.1 Eliminação da Poluição Visual via Arquitetura SPA Multi-Páginas
A aplicação transitou de uma página única com painéis empilhados para uma estrutura modular SPA profissional em 4 rotas/visões dedicadas:
1. **`dashboard` (Cockpit Executivo & Eficiência Operacional)**:
   - Apresenta KPIs consolidados da planta (MTTR / Tempo Médio de Resolução, Taxa de Eficácia de Ações Corretivas, Distribuição por Eixo 6M com Recharts).
   - Grade de cartões de anomalias com indicadores de status e acesso direto à mesa técnica de investigação.
2. **`investigacao` (Mesa Técnica de Análise de Causa-Raiz)**:
   - Foco total e despoluído na ocorrência ativa com barra lateral de navegação e busca.
   - Sub-abas especializadas: Diagrama de Ishikawa 6M, Árvore dos 5 Porquês, Plano de Ação 5W2H e Facilitador Socrático Virtual.
   - Botões de exportação rápida direta (PDF e Excel) em cada sub-módulo.
3. **`matriz-acoes` (Matriz Consolidada de Ações 5W2H da Fábrica)**:
   - Central para acompanhamento de todas as contramedidas de contenção e corretivas da planta inteira.
   - Filtros por Tipo (Contenção vs Corretiva), Status e Busca textual em tempo real.
   - Exportação em 1 clique para planilha Excel nativa (.xlsx) e relatório PDF Paisagem da fábrica.
4. **`exportacoes` (Central Técnica de Exportação de Dossiês & Relatórios 8D)**:
   - Hub dedicado com cartões de exportação individual e completa.
   - Seletor de ocorrência com auditoria de integridade técnica (cobertura 6M, validação de causa-raiz e contramedidas).

### 7.2 Suíte Unificada de Exportação Técnica (PDF & Excel .xlsx)
Implementado serviço modular `src/services/technicalExportService.ts` com a biblioteca nativa `xlsx`:
- **Ata Técnica Completa (Relatório 8D / A3 de Engenharia)**:
  - Planilha Excel (.xlsx) estruturada com 4 abas nativas: *1. Resumo & Metadados*, *2. Ishikawa 6M*, *3. 5 Porquês & Causa-Raiz*, *4. Plano 5W2H*.
  - PDF oficial A4 contendo dados operacionais, descrição factual, matriz 6M, cadeia causal com destaque de causa-raiz e campos de homologação formal.
- **Exportações Individuais Granulares**:
  - *Ishikawa 6M*: PDF e Excel (.xlsx) contendo hipóteses, status, sintomas e evidências coletadas.
  - *5 Porquês & Causa-Raiz*: PDF e Excel (.xlsx) contendo níveis de causalidade do 1º ao 5º porquê e causa fundamental destacada.
  - *Plano de Ação 5W2H*: PDF e Excel (.xlsx) com tipo de ação, responsável, prazo e verificação de eficácia.
  - *Ata de Reunião*: PDF formal da reunião de alinhamento com participantes.
  - *Matriz da Planta*: PDF e Excel (.xlsx) consolidando todas as ações da fábrica.

