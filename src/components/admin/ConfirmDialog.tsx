"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  // danger: excluir/remover (vermelho). primary: publicar/restaurar (verde).
  tone?: "danger" | "primary";
};

type Pendente = ConfirmOptions & { resolve: (ok: boolean) => void };

const TONE_CLASS = {
  danger: "bg-[#8D0801] hover:bg-[#6d0601]",
  primary: "bg-[#1b623a] hover:bg-[#164f30]",
};

/**
 * Substitui o window.confirm nas ações importantes do admin (excluir,
 * publicar, despublicar, restaurar): mesmo visual dos outros modais do
 * painel e funciona igual no celular. Uso:
 *
 *   const { confirm, confirmDialog } = useConfirm();
 *   if (!(await confirm({ title: "Excluir?", confirmLabel: "Excluir", tone: "danger" }))) return;
 *   ...
 *   return <>{...}{confirmDialog}</>;
 */
export function useConfirm() {
  const [pendente, setPendente] = useState<Pendente | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPendente({ ...options, resolve })),
    []
  );

  const responder = useCallback(
    (ok: boolean) => {
      pendente?.resolve(ok);
      setPendente(null);
    },
    [pendente]
  );

  const confirmDialog = pendente ? <ConfirmDialog {...pendente} onAnswer={responder} /> : null;

  return { confirm, confirmDialog };
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  tone = "danger",
  onAnswer,
}: ConfirmOptions & { onAnswer: (ok: boolean) => void }) {
  const cancelarRef = useRef<HTMLButtonElement>(null);

  // Foco começa em "Cancelar" (a opção segura) e Esc cancela.
  useEffect(() => {
    cancelarRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onAnswer(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onAnswer]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onAnswer(false);
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={message ? "confirm-dialog-message" : undefined}
        className="w-full max-w-sm rounded-[16px] bg-white p-6 shadow-lg"
      >
        <h2 id="confirm-dialog-title" className="text-base font-black text-[#22201b]">
          {title}
        </h2>
        {message && (
          <p id="confirm-dialog-message" className="mt-2 text-sm text-[#6b6255]">
            {message}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelarRef}
            type="button"
            onClick={() => onAnswer(false)}
            className="rounded-[10px] border border-line px-5 py-2.5 text-sm font-bold text-[#22201b] transition-colors hover:bg-[#FDF8EE]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onAnswer(true)}
            className={`rounded-[10px] px-5 py-2.5 text-sm font-bold text-white transition-colors ${TONE_CLASS[tone]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
