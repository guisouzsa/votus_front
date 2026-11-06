"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { OPEN_ARRIVAL_MENU_EVENT } from "./navItems";
import { getTourForPath } from "./onboarding/tours";
import { hasSeenWelcome, markTourSeen, markWelcomeSeen, WELCOME_CLOSED_EVENT } from "./onboarding/tourStorage";

const ARRIVAL_KEY = "votus:chegada-landing";
// As mesmas imagens da logo da navbar, pra encaixar sem troca visível.
const LOGO_IVY = "/Iconeprincipal.svg";
const LOGO_NOME = "/IconeVotus.svg";
const FLY_MS = 650;

const SECOES = [
  {
    titulo: "Notícias",
    texto: "Resumo dos assuntos do momento, com link para a fonte original.",
    href: "/PainelNoticiasPage",
    icone: "/IconeNoticias.png",
  },
  {
    titulo: "Representantes",
    texto: "Quem exerce mandato hoje e as candidaturas de 2026, com perfis completos.",
    href: "/DeputadosPage",
    icone: "/Iconesenadores.svg",
  },
  {
    titulo: "Entender",
    texto: "O que faz cada cargo, o Você Sabia? com quiz, propostas e oportunidades para a juventude.",
    href: "/ExplicacoesPage",
    icone: "/IconeExplicacoes.svg",
  },
  {
    titulo: "Radar do Brasil",
    texto: "O que os parlamentares de cada estado têm proposto, tema a tema.",
    href: "/RadarPage",
    icone: "/IconeRadar.svg",
  },
  {
    titulo: "Mais",
    texto: "Gerador de cola eleitoral, simulador de urna e sugestões.",
    href: "/SantinhoPage",
  },
];

/** Avisa a tela inicial que a pessoa veio da transição da landing. */
export function markLandingArrival() {
  try {
    window.sessionStorage.setItem(ARRIVAL_KEY, "1");
  } catch {
    // Sem armazenamento, a tela inicial só aparece sem o fade.
  }
}

function consumeLandingArrival() {
  try {
    const arrived = window.sessionStorage.getItem(ARRIVAL_KEY) === "1";
    window.sessionStorage.removeItem(ARRIVAL_KEY);
    return arrived;
  } catch {
    return false;
  }
}

/**
 * A logo (Ivy + nome) e a descrição no centro da tela, usadas nas duas metades
 * da transição: precisam ter o mesmo layout pra troca de página não aparecer.
 */
export function TransitionContent({
  logoClassName = "",
  logoStyle,
  textClassName = "",
}: {
  logoClassName?: string;
  logoStyle?: CSSProperties;
  textClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 text-center">
      <div
        data-transition-logo
        aria-hidden="true"
        className={`flex items-center gap-2 sm:gap-3 ${logoClassName}`}
        style={logoStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_IVY} alt="" className="h-14 w-auto sm:h-20" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_NOME} alt="" className="h-10 w-auto sm:h-14" />
      </div>
      <p data-transition-text className={`mt-8 max-w-md text-sm font-medium leading-snug text-[#103D23] sm:mt-10 sm:text-lg ${textClassName}`}>
        Conheça candidatos, acompanhe notícias e monte seu santinho
      </p>
    </div>
  );
}

// Leva cada parte da logo pro lugar real dela na navbar, enquanto o branco some.
// O que não aparece na navbar nessa largura (o nome, no celular) só desaparece.
async function flyLogoToNavbar(overlay: HTMLElement) {
  const logo = overlay.querySelector<HTMLElement>("[data-transition-logo]");
  const backdrop = overlay.querySelector<HTMLElement>("[data-transition-backdrop]");
  if (!logo || !backdrop) return;

  const parts = [LOGO_IVY, LOGO_NOME].map((src) => ({
    mark: logo.querySelector<HTMLImageElement>(`img[src="${src}"]`),
    target: document.querySelector<HTMLImageElement>(`header[data-tour="navbar"] img[src="${src}"]`),
  }));

  // A logo da navbar fica escondida até a outra chegar, senão aparecem duas
  // quando o branco começa a sumir.
  parts.forEach(({ target }) => {
    if (target) target.style.visibility = "hidden";
  });

  try {
    // Antes de carregar, a imagem tem largura 0 e a medida sairia errada.
    await Promise.all(parts.flatMap(({ mark, target }) => [mark?.decode().catch(() => {}), target?.decode().catch(() => {})]));
    await animateLogoParts(logo, backdrop, parts);
  } finally {
    parts.forEach(({ target }) => {
      if (target) target.style.visibility = "";
    });
  }
}

