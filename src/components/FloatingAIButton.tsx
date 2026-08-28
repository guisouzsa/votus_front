"use client";

import { CheckCircle2, FileText, Info, Landmark, MessageCircleQuestion, Send, X } from "lucide-react";
import { useState } from "react";

export default function FloatingAIButton({ onClick }: { onClick?: () => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const suggestions = [
    { label: "O que faz um senador?", icon: Landmark },
    { label: "Como funciona uma emenda?", icon: FileText },
    { label: "Onde denunciar?", icon: MessageCircleQuestion },
    { label: "O que é valor empenhado?", icon: CheckCircle2 },
  ];

  function toggleChat() {
    setOpen((value) => !value);
    onClick?.();
  }

  function chooseSuggestion(value: string) {
    setMessage(value);
    setSelectedSuggestion(value);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-end justify-end sm:bottom-6 sm:right-6">
      <section
        aria-label="Chat Votus IA"
        className={`absolute bottom-20 right-0 min-h-[46rem] max-h-[calc(100vh-10rem)] w-[min(22rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-[1.25rem] border border-[#EDDBBA] bg-[#FDF8EE] shadow-[0_16px_40px_rgba(27,98,58,0.2)] transition-all duration-300 ease-out ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-5 scale-95 opacity-0"
        }`}
        style={{ backgroundImage: "url(/fundochatia.png)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="flex items-start justify-between px-5 pb-3 pt-5">
          <div>
            <h2 className="font-display text-lg font-bold text-[#8D0801]">Ajuda rápida com IA</h2>
            <p className="mt-0.5 text-sm font-medium text-[#103D23]">Tire dúvidas em linguagem simples.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar chat"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#8D0801] transition-transform hover:rotate-90 cursor-pointer"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mx-5 flex items-center gap-2 rounded-lg border border-[#8D0801] bg-[#F2E4CA] px-2.5 py-2.5 text-xs leading-snug text-[#8D0801]">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EDDBBA] text-[#8D0801]">
            <Info size={14} strokeWidth={2.5} />
          </span>
          <span>Sou uma ferramenta de apoio. Não substituo fontes oficiais.</span>
        </div>

        <div className="px-5 pb-4 pt-4">
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
        </div>

        <div className="mt-60 px-5 pb-3">
          <div className="flex items-center gap-1.5">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
              placeholder="Digite sua pergunta..."
              aria-label="Digite sua pergunta"
              className="h-10 min-w-0 flex-1 rounded-md border border-[#1B623A] bg-[#FDF8EE] px-2 text-xs text-[#103D23] outline-none placeholder:text-[#6B6255] focus:ring-2 focus:ring-[#1B623A]/20"
            />
            <button
              type="button"
              aria-label="Enviar pergunta"
              className="flex h-9 w-10 shrink-0 items-center justify-center rounded-md bg-[#1B623A] text-[#FDF8EE] transition-colors hover:bg-[#103D23] cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="mt-1 text-[10px] text-[#103D23]">Enter envia · Shift + Enter quebra linha</p>
        </div>

        <div className="mx-5 mb-5 mt-1 flex items-center gap-1.5 rounded-md border border-[#1B623A] bg-[#F2E4CA] px-3 py-3 text-xs font-medium text-[#1B623A]">
          <CheckCircle2 size={18} />
          Fontes oficiais sempre visíveis
        </div>

      </section>

      <button
        type="button"
        onClick={toggleChat}
        aria-label={open ? "Fechar chat de IA" : "Perguntar à IA"}
        aria-expanded={open}
        className={`flex h-14 w-44 items-center justify-start gap-3 rounded-full bg-cover bg-center px-2 text-sm font-semibold text-[#EDDBBA] shadow-lg shadow-brasil-green-deep/20 transition-all duration-300 hover:brightness-110 cursor-pointer ${open ? "scale-100 opacity-100" : "scale-100 opacity-100"}`}
        style={{ backgroundImage: "url(/FundoFlooatingbutton.svg)" }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDDBBA]">
          <MessageCircleQuestion size={25} className="text-[#246840]" strokeWidth={1.8} />
        </span>
        <span className="whitespace-nowrap">Pergunte à IA</span>
      </button>
    </div>
  );
}