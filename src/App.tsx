/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  RotateCcw, 
  PlusCircle, 
  Layers
} from 'lucide-react';
import { 
  ProblemaOperacional, 
  Causa6M, 
  CauseStatus, 
  StatusProblema, 
  ItemPlanoAcao, 
  No5Porques, 
  MensagemSocratica, 
  TurnoTrabalho,
  StatusAcao
} from './types/leanRoot';
import { LeanRootStorageService } from './services/storageService';
import { TopBar, PaginaSPA } from './components/TopBar';
import { ProblemSidebar } from './components/ProblemSidebar';
import { ExecutiveDashboardView } from './components/ExecutiveDashboardView';
import { InvestigationWorkspace } from './components/InvestigationWorkspace';
import { ConsolidatedActionMatrix } from './components/ConsolidatedActionMatrix';
import { TechnicalExportHub } from './components/TechnicalExportHub';
import { NewProblemModal } from './components/NewProblemModal';
import { QuickCaptureModal } from './components/QuickCaptureModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { MeetingMinutesView } from './components/MeetingMinutesView';

export default function App() {
  // 1. Estado de Persistência e Lista de Ocorrências
  const [problemas, setProblemas] = useState<ProblemaOperacional[]>(() => {
    return LeanRootStorageService.carregarProblemas();
  });

  const [problemaAtivoId, setProblemaAtivoId] = useState<string | null>(() => {
    const lista = LeanRootStorageService.carregarProblemas();
    return lista.length > 0 ? lista[0].id : null;
  });

  // 2. Rota Ativa da SPA (Dashboard, Mesa de Investigação, Matriz 5W2H, Central de Exportações)
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaSPA>('dashboard');

  // 3. Tema Claro / Escuro Carbon de Alto Contraste
  const [tema, setTema] = useState<'dark' | 'light'>(() => {
    return LeanRootStorageService.obterTema();
  });

  useEffect(() => {
    const root = document.documentElement;
    if (tema === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    LeanRootStorageService.salvarTema(tema);
  }, [tema]);

  const alternarTema = () => {
    setTema(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 4. Estados da Mesa de Investigação
  const [cadeiaAtivaId, setCadeiaAtivaId] = useState<string | undefined>();
  const [causaSugeridaParaAcao, setCausaSugeridaParaAcao] = useState<string | undefined>();
  const [sidebarAbertaMobile, setSidebarAbertaMobile] = useState(false);

  // 5. Modais Globais
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalCapturaRapidaAberto, setModalCapturaRapidaAberto] = useState(false);
  const [problemaParaEditar, setProblemaParaEditar] = useState<ProblemaOperacional | undefined>();
  const [problemaParaExcluir, setProblemaParaExcluir] = useState<{ id: string; titulo: string } | null>(null);
  const [modalAtaAberto, setModalAtaAberto] = useState(false);

  // Atalho de teclado global para Captura Rápida (Alt+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const isInputFocused =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl?.tagName) || activeEl?.isContentEditable;

      const isAltN = e.altKey && (e.key === 'n' || e.key === 'N' || e.code === 'KeyN');
      const isCtrlShiftA = e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A');
      const isDirectN =
        !isInputFocused && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'n' || e.key === 'N');

      if (isAltN || isCtrlShiftA || isDirectN) {
        if (!modalNovoAberto && !modalAtaAberto && !problemaParaExcluir) {
          e.preventDefault();
          setModalCapturaRapidaAberto(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalNovoAberto, modalAtaAberto, problemaParaExcluir]);

  // 6. Toast Feedback
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMensagem(msg);
    setTimeout(() => setToastMensagem(null), 3000);
  };

  // Problema selecionado ativo
  const problemaAtivo = problemas.find(p => p.id === problemaAtivoId);

  // Atualiza um problema na lista e salva automaticamente no localStorage
  const atualizarProblemaAtivo = (problemaAtualizado: ProblemaOperacional) => {
    const novaLista = problemas.map(p => (p.id === problemaAtualizado.id ? problemaAtualizado : p));
    setProblemas(novaLista);
    LeanRootStorageService.salvarProblemas(novaLista);
  };

  // Atualiza status de uma ação na matriz consolidada fabril
  const handleAtualizarAcaoStatusNaMatriz = (problemaId: string, acaoId: string, novoStatus: StatusAcao) => {
    const novaLista = problemas.map(prob => {
      if (prob.id !== problemaId) return prob;
      return {
        ...prob,
        acoes: prob.acoes.map(a => a.id === acaoId ? { ...a, status: novoStatus } : a),
      };
    });
    setProblemas(novaLista);
    LeanRootStorageService.salvarProblemas(novaLista);
    mostrarToast('Status da contramedida atualizado na matriz.');
  };

  // Handlers do Diagrama de Ishikawa
  const handleAdicionarCausa = (novaCausa: Omit<Causa6M, 'id' | 'dataCriacao'>) => {
    if (!problemaAtivo) return;

    const causaCompleta: Causa6M = {
      ...novaCausa,
      id: `causa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dataCriacao: new Date().toISOString(),
    };

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      causas6M: [...problemaAtivo.causas6M, causaCompleta],
    };

    atualizarProblemaAtivo(atualizado);
    mostrarToast(`Hipótese adicionada ao eixo ${novaCausa.categoria.toUpperCase()}.`);
  };

  const handleAtualizarStatusCausa = (causaId: string, novoStatus: CauseStatus, evidencia?: string) => {
    if (!problemaAtivo) return;

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      causas6M: problemaAtivo.causas6M.map(c => 
        c.id === causaId ? { ...c, status: novoStatus, evidencia: evidencia ?? c.evidencia } : c
      ),
    };

    atualizarProblemaAtivo(atualizado);
  };

  const handleExcluirCausa = (causaId: string) => {
    if (!problemaAtivo) return;

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      causas6M: problemaAtivo.causas6M.filter(c => c.id !== causaId),
      cadeias5Porques: problemaAtivo.cadeias5Porques.filter(cad => cad.causaOrigemId !== causaId),
    };

    atualizarProblemaAtivo(atualizado);
    mostrarToast('Hipótese removida do diagrama.');
  };

  // Handlers do Diálogo Socrático
  const handleAdicionarMensagemChat = (msg: Omit<MensagemSocratica, 'id' | 'timestamp'>) => {
    if (!problemaAtivo) return;

    const msgCompleta: MensagemSocratica = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      historicoSocratico: [...problemaAtivo.historicoSocratico, msgCompleta],
    };

    atualizarProblemaAtivo(atualizado);
  };

  // Handlers da Árvore dos 5 Porquês
  const handleIniciar5Porques = (causa: Causa6M) => {
    if (!problemaAtivo) return;

    let cadeia = problemaAtivo.cadeias5Porques.find(c => c.causaOrigemId === causa.id);

    if (!cadeia) {
      cadeia = {
        id: `whys-${Date.now()}`,
        causaOrigemId: causa.id,
        tituloCausaOrigem: causa.descricao,
        categoria6M: causa.categoria,
        passos: [
          {
            id: `step-${Date.now()}-1`,
            ordem: 1,
            pergunta: `Por que a anomalia "${causa.descricao}" ocorreu?`,
            resposta: '',
            evidencia: causa.evidencia || '',
            isCausaRaiz: false,
          },
        ],
      };

      const atualizado: ProblemaOperacional = {
        ...problemaAtivo,
        cadeias5Porques: [...problemaAtivo.cadeias5Porques, cadeia],
      };

      atualizarProblemaAtivo(atualizado);
    }

    setCadeiaAtivaId(cadeia.id);
    mostrarToast('Cadeia dos 5 Porquês iniciada.');
  };

  const handleAdicionarPasso5Porques = (cadeiaId: string, pergunta: string, resposta: string, evidencia: string) => {
    if (!problemaAtivo) return;

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      cadeias5Porques: problemaAtivo.cadeias5Porques.map(cad => {
        if (cad.id !== cadeiaId) return cad;

        const novaOrdem = cad.passos.length + 1;
        const novoPasso: No5Porques = {
          id: `step-${Date.now()}-${novaOrdem}`,
          ordem: novaOrdem,
          pergunta,
          resposta,
          evidencia,
          isCausaRaiz: false,
        };

        return {
          ...cad,
          passos: [...cad.passos, novoPasso],
        };
      }),
    };

    atualizarProblemaAtivo(atualizado);
    mostrarToast('Nível de porquê registrado.');
  };

  const handleAtualizarPasso5Porques = (cadeiaId: string, passoId: string, campos: Partial<No5Porques>) => {
    if (!problemaAtivo) return;

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      cadeias5Porques: problemaAtivo.cadeias5Porques.map(cad => {
        if (cad.id !== cadeiaId) return cad;
        return {
          ...cad,
          passos: cad.passos.map(p => (p.id === passoId ? { ...p, ...campos } : p)),
        };
      }),
    };

    atualizarProblemaAtivo(atualizado);
  };

  const handleExcluirPasso5Porques = (cadeiaId: string, passoId: string) => {
    if (!problemaAtivo) return;

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      cadeias5Porques: problemaAtivo.cadeias5Porques.map(cad => {
        if (cad.id !== cadeiaId) return cad;
        const filtrados = cad.passos.filter(p => p.id !== passoId);
        const reordenados = filtrados.map((p, idx) => ({ ...p, ordem: idx + 1 }));
        return { ...cad, passos: reordenados };
      }),
    };

    atualizarProblemaAtivo(atualizado);
  };

  const handleMarcarCausaRaiz = (cadeiaId: string, passoId: string, isRaiz: boolean) => {
    if (!problemaAtivo) return;

    let textoCausaRaiz: string | undefined;

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      status: isRaiz ? 'causa_identificada' : problemaAtivo.status,
      cadeias5Porques: problemaAtivo.cadeias5Porques.map(cad => {
        if (cad.id !== cadeiaId) return cad;
        return {
          ...cad,
          passos: cad.passos.map(p => {
            if (p.id === passoId) {
              if (isRaiz) textoCausaRaiz = p.resposta;
              return { ...p, isCausaRaiz: isRaiz };
            }
            return { ...p, isCausaRaiz: isRaiz ? false : p.isCausaRaiz };
          }),
          causaRaizDefinida: isRaiz ? textoCausaRaiz : undefined,
        };
      }),
    };

    atualizarProblemaAtivo(atualizado);
    if (isRaiz) {
      mostrarToast('Causa-Raiz confirmada com sucesso!');
    }
  };

  // Handlers do Plano de Ação 5W2H
  const handleAdicionarAcao = (acao: Omit<ItemPlanoAcao, 'id'>) => {
    if (!problemaAtivo) return;

    const novaAcao: ItemPlanoAcao = {
      ...acao,
      id: `acao-${Date.now()}`,
    };

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      status: 'em_acoes',
      acoes: [...problemaAtivo.acoes, novaAcao],
    };

    atualizarProblemaAtivo(atualizado);
    setCausaSugeridaParaAcao(undefined);
    mostrarToast('Contramedida cadastrada no plano 5W2H.');
  };

  const handleAtualizarAcao = (id: string, campos: Partial<ItemPlanoAcao>) => {
    if (!problemaAtivo) return;

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      acoes: problemaAtivo.acoes.map(a => (a.id === id ? { ...a, ...campos } : a)),
    };

    atualizarProblemaAtivo(atualizado);
  };

  const handleExcluirAcao = (id: string) => {
    if (!problemaAtivo) return;

    const atualizado: ProblemaOperacional = {
      ...problemaAtivo,
      acoes: problemaAtivo.acoes.filter(a => a.id !== id),
    };

    atualizarProblemaAtivo(atualizado);
    mostrarToast('Ação excluída.');
  };

  // Handlers de Criação / Edição / Exclusão de Ocorrências
  const handleSalvarProblemaModal = (dados: Partial<ProblemaOperacional>) => {
    if (problemaParaEditar) {
      const atualizado: ProblemaOperacional = {
        ...problemaParaEditar,
        ...dados,
        dataAtualizacao: new Date().toISOString(),
      };
      atualizarProblemaAtivo(atualizado);
      setProblemaParaEditar(undefined);
      mostrarToast('Ocorrência atualizada.');
    } else {
      const novo: ProblemaOperacional = {
        id: `prob-${Date.now()}`,
        codigo: dados.codigo || `RCA-${new Date().getFullYear()}-001`,
        titulo: dados.titulo || 'Nova Anomalia Operacional',
        descricao: dados.descricao || '',
        linha: dados.linha || '',
        equipamento: dados.equipamento || '',
        data: dados.data || new Date().toISOString().split('T')[0],
        turno: dados.turno || '1º Turno',
        facilitador: dados.facilitador || 'Facilitador Lean',
        equipeParticipante: dados.equipeParticipante || '',
        status: 'investigando',
        causas6M: [],
        cadeias5Porques: [],
        acoes: [],
        historicoSocratico: [
          {
            id: `msg-ini-${Date.now()}`,
            remetente: 'facilitador',
            texto: `Iniciamos a investigação da anomalia "${dados.titulo}". Qual evidência imediata ou alarme foi verificado na parada?`,
            timestamp: new Date().toISOString(),
            sugestao6M: 'maquina',
          },
        ],
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      };

      const novaLista = [novo, ...problemas];
      setProblemas(novaLista);
      LeanRootStorageService.salvarProblemas(novaLista);
      setProblemaAtivoId(novo.id);
      setPaginaAtiva('investigacao');
      mostrarToast('Nova ocorrência criada. Mesa de Investigação aberta!');
    }
  };

  const handleSalvarCapturaRapida = (dados: {
    titulo: string;
    linha: string;
    equipamento: string;
    descricao: string;
    turno: TurnoTrabalho;
    facilitador: string;
    abrirImediatamente: boolean;
  }) => {
    const novoCodigo = `RCA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const novoProblema: ProblemaOperacional = {
      id: `prob-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      codigo: novoCodigo,
      titulo: dados.titulo,
      descricao: dados.descricao,
      linha: dados.linha,
      equipamento: dados.equipamento,
      data: new Date().toISOString().split('T')[0],
      turno: dados.turno,
      facilitador: dados.facilitador,
      equipeParticipante: 'Registro Rápido de Chão de Fábrica',
      status: 'investigando',
      causas6M: [],
      cadeias5Porques: [],
      acoes: [],
      historicoSocratico: [],
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };

    const novaLista = [novoProblema, ...problemas];
    setProblemas(novaLista);
    LeanRootStorageService.salvarProblemas(novaLista);

    if (dados.abrirImediatamente) {
      setProblemaAtivoId(novoProblema.id);
      setPaginaAtiva('investigacao');
      mostrarToast(`Anomalia ${novoCodigo} aberta para investigação imediata.`);
    } else {
      mostrarToast(`Anomalia ${novoCodigo} capturada e adicionada à fila!`);
    }

    setModalCapturaRapidaAberto(false);
  };

  const handleConfirmarExclusao = () => {
    if (!problemaParaExcluir) return;

    const novaLista = LeanRootStorageService.excluirProblema(problemaParaExcluir.id);
    setProblemas(novaLista);
    setProblemaAtivoId(novaLista.length > 0 ? novaLista[0].id : null);
    setProblemaParaExcluir(null);
    mostrarToast('Ocorrência excluída com sucesso.');
  };

  const handleRestaurarExemplo = () => {
    const lista = LeanRootStorageService.restaurarExemplo();
    setProblemas(lista);
    setProblemaAtivoId(lista[0].id);
    mostrarToast('Caso de estudo do Centro de Usinagem CNC carregado.');
  };

  const handleExportarJSON = () => {
    const json = LeanRootStorageService.exportarJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leanroot_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast('Backup JSON exportado.');
  };

  const handleImportarJSON = (conteudo: string) => {
    const res = LeanRootStorageService.importarJSON(conteudo);
    if (res.sucesso && res.problemas) {
      setProblemas(res.problemas);
      setProblemaAtivoId(res.problemas[0].id);
      mostrarToast(res.mensagem);
    } else {
      alert(`Falha na importação: ${res.mensagem}`);
    }
  };

  // Métricas Consolidadas
  const metricas = LeanRootStorageService.calcularMetricas(problemas);
  const metricasEficiencia = LeanRootStorageService.calcularMetricasEficiencia(problemas);
  const linhasExistentes = Array.from(new Set(problemas.map(p => p.linha).filter(Boolean)));
  const equipamentosExistentes = Array.from(new Set(problemas.map(p => p.equipamento).filter(Boolean)));

  return (
    <div className="flex h-screen flex-col bg-[#F3F5F9] dark:bg-[#080C13] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* 1. Header Global com Navegação SPA */}
      <TopBar
        tema={tema}
        onAlternarTema={alternarTema}
        metricas={metricas}
        paginaAtiva={paginaAtiva}
        onNavegarPagina={(p) => setPaginaAtiva(p)}
        onAbrirAta={() => setModalAtaAberto(true)}
        onAbrirNovoProblema={() => {
          setProblemaParaEditar(undefined);
          setModalNovoAberto(true);
        }}
        onAbrirCapturaRapida={() => setModalCapturaRapidaAberto(true)}
        temProblemaSelecionado={!!problemaAtivo}
      />

      {/* 2. Área Principal de Visualização por Página SPA */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* PÁGINA 1: COCKPIT EXECUTIVO & EFICIÊNCIA OPERACIONAL */}
        {paginaAtiva === 'dashboard' && (
          <ExecutiveDashboardView
            problemas={problemas}
            metricasEficiencia={metricasEficiencia}
            metricasGerais={metricas}
            tema={tema}
            onSelecionarProblemaEInvestigar={(id) => {
              setProblemaAtivoId(id);
              setPaginaAtiva('investigacao');
            }}
            onAbrirNovoProblema={() => {
              setProblemaParaEditar(undefined);
              setModalNovoAberto(true);
            }}
            onAbrirCapturaRapida={() => setModalCapturaRapidaAberto(true)}
            onRestaurarExemplo={handleRestaurarExemplo}
          />
        )}

        {/* PÁGINA 2: MESA TÉCNICA DE INVESTIGAÇÃO (6M / 5 PORQUÊS / 5W2H) */}
        {paginaAtiva === 'investigacao' && (
          <>
            {/* Mobile Sidebar Overlay Toggle */}
            <div className="md:hidden absolute bottom-4 left-4 z-40">
              <button
                onClick={() => setSidebarAbertaMobile(!sidebarAbertaMobile)}
                className="btn-safety-yellow flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-lg"
              >
                {sidebarAbertaMobile ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span>Ocorrências ({problemas.length})</span>
              </button>
            </div>

            {/* Sidebar de Seleção de Ocorrência */}
            <div 
              className={`md:block fixed inset-y-0 left-0 z-30 pt-16 md:pt-0 transform md:relative md:translate-x-0 transition-transform duration-200 ${
                sidebarAbertaMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
              }`}
            >
              <ProblemSidebar
                problemas={problemas}
                problemaAtivoId={problemaAtivoId}
                onSelecionarProblema={(id) => {
                  setProblemaAtivoId(id);
                  setSidebarAbertaMobile(false);
                }}
                onNovoProblema={() => {
                  setProblemaParaEditar(undefined);
                  setModalNovoAberto(true);
                  setSidebarAbertaMobile(false);
                }}
                onExcluirProblema={(id, titulo) => {
                  setProblemaParaExcluir({ id, titulo });
                }}
                onRestaurarExemplo={handleRestaurarExemplo}
                onExportarJSON={handleExportarJSON}
                onImportarJSON={handleImportarJSON}
              />
            </div>

            {/* Canvas Limpo e Focado da Mesa de Investigação */}
            <main className="flex-1 flex flex-col overflow-y-auto bg-[#F8FAFC] dark:bg-[#0A0E17]">
              {!problemaAtivo ? (
                <div className="m-auto max-w-lg p-8 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_16px_rgba(250,204,21,0.15)]">
                    <Layers className="h-7 w-7" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Nenhuma Ocorrência Selecionada
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Selecione uma ocorrência na barra lateral ou cadastre uma nova para iniciar a investigação nos 6 eixos de Ishikawa.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setProblemaParaEditar(undefined);
                        setModalNovoAberto(true);
                      }}
                      className="btn-safety-yellow flex items-center gap-2 rounded-lg px-4 py-2 text-xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Cadastrar Problema</span>
                    </button>
                    <button
                      onClick={handleRestaurarExemplo}
                      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#121824] dark:text-slate-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Carregar Caso Modelo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <InvestigationWorkspace
                  problema={problemaAtivo}
                  onAtualizarStatusProblema={(novoStatus) => {
                    atualizarProblemaAtivo({ ...problemaAtivo, status: novoStatus });
                    mostrarToast(`Status do PDCA atualizado.`);
                  }}
                  onEditarDetalhes={() => {
                    setProblemaParaEditar(problemaAtivo);
                    setModalNovoAberto(true);
                  }}
                  onAbrirAta={() => setModalAtaAberto(true)}
                  onNavegarParaExportacoes={() => setPaginaAtiva('exportacoes')}
                  onAdicionarCausa={handleAdicionarCausa}
                  onAtualizarStatusCausa={handleAtualizarStatusCausa}
                  onExcluirCausa={handleExcluirCausa}
                  onIniciar5Porques={handleIniciar5Porques}
                  cadeiaAtivaId={cadeiaAtivaId}
                  onSelecionarCadeia={(id) => setCadeiaAtivaId(id)}
                  onAdicionarPasso={handleAdicionarPasso5Porques}
                  onAtualizarPasso={handleAtualizarPasso5Porques}
                  onExcluirPasso={handleExcluirPasso5Porques}
                  onMarcarCausaRaiz={handleMarcarCausaRaiz}
                  onIrParaPlanoAcao={(causaTexto) => setCausaSugeridaParaAcao(causaTexto)}
                  onAdicionarAcao={handleAdicionarAcao}
                  onAtualizarAcao={handleAtualizarAcao}
                  onExcluirAcao={handleExcluirAcao}
                  causaSugeridaTexto={causaSugeridaParaAcao}
                  onAdicionarMensagemChat={handleAdicionarMensagemChat}
                />
              )}
            </main>
          </>
        )}

        {/* PÁGINA 3: MATRIZ CONSOLIDADA DE AÇÕES 5W2H DA PLANTA */}
        {paginaAtiva === 'matriz-acoes' && (
          <ConsolidatedActionMatrix
            problemas={problemas}
            onAtualizarAcaoStatus={handleAtualizarAcaoStatusNaMatriz}
            onSelecionarProblema={(id: string) => setProblemaAtivoId(id)}
            onNavegarParaInvestigacao={() => setPaginaAtiva('investigacao')}
            onToast={mostrarToast}
          />
        )}

        {/* PÁGINA 4: CENTRAL DE EXPORTAÇÕES TÉCNICAS (PDF E PLANILHAS EXCEL) */}
        {paginaAtiva === 'exportacoes' && (
          <TechnicalExportHub
            problemas={problemas}
            problemaAtivo={problemaAtivo}
            onSelecionarProblema={(id: string) => setProblemaAtivoId(id)}
            onNavegarParaInvestigacao={() => setPaginaAtiva('investigacao')}
            onToast={mostrarToast}
          />
        )}

      </div>

      {/* Modais Globais */}
      {modalCapturaRapidaAberto && (
        <QuickCaptureModal
          onSalvar={handleSalvarCapturaRapida}
          onFechar={() => setModalCapturaRapidaAberto(false)}
          linhasSugeridas={linhasExistentes}
          equipamentosSugeridos={equipamentosExistentes}
        />
      )}

      {modalNovoAberto && (
        <NewProblemModal
          problemaParaEditar={problemaParaEditar}
          onSalvar={handleSalvarProblemaModal}
          onFechar={() => {
            setModalNovoAberto(false);
            setProblemaParaEditar(undefined);
          }}
        />
      )}

      {problemaParaExcluir && (
        <ConfirmDeleteModal
          tituloProblema={problemaParaExcluir.titulo}
          onConfirmar={handleConfirmarExclusao}
          onCancelar={() => setProblemaParaExcluir(null)}
        />
      )}

      {modalAtaAberto && problemaAtivo && (
        <MeetingMinutesView
          problema={problemaAtivo}
          onFechar={() => setModalAtaAberto(false)}
        />
      )}

      {/* Toast Notification */}
      {toastMensagem && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl dark:bg-white dark:text-slate-900 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{toastMensagem}</span>
        </div>
      )}

    </div>
  );
}
