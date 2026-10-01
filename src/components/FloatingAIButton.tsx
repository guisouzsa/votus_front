"use client";

import {
  Building2,
  CheckCircle2,
  FileText,
  Info,
  Landmark,
  Maximize2,
  MessageCircleQuestion,
  Minimize2,
  Plus,
  Send,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getVisitorId } from "@/lib/visitorId";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function createId() {
  return Math.random().toString(36).slice(2);
}

const CHAT_STORAGE_KEY = "votus-ai-chat-messages";

// Animação de entrada em cascata: cada bloco interno do chat aparece com um
// pequeno atraso em relação ao anterior, dando a sensação de conteúdo
// "chegando" em vez de tudo aparecer de uma vez.
const CHAT_REVEAL = "animate-[votus-chat-in_0.45s_ease-out_both]";

// Só pra exibição ("X/5 perguntas"). O limite de verdade é aplicado no
// backend (app/api/chat/route.ts, PERSON_MAX_REQUESTS) — mudar este número
// aqui não muda quantas perguntas são realmente permitidas.
const LIMITE_PERGUNTAS_POR_HORA = 5;

export default function FloatingAIButton({ onClick }: { onClick?: () => void }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // Quantas perguntas ainda restam na hora atual (limite de 5/h por
  // pessoa, controlado no backend — ver app/api/chat/route.ts). Só
  // exibição; null enquanto ainda não fez nenhuma pergunta nesta sessão.
  const [perguntasRestantes, setPerguntasRestantes] = useState<number | null>(null);
  const limiteAtingido = perguntasRestantes === 0;
  const logRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { label: "O que faz um senador?", icon: Landmark },
    { label: "O que faz um deputado?", icon: Building2 },
    { label: "Como funciona uma emenda?", icon: FileText },
    { label: "Onde denunciar?", icon: MessageCircleQuestion },
    { label: "O que é valor empenhado?", icon: CheckCircle2 },
    { label: "Quem faz a Votus?", icon: Users },
  ];

  // Carrega a conversa salva assim que o componente monta, para que ela
  // continue a mesma ao navegar entre páginas ou fechar e reabrir o chat.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) setMessages(parsed);
    } catch {
      // localStorage indisponível ou dado corrompido — segue com a conversa vazia.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Modo privado ou cota de armazenamento excedida — ignora silenciosamente.
    }
  }, [messages, hydrated]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, sending]);

  function toggleChat() {
    setOpen((value) => !value);
    onClick?.();
  }

  function chooseSuggestion(value: string) {
    setMessage(value);
    setSelectedSuggestion(value);
  }

  function startNewChat() {
    setMessages([]);
    setMessage("");
    setSelectedSuggestion(null);
  }

  async function sendMessage() {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = { id: createId(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setMessage("");
    setSelectedSuggestion(null);
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        // X-Visitor-Id: mesmo identificador anônimo já usado nos votos de
        // proposta (getVisitorId/lib/visitorId.ts) — é o que o backend do
        // chat usa pra aplicar o limite de 5 perguntas/hora por pessoa.
        headers: { "Content-Type": "application/json", "X-Visitor-Id": getVisitorId() },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setPerguntasRestantes(0);
      }

      if (!response.ok || typeof data.reply !== "string") {
        throw new Error(data?.error || "Não consegui responder agora. Tente novamente.");
      }

      if (typeof data.limite?.restantes === "number") {
        setPerguntasRestantes(data.limite.restantes);
      }

      setMessages((prev) => [...prev, { id: createId(), role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: error instanceof Error ? error.message : "Não consegui responder agora. Tente novamente.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 flex items-end justify-end md:bottom-6 md:right-6">
      <section
        aria-label="Chat Votus IA"
        className={`fixed z-50 flex w-auto origin-bottom-right flex-col overflow-hidden border border-[#EDDBBA] bg-[#FDF8EE] shadow-[0_16px_40px_rgba(27,98,58,0.2)] transition-all duration-300 ease-out ${
          expanded
            ? // Tela inteira, sem margens nem cantos arredondados, em
              // qualquer breakpoint.
              "inset-0 h-dvh max-h-none rounded-none"
            : `md:inset-x-auto md:right-6 md:bottom-24 md:rounded-[1.25rem] inset-x-4 bottom-40 max-h-[min(26rem,calc(100dvh-11rem))] rounded-[1.25rem] md:max-h-[min(46rem,calc(100dvh-7rem))] md:w-[22rem]`
        } ${open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-5 scale-95 opacity-0"}`}
        style={{ backgroundImage: "url(/fundochatia.png)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-2 px-5 pb-3 pt-5 ${
            open ? `${CHAT_REVEAL} [animation-delay:0ms]` : "opacity-0"
          }`}
        >
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-[#8D0801]">Ajuda rápida com IA</h2>
            <p className="mt-0.5 text-sm font-medium text-[#103D23]">Tire dúvidas em linguagem simples.</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={startNewChat}
              aria-label="Novo chat"
              title="Novo chat"
              className="flex h-7 items-center gap-1 rounded-full bg-[#8D0801] px-2.5 text-[#FDF8EE] transition-colors hover:bg-[#a70700] cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden text-xs font-semibold sm:inline">Novo chat</span>
            </button>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? "Reduzir chat" : "Expandir chat"}
              title={expanded ? "Reduzir chat" : "Expandir chat"}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8D0801] transition-colors hover:bg-[#8D0801]/10 cursor-pointer"
            >
              {expanded ? <Minimize2 size={16} strokeWidth={2.5} /> : <Maximize2 size={16} strokeWidth={2.5} />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8D0801] transition-transform hover:rotate-90 cursor-pointer"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div
          className={`mx-5 flex shrink-0 items-center gap-2 rounded-lg border border-[#8D0801] bg-[#F2E4CA] px-2.5 py-2.5 text-xs leading-snug text-[#8D0801] ${
            open ? `${CHAT_REVEAL} [animation-delay:70ms]` : "opacity-0"
          }`}
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EDDBBA] text-[#8D0801]">
            <Info size={14} strokeWidth={2.5} />
          </span>
          <span>Sou uma ferramenta de apoio. Não substituo fontes oficiais.</span>
        </div>

        <div
          ref={logRef}
          className={`min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4 ${
            open ? `${CHAT_REVEAL} [animation-delay:140ms]` : "opacity-0"
          }`}
        >
          {messages.length === 0 ? (
            <>
              <h3 className="mb-2 text-sm font-bold text-[#8D0801]">Sugestões rápidas</h3>
              <div className="grid gap-2">
                {suggestions.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => chooseSuggestion(label)}
                    className={`flex min-h-9 items-center gap-2 rounded-lg border border-[#E8B981] px-3 py-2 text-left text-xs font-medium text-[#8D0801] transition-colors cursor-pointer ${
                      selectedSuggestion === label
                        ? "bg-[#E8D7BA]"
                        : "bg-[#F5EBD8] hover:bg-[#EEDFC8]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.5} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              {messages.map((entry) => (
                <div
                  key={entry.id}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-xs font-medium leading-relaxed ${
                    entry.role === "user"
                      ? "self-end bg-[#1B623A] text-[#FDF8EE]"
                      : "self-start border border-[#E8B981] bg-[#F5EBD8] text-[#103D23]"
                  }`}
                >
                  {entry.content}
                </div>
              ))}
              {sending && (
                <div className="self-start rounded-xl border border-[#E8B981] bg-[#F5EBD8] px-3 py-2 text-xs text-[#8D0801]">
                  Digitando...
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`shrink-0 px-5 pb-3 ${
            open ? `${CHAT_REVEAL} [animation-delay:200ms]` : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={limiteAtingido ? "Limite de perguntas atingido" : "Digite sua pergunta..."}
              aria-label="Digite sua pergunta"
              disabled={sending || limiteAtingido}
              className="h-10 min-w-0 flex-1 rounded-md border border-[#1B623A] bg-[#FDF8EE] px-2 text-xs text-[#103D23] outline-none placeholder:text-[#6B6255] focus:ring-2 focus:ring-[#1B623A]/20 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || limiteAtingido || !message.trim()}
              aria-label="Enviar pergunta"
              className="flex h-9 w-10 shrink-0 items-center justify-center rounded-md bg-[#1B623A] text-[#FDF8EE] transition-colors hover:bg-[#103D23] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
          <p className={`mt-1 text-[10px] ${limiteAtingido ? "font-semibold text-[#8D0801]" : "text-[#103D23]"}`}>
            {perguntasRestantes !== null
              ? `${LIMITE_PERGUNTAS_POR_HORA - perguntasRestantes}/${LIMITE_PERGUNTAS_POR_HORA} perguntas nesta hora · Enter envia`
              : "Enter envia · Shift + Enter quebra linha"}
          </p>
        </div>

        <div
          className={`mx-5 mb-5 mt-1 flex shrink-0 items-center gap-1.5 rounded-md border border-[#1B623A] bg-[#F2E4CA] px-3 py-3 text-xs font-medium text-[#1B623A] ${
            open ? `${CHAT_REVEAL} [animation-delay:260ms]` : "opacity-0"
          }`}
        >
          <CheckCircle2 size={18} />
          Fontes oficiais sempre visíveis
        </div>
      </section>

      <button
        type="button"
        onClick={toggleChat}
        aria-label={open ? "Fechar chat de IA" : "Perguntar à IA"}
        aria-expanded={open}
        // FundoFlooatingbutton.svg é bem largo (725x241, ~3:1) — desenhado
        // pra caber no botão retangular do desktop (md:w-44). No mobile o
        // botão é quadrado (h-16 w-16): bg-cover cortava as laterais dessa
        // arte larga pra cobrir o quadrado, sobrando no meio um pedaço torto
        // da "pílula" arredondada original (a mancha/artefato reportada).
        // Solução: usar essa imagem só a partir do desktop (md:), e no
        // mobile uma cor sólida do mesmo verde já usado no botão (shadow
        // logo abaixo já é rgba(19,74,42,...), o mesmo tom).
        // Some (sem desmontar) quando expandido: o painel fica em tela
        // cheia sobre esse botão, que tem o mesmo z-50 e vem depois no DOM
        // — sem isso ele ficaria flutuando por cima do chat fullscreen.
        className={`flex h-16 w-16 items-center justify-center gap-3 overflow-hidden rounded-full bg-[#134A2A] bg-cover bg-center px-0 text-sm font-semibold text-[#EDDBBA] shadow-[0_6px_18px_-2px_rgba(19,74,42,0.35)] transition-all duration-300 hover:brightness-110 hover:scale-105 active:scale-90 cursor-pointer md:h-14 md:w-44 md:justify-start md:bg-[url('/FundoFlooatingbutton.svg')] md:px-2 ${
          open && expanded ? "pointer-events-none opacity-0" : ""
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDDBBA] md:h-9 md:w-9">
          <MessageCircleQuestion size={25} className="text-[#246840]" strokeWidth={1.8} />
        </span>
        <span className="hidden whitespace-nowrap md:inline">Pergunte à IA</span>
      </button>
    </div>
  );
}
