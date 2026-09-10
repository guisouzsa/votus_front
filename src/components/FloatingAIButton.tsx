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

export default function FloatingAIButton({ onClick }: { onClick?: () => void }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await response.json();

      if (!response.ok || typeof data.reply !== "string") {
        throw new Error(data?.error || "Não consegui responder agora. Tente novamente.");
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
        className={`fixed bottom-40 z-50 flex w-auto origin-bottom-right flex-col overflow-hidden rounded-[1.25rem] border border-[#EDDBBA] bg-[#FDF8EE] shadow-[0_16px_40px_rgba(27,98,58,0.2)] transition-all duration-300 ease-out md:inset-x-auto md:right-6 md:bottom-24 ${
          expanded
            ? "inset-x-1 max-h-[calc(100dvh-5rem)] md:h-[85dvh] md:max-h-[calc(100dvh-4rem)] md:w-[65vw] md:min-w-[26rem] md:max-w-[56rem]"
            : "inset-x-4 max-h-[calc(100dvh-11rem)] md:max-h-[min(46rem,calc(100dvh-7rem))] md:w-[22rem]"
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
              placeholder="Digite sua pergunta..."
              aria-label="Digite sua pergunta"
              disabled={sending}
              className="h-10 min-w-0 flex-1 rounded-md border border-[#1B623A] bg-[#FDF8EE] px-2 text-xs text-[#103D23] outline-none placeholder:text-[#6B6255] focus:ring-2 focus:ring-[#1B623A]/20 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !message.trim()}
              aria-label="Enviar pergunta"
              className="flex h-9 w-10 shrink-0 items-center justify-center rounded-md bg-[#1B623A] text-[#FDF8EE] transition-colors hover:bg-[#103D23] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="mt-1 text-[10px] text-[#103D23]">Enter envia · Shift + Enter quebra linha</p>
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
        className="flex h-14 w-14 items-center justify-center gap-3 rounded-full bg-cover bg-center px-0 text-sm font-semibold text-[#EDDBBA] shadow-lg shadow-brasil-green-deep/20 transition-all duration-300 hover:brightness-110 hover:scale-105 active:scale-90 cursor-pointer md:w-44 md:justify-start md:px-2"
        style={{ backgroundImage: "url(/FundoFlooatingbutton.svg)" }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDDBBA]">
          <MessageCircleQuestion size={25} className="text-[#246840]" strokeWidth={1.8} />
        </span>
        <span className="hidden whitespace-nowrap md:inline">Pergunte à IA</span>
      </button>
    </div>
  );
}