async function animateLogoParts(
  logo: HTMLElement,
  backdrop: HTMLElement,
  parts: { mark: HTMLImageElement | null; target: HTMLImageElement | null }[]
) {
  const measured = parts.map(({ mark, target }) => ({
    mark,
    from: mark?.getBoundingClientRect(),
    to: target && target.getClientRects().length > 0 ? target.getBoundingClientRect() : null,
  }));

  // Solta as imagens da centralização pra animar cada uma a partir de onde está,
  // mantendo o espaço delas pra descrição não pular.
  logo.style.width = `${logo.offsetWidth}px`;
  logo.style.height = `${logo.offsetHeight}px`;
  logo.style.transform = "none";
  const options = { duration: FLY_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" as const };
  const animations = measured.flatMap(({ mark, from, to }) => {
    if (!mark || !from) return [];
    Object.assign(mark.style, {
      position: "fixed",
      top: `${from.top}px`,
      left: `${from.left}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
      transformOrigin: "0 0",
    });
    const end = to
      ? { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})` }
      : { opacity: 0 };
    return [mark.animate([to ? { transform: "none" } : { opacity: 1 }, end], options)];
  });
  animations.push(backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, delay: 100, easing: "ease-out", fill: "both" }));
  const text = logo.parentElement?.querySelector<HTMLElement>("[data-transition-text]");
  if (text) animations.push(text.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-out", fill: "both" }));

  await Promise.all(animations.map((animation) => animation.finished));
}

/**
 * Chegada na tela inicial. Vindo da landing: a logo vai pro lugar dela na navbar
 * e o menu abre, em todo clique, pra pessoa escolher pra onde ir; a janela de
 * boas-vindas e o tour não entram por cima (o tour segue no botão do guia).
 * Entrando direto, a primeira visita abre a janela de boas-vindas, e o tour da
 * tela inicial (PageTour) espera ela fechar.
 */
export default function WelcomeIntro() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const arrivedRef = useRef(false);
  const [open, setOpen] = useState(false);

  // Antes da pintura, pra tela inicial não aparecer por um instante sem o branco.
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !consumeLandingArrival()) return;

    arrivedRef.current = true;
    markWelcomeSeen();
    const homeTour = getTourForPath("/InicialPage");
    if (homeTour) markTourSeen(homeTour.pageId, homeTour.version, "skipped");

    const openMenu = () => window.dispatchEvent(new Event(OPEN_ARRIVAL_MENU_EVENT));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // A navbar ainda precisa montar o listener do menu (efeito depois deste).
      window.setTimeout(openMenu, 100);
      return;
    }

    overlay.hidden = false;
    flyLogoToNavbar(overlay)
      .catch(() => {})
      .finally(() => {
        overlay.hidden = true;
        openMenu();
      });
  }, []);

  useEffect(() => {
    if (hasSeenWelcome()) return;
    const timer = window.setTimeout(() => setOpen(true), arrivedRef.current ? FLY_MS + 100 : 350);
    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    markWelcomeSeen();
    setOpen(false);
    window.dispatchEvent(new Event(WELCOME_CLOSED_EVENT));
  }

  return (
    <>
      <div ref={overlayRef} hidden className="fixed inset-0 z-[100]">
        <div data-transition-backdrop className="absolute inset-0 bg-[#FDFDFD]" />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Mesma escala em que a logo termina na landing (votus-enter-grow). */}
          <TransitionContent logoStyle={{ transform: "scale(1.3)" }} />
        </div>
      </div>
      {open && (
        <WelcomeDialog
          onClose={close}
          onNavigate={() => {
            // Foi pra outra página: não dispara o tour da tela inicial agora.
            markWelcomeSeen();
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function WelcomeDialog({ onClose, onNavigate }: { onClose: () => void; onNavigate: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cardRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    // Mantém o Tab dentro da janela.
    const focusables = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href], button"));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#103D23]/55 p-3 sm:p-4">
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="boas-vindas-titulo"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="max-h-full w-full max-w-lg animate-[votus-chat-in_0.4s_ease-out_both] overflow-y-auto rounded-2xl border border-[#e0d6c4] bg-white p-5 shadow-2xl outline-none sm:p-6"
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ivy_votus.png" alt="" className="h-14 w-auto shrink-0" />
          <div className="min-w-0">
            <h2 id="boas-vindas-titulo" className="font-heading text-xl font-bold leading-tight text-brasil-red sm:text-2xl">
              Conheça o Votus
            </h2>
            <p className="mt-1 text-sm leading-snug text-ink-soft">Veja o que você encontra por aqui:</p>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-1">
          {SECOES.map((secao) => (
            <li key={secao.titulo}>
              <Link
                href={secao.href}
                onClick={onNavigate}
                className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-[#EDDBBA]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B623A]"
              >
                {secao.icone ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={secao.icone} alt="" className="mt-0.5 h-6 w-6 shrink-0 object-contain" />
                ) : (
                  <LayoutGrid aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-[#1B623A]" strokeWidth={2} />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#103D23]">{secao.titulo}</span>
                  <span className="block text-sm leading-snug text-ink-soft">{secao.texto}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-11 w-full cursor-pointer rounded-full bg-[#1b623a] px-6 text-sm font-semibold text-white hover:bg-[#134A2A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b623a] sm:ml-auto sm:block sm:min-h-10 sm:w-auto"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
