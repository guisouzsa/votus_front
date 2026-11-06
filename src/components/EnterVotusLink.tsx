"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { markLandingArrival, TransitionContent } from "./WelcomeIntro";

const ENTRY_PATH = "/InicialPage";
// Mesma duração da animação votus-enter-grow (globals.css).
const TRANSITION_MS = 1000;

/**
 * Botão da landing que leva ao site: em tela branca, a logo (Ivy + nome) aparece
 * e cresce, com a descrição embaixo; na tela inicial, ela segue pra navbar (ver
 * WelcomeIntro). Ctrl/Cmd + clique continua abrindo em outra aba.
 */
export default function EnterVotusLink({ className, children }: { className?: string; children: ReactNode }) {
  const router = useRouter();
  const [entering, setEntering] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => {
    router.prefetch(ENTRY_PATH);
  }, [router]);

  // Separado do prefetch: uma mudança de `router` logo depois de hidratar não
  // pode cancelar a navegação de quem já clicou.
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (entering) return;

    markLandingArrival();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(ENTRY_PATH);
      return;
    }

    setEntering(true);
    timerRef.current = window.setTimeout(() => router.push(ENTRY_PATH), TRANSITION_MS);
  }

  return (
    <>
      <Link href={ENTRY_PATH} onClick={handleClick} className={className}>
        {children}
      </Link>

      {/* Fica na tela até a nova página assumir, mesmo se ela demorar a carregar. */}
      {entering &&
        createPortal(
          <div role="status" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFDFD]">
            <span className="sr-only">Abrindo o Votus</span>
            <TransitionContent
              logoClassName="animate-[votus-enter-grow_1s_ease-out_both]"
              textClassName="animate-[votus-chat-in_0.5s_ease-out_0.25s_both]"
            />
          </div>,
          document.body
        )}
    </>
  );
}
