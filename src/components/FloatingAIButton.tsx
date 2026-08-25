"use client";

import { MessageCircleQuestion } from "lucide-react";

export default function FloatingAIButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-brasil-green px-5 py-3.5 text-sm font-semibold text-cream shadow-lg shadow-brasil-green-deep/20 transition-transform hover:scale-105 hover:bg-brasil-green-deep cursor-pointer"
    >
      <MessageCircleQuestion size={20} />
      Pergunta à IA
    </button>
  );
}