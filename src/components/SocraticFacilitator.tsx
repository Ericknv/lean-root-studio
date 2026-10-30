/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle, 
  Plus, 
  CheckCircle, 
  ArrowRight, 
  Lightbulb,
  CornerDownRight
} from 'lucide-react';
import { 
  ProblemaOperacional, 
  IshikawaCategory, 
  ISHIKAWA_CATEGORIES, 
  Causa6M, 
  MensagemSocratica 
} from '../types/leanRoot';
import { 
  avaliarSeEhSintoma, 
  gerarPerguntaSocratica, 
  inferirCategoria6M 
} from '../services/socraticEngine';

interface SocraticFacilitatorProps {
  problema: ProblemaOperacional;
  onAdicionarCausa: (causa: Omit<Causa6M, 'id' | 'dataCriacao'>) => void;
  onAdicionarMensagemChat: (msg: Omit<MensagemSocratica, 'id' | 'timestamp'>) => void;
  onAbrir5Porques: (categoria: IshikawaCategory, titulo: string) => void;
}

export const SocraticFacilitator: React.FC<SocraticFacilitatorProps> = ({
  problema,
  onAdicionarCausa,
  onAdicionarMensagemChat,
  onAbrir5Porques,
}) => {
  const [respostaTexto, setRespostaTexto] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<IshikawaCategory>('metodo');
  const [evidenciaTexto, setEvidenciaTexto] = useState('');
  const [alertaSintomaAtual, setAlertaSintomaAtual] = useState<{
    isSintoma: boolean;
    motivo?: string;
    perguntaDesafio?: string;
  } | null>(null);

  // Pergunta socrática atual gerada pelo motor heurístico
  const { pergunta, categoriaSugerida, explicacaoMetodologica } = gerarPerguntaSocratica(problema);

  // Sincroniza a categoria inicial com a recomendação da IA
  useEffect(() => {
    setCategoriaSelecionada(categoriaSugerida);
  }, [categoriaSugerida]);

  // Avaliação reativa ao digitar: alerta instantâneo de causa sintomática
  const handleTextoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRespostaTexto(val);

    if (val.trim().length > 5) {
      const diag = avaliarSeEhSintoma(val);
      if (diag.isSintoma) {
        setAlertaSintomaAtual({
          isSintoma: true,
          motivo: diag.alertaMotivo,
          perguntaDesafio: diag.perguntaDesafio,
        });
        if (diag.categoriaSugerida) {
          setCategoriaSelecionada(diag.categoriaSugerida);
        }
      } else {
        setAlertaSintomaAtual(null);
        setCategoriaSelecionada(inferirCategoria6M(val));
      }
    } else {
      setAlertaSintomaAtual(null);
    }
  };

  // Envia resposta no diálogo socrático
  const handleEnviarMensagem = () => {
    if (!respostaTexto.trim()) return;

    const diag = avaliarSeEhSintoma(respostaTexto);

    // Registra a mensagem do usuário
    onAdicionarMensagemChat({
      remetente: 'usuario',
      texto: respostaTexto,
      sugestao6M: categoriaSelecionada,
      isAlertaSintoma: diag.isSintoma,
      alertaMotivo: diag.alertaMotivo,
    });

    // Se houver alerta de sintoma, o facilitador responde desafiando a superficialidade
    if (diag.isSintoma && diag.perguntaDesafio) {
      setTimeout(() => {
        onAdicionarMensagemChat({
          remetente: 'facilitador',
          texto: `Atenção: Identifiquei que esta resposta foca em um sintoma ("${respostaTexto}"). ${diag.alertaMotivo}\n\nPara aprofundar: ${diag.perguntaDesafio}`,
          isAlertaSintoma: true,
          sugestao6M: diag.categoriaSugerida || categoriaSelecionada,
        });
      }, 400);
    } else {
      // Resposta válida
      setTimeout(() => {
        onAdicionarMensagemChat({
          remetente: 'facilitador',
          texto: `Excelente contribuição registrada para o eixo ${ISHIKAWA_CATEGORIES[categoriaSelecionada].shortLabel}. Deseja adicionar esta hipótese diretamente ao Diagrama de Ishikawa ou desdobrar nos 5 Porquês?`,
          sugestao6M: categoriaSelecionada,
        });
      }, 400);
    }

    setRespostaTexto('');
    setEvidenciaTexto('');
    setAlertaSintomaAtual(null);
  };

  // Adiciona diretamente como causa no Diagrama de Ishikawa
  const handleAdicionarDiretoIshikawa = () => {
    if (!respostaTexto.trim()) return;

    const diag = avaliarSeEhSintoma(respostaTexto);

    onAdicionarCausa({
      categoria: categoriaSelecionada,
      descricao: respostaTexto.trim(),
      status: diag.isSintoma ? 'sintoma' : 'hipotese',
      evidencia: evidenciaTexto.trim() || undefined,
      isSintoma: diag.isSintoma,
      alertaSintoma: diag.alertaMotivo,
    });

    onAdicionarMensagemChat({
      remetente: 'usuario',
      texto: `Hipótese alocada no Ishikawa (${ISHIKAWA_CATEGORIES[categoriaSelecionada].shortLabel}): ${respostaTexto}`,
      sugestao6M: categoriaSelecionada,
    });

    setRespostaTexto('');
    setEvidenciaTexto('');
    setAlertaSintomaAtual(null);
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-[#0A0E17]/85 backdrop-blur-md overflow-hidden shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 px-4 py-3 dark:border-slate-800/80 dark:bg-[#0E1420]/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 text-amber-500 dark:bg-amber-400/15 dark:text-amber-400 border border-amber-400/30 shadow-[0_0_8px_rgba(250,204,21,0.15)]">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Facilitador Socrático Virtual
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Perguntas reflexivas guiadas para evitar causas rasas
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-amber-600/80 dark:text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
          Genba & Kaizen Mode
        </span>
      </div>

      {/* Dynamic Socratic Question Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-50 to-slate-50 dark:from-[#141C29] dark:via-[#101622] dark:to-[#141C29] border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pergunta Investigativa em Foco:
              </span>
              <span className="text-[10.5px] px-2 py-0.5 rounded-sm bg-amber-400/15 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300 font-mono font-bold border border-amber-400/30">
                Eixo {ISHIKAWA_CATEGORIES[categoriaSugerida].shortLabel}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {pergunta}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              Fundamento Lean: {explicacaoMetodologica}
            </p>
          </div>
        </div>
      </div>

      {/* Socratic Chat History */}
      <div className="flex-1 max-h-72 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-[#070B10]/40">
        {problema.historicoSocratico.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
            A sessão de diálogo está aberta. Responda à pergunta acima com os fatos observados no posto de trabalho.
          </div>
        ) : (
          problema.historicoSocratico.map((msg) => {
            const isFacilitador = msg.remetente === 'facilitador';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isFacilitador ? 'justify-start' : 'justify-end'}`}
              >
                {isFacilitador && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-amber-400 dark:bg-[#141C29] dark:text-amber-400 border border-amber-400/40 text-[10px] font-bold font-mono">
                    LR
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isFacilitador
                      ? msg.isAlertaSintoma
                        ? 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/50'
                        : 'bg-white text-slate-800 border border-slate-200 dark:bg-[#121824] dark:text-slate-200 dark:border-slate-700/60 shadow-2xs'
                      : 'bg-slate-900 text-white dark:bg-[#182030] dark:text-amber-300 dark:border dark:border-amber-400/30 font-medium'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.texto}</div>
                  
                  {msg.sugestao6M && isFacilitador && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        Classificado em: <strong>{ISHIKAWA_CATEGORIES[msg.sugestao6M].shortLabel}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Symptom Warning Banner (Appears dynamically while typing if superficial cause detected) */}
      {alertaSintomaAtual?.isSintoma && (
        <div className="mx-4 mt-3 rounded-lg border border-amber-400 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-200 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-300">
                Alerta de Causa Sintomática:
              </span>
              <p className="leading-snug">{alertaSintomaAtual.motivo}</p>
              {alertaSintomaAtual.perguntaDesafio && (
                <p className="mt-1 font-semibold text-blue-900 dark:text-blue-300">
                  Desafio Socrático: {alertaSintomaAtual.perguntaDesafio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fast Input Form */}
      <div className="p-4 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Resposta da Equipe / Fato Observado:
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Eixo sugerido:</span>
              <select
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value as IshikawaCategory)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-800 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {Object.values(ISHIKAWA_CATEGORIES).map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.shortLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            rows={2}
            value={respostaTexto}
            onChange={handleTextoChange}
            placeholder="Digite os fatos verificados no posto (ex.: 'Manômetro com desvio de 14°C', 'Falta de tela magnética no tanque')..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 resize-none transition-all"
          />
        </div>

        {/* Optional Evidence Field */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Evidência Física / Dado Numérico (opcional):
          </label>
          <input
            type="text"
            value={evidenciaTexto}
            onChange={(e) => setEvidenciaTexto(e.target.value)}
            placeholder="Ex.: Foto da peça trincada, log de alarme das 14:02, relatório de calibração..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 transition-all"
          />
        </div>

        {/* Buttons Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleEnviarMensagem}
            disabled={!respostaTexto.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700/80 dark:bg-[#151D2A] dark:text-slate-200 dark:hover:bg-[#1E293B] dark:hover:border-slate-600 transition-colors shadow-2xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Debater no Chat</span>
          </button>

          <button
            type="button"
            onClick={handleAdicionarDiretoIshikawa}
            disabled={!respostaTexto.trim()}
            className="btn-safety-yellow flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Alocar no Ishikawa 6M ({ISHIKAWA_CATEGORIES[categoriaSelecionada].shortLabel})</span>
          </button>
        </div>

      </div>

    </div>
  );
};
