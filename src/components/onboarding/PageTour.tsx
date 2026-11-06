"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
import type { TourConfig, TourStep } from "./tours";
import { hasSeenTour, hasSeenWelcome, markTourSeen, WELCOME_CLOSED_EVENT, type TourStatus } from "./tourStorage";

const GUIDE_LABEL = "O que é esta página";
const GUIDE_SHORT_LABEL = "Ajuda";
const NAVBAR_SELECTOR = 'header[data-tour="navbar"]';
const SPOTLIGHT_PADDING = 8;
const GAP = 14;
const MARGIN = 16;
const CARD_WIDTH = 416;
const ARROW_INSET = 22;
const MOBILE_BREAKPOINT = 640;
const MOBILE_MARGIN = 12;

type Side = "bottom" | "top" | "right" | "left";

function findTarget(step: TourStep): HTMLElement | null {
  const targets = Array.isArray(step.target) ? step.target : [step.target];
  for (const target of targets) {
    const element = target.startsWith("#")
      ? document.getElementById(target.slice(1))
      : document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    // Elemento escondido (display: none, ex.: versão desktop no celular) não serve de alvo.
    if (element && element.getClientRects().length > 0) return element;
  }
  return null;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/** Onde a área livre começa: abaixo da navbar, exceto se o alvo estiver nela. */
function safeTopFor(element: Element | null) {
  const navbar = document.querySelector(NAVBAR_SELECTOR);
  if (!navbar || (element && navbar.contains(element))) return MARGIN;
  return navbar.getBoundingClientRect().bottom + MARGIN;
}

type Box = { top: number; bottom: number; left: number; right: number };

function spotlightBox(rect: DOMRect): Box {
  return {
    top: rect.top - SPOTLIGHT_PADDING,
    bottom: rect.bottom + SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    right: rect.right + SPOTLIGHT_PADDING,
  };
}

/** Lados em que o cartão cabe inteiro sem encostar no alvo, na ordem de preferência. */
function sidesThatFit(spot: Box, width: number, height: number, safeTop: number, preferTop: boolean): Side[] {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const fits: Record<Side, boolean> = {
    bottom: spot.bottom + GAP + height <= viewportHeight - MOBILE_MARGIN,
    top: spot.top - GAP - height >= safeTop,
    right: spot.right + GAP + width <= viewportWidth - MARGIN,
    left: spot.left - GAP - width >= MARGIN,
  };
  const order: Side[] = preferTop ? ["top", "bottom", "right", "left"] : ["bottom", "top", "right", "left"];
  return order.filter((side) => fits[side]);
}

/** O alvo já está inteiro na área livre (e o cartão cabe sem cobri-lo)? Então não precisa rolar. */
function targetIsWellPlaced(element: HTMLElement, cardWidth: number, cardHeight: number, isMobile: boolean) {
  const safeTop = safeTopFor(element);
  const spot = spotlightBox(element.getBoundingClientRect());
  const limit = isMobile ? window.innerHeight - cardHeight - MOBILE_MARGIN - GAP : window.innerHeight - MARGIN;
  if (spot.top < safeTop - MARGIN || spot.bottom > limit) return false;
  return isMobile || sidesThatFit(spot, cardWidth, cardHeight, safeTop, false).length > 0;
}

/**
 * Botão "O que é esta página" (na navbar) + tour guiado da página. Abre
 * sozinho na primeira visita (até a pessoa concluir ou pular a versão atual —
 * ver tourStorage) e pode ser reaberto pelo botão a qualquer momento.
 */
export default function PageTour({
  tour,
  className = "",
  onOpen,
}: {
  tour: TourConfig;
  className?: string;
  /** Avisa quem está em volta (a navbar fecha os próprios menus, que cobririam o alvo). */
  onOpen?: () => void;
}) {
  // Passos com alvo presente na tela, calculados na hora de abrir.
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    onOpen?.();
    const available = tour.steps.filter((step) => findTarget(step));
    setSteps(available.length > 0 ? available : tour.steps);
    setStepIndex(0);
  }, [tour.steps, onOpen]);

  // Abertura automática: espera os alvos obrigatórios aparecerem (listas e
  // dados que carregam depois da página, e a API pode demorar) por até ~15 s;
  // depois disso abre com os passos que estiverem na tela.
  useEffect(() => {
    if (hasSeenTour(tour.pageId, tour.version)) return;
    let attempts = 0;
    let timer = 0;
    const tryOpen = () => {
      attempts += 1;
      const ready = tour.steps.every((step) => step.optional || findTarget(step));
      if (ready || attempts >= 30) open();
      else timer = window.setTimeout(tryOpen, 500);
    };
    const start = () => {
      timer = window.setTimeout(tryOpen, 900);
    };

    // Na tela inicial, o tour só começa depois de fechar a janela de boas-vindas.
    const waitForWelcome = tour.pageId === "inicio" && !hasSeenWelcome();
    if (waitForWelcome) window.addEventListener(WELCOME_CLOSED_EVENT, start, { once: true });
    else start();

    return () => {
      window.removeEventListener(WELCOME_CLOSED_EVENT, start);
      window.clearTimeout(timer);
    };
  }, [tour.pageId, tour.version, tour.steps, open]);

  const finish = useCallback(
    (status: TourStatus) => {
      markTourSeen(tour.pageId, tour.version, status);
      setSteps(null);
      launcherRef.current?.focus({ preventScroll: true });
    },
    [tour.pageId, tour.version]
  );

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={GUIDE_LABEL}
        data-tour="guia"
        className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-[#1B623A]/25 bg-white px-3 text-[13px] font-semibold text-[#103D23] shadow-sm transition-colors hover:border-[#1B623A]/60 hover:bg-[#EDDBBA]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A] sm:px-3.5 sm:text-sm lg:border-[#1B623A]/30 lg:text-[#1B623A] ${className}`}
      >
        <CircleHelp aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
        {/* No celular o texto completo não cabe ao lado de Notícias e Menu. */}
        <span className="sm:hidden">{GUIDE_SHORT_LABEL}</span>
        <span className="hidden sm:inline">{GUIDE_LABEL}</span>
      </button>

      {steps &&
        createPortal(
          <TourOverlay
            steps={steps}
            stepIndex={stepIndex}
            onBack={() => setStepIndex((index) => Math.max(0, index - 1))}
            onNext={() => setStepIndex((index) => Math.min(steps.length - 1, index + 1))}
            onFinish={finish}
          />,
          document.body
        )}
    </>
  );
}

function TourOverlay({
  steps,
  stepIndex,
  onBack,
  onNext,
  onFinish,
}: {
  steps: TourStep[];
  stepIndex: number;
  onBack: () => void;
  onNext: () => void;
  onFinish: (status: TourStatus) => void;
}) {
  const step = steps[stepIndex];
  const total = steps.length;
  const isLast = stepIndex === total - 1;
  const titleId = useId();
  const descriptionId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [safeTop, setSafeTop] = useState(MARGIN);
  const [cardHeight, setCardHeight] = useState(220);

  // Folga no fim da página enquanto o tour está aberto, pra até o último elemento
  // conseguir subir e sobrar espaço pro cartão sem cobri-lo.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.style.paddingBottom;
    root.style.paddingBottom = "60vh";
    return () => {
      root.style.paddingBottom = previous;
    };
  }, []);

  // Rola até o alvo só se precisar (assim o título da página continua à vista)
  // e acompanha a posição dele (rolagem, resize, mudança de tamanho) pra o
  // destaque ficar sempre em cima do elemento.
  useLayoutEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Procura de novo: mudar a largura pode trocar qual versão do alvo aparece.
        const current = findTarget(step);
        setRect(current ? current.getBoundingClientRect() : null);
        setSafeTop(safeTopFor(current));
      });
    };

    const element = findTarget(step);
    const card = cardRef.current;
    if (element && card) {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const width = isMobile ? window.innerWidth - MOBILE_MARGIN * 2 : Math.min(CARD_WIDTH, window.innerWidth - MARGIN * 2);
      if (!targetIsWellPlaced(element, width, card.offsetHeight, isMobile)) {
        // scroll-padding-top (globals.css) já desconta a navbar fixa.
        element.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    }
    update();

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const observer = element ? new ResizeObserver(update) : null;
    if (element) observer?.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [step]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new ResizeObserver(() => setCardHeight(card.offsetHeight));
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  // A cada passo o foco vai pro cartão (leitor de tela anuncia título e texto).
  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, [stepIndex]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onFinish("skipped");
      return;
    }
    if (event.key !== "Tab") return;

    // Mantém o Tab dentro do cartão enquanto o tour está aberto.
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button"));
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  const cardWidth = isMobile ? viewportWidth - MOBILE_MARGIN * 2 : Math.min(CARD_WIDTH, viewportWidth - MARGIN * 2);
  const spot = rect && rect.width > 0 ? spotlightBox(rect) : null;
  let cardTop = 0;
  let cardLeft: number;
  // Celular: distância da borda de baixo da tela, onde o polegar alcança.
  let cardBottom: number | string = 0;
  // Lado do alvo em que o cartão ficou; sem lado (celular, alvo enorme) não há seta.
  let side: Side | null = null;

  if (isMobile) {
    // Celular: painel sempre na parte de baixo, ao alcance do polegar. Só sobe o
    // necessário pra ficar logo acima de um alvo que não rola (botão flutuante).
    const hidesTarget =
      spot !== null && spot.bottom + GAP > viewportHeight - cardHeight - MOBILE_MARGIN && spot.top - GAP - cardHeight >= safeTop;
    cardBottom = hidesTarget && spot ? viewportHeight - spot.top + GAP : `max(${MOBILE_MARGIN}px, env(safe-area-inset-bottom))`;
    cardLeft = MOBILE_MARGIN;
  } else if (!spot) {
    cardTop = (viewportHeight - cardHeight) / 2;
    cardLeft = (viewportWidth - cardWidth) / 2;
  } else {
    side = sidesThatFit(spot, cardWidth, cardHeight, safeTop, step.placement === "top")[0] ?? null;
    const alignedLeft = clamp(spot.left, MARGIN, viewportWidth - cardWidth - MARGIN);
    const alignedTop = clamp(spot.top, safeTop, viewportHeight - cardHeight - MARGIN);

    if (side === "bottom") {
      cardTop = spot.bottom + GAP;
      cardLeft = alignedLeft;
    } else if (side === "top") {
      cardTop = spot.top - GAP - cardHeight;
      cardLeft = alignedLeft;
    } else if (side === "right") {
      cardTop = alignedTop;
      cardLeft = spot.right + GAP;
    } else if (side === "left") {
      cardTop = alignedTop;
      cardLeft = spot.left - GAP - cardWidth;
    } else {
      // Alvo maior que o espaço livre em todos os lados: canto de baixo à direita,
      // deixando o começo do alvo e o texto dele à vista.
      cardTop = viewportHeight - cardHeight - MARGIN;
      cardLeft = viewportWidth - cardWidth - MARGIN;
    }
  }

  // Seta na borda do cartão, apontando pro centro do alvo (ou o mais perto dele).
  const arrowStyle =
    spot && (side === "bottom" || side === "top")
      ? {
          left: clamp((spot.left + spot.right) / 2 - cardLeft, ARROW_INSET, cardWidth - ARROW_INSET) - 6,
          [side === "bottom" ? "top" : "bottom"]: -6,
        }
      : spot && (side === "right" || side === "left")
        ? {
            top: clamp((spot.top + spot.bottom) / 2 - cardTop, ARROW_INSET, cardHeight - ARROW_INSET) - 6,
            [side === "right" ? "left" : "right"]: -6,
          }
        : null;
  const motion = "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out";

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Bloqueia cliques na página enquanto o tour está aberto. */}
      <div className="absolute inset-0" aria-hidden="true" />

      {rect ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none fixed rounded-2xl ring-2 ring-[#FCC100] ${motion}`}
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
            boxShadow: "0 0 0 9999px rgba(16, 61, 35, 0.55)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[#103D23]/55" />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        data-tour-side={side ?? undefined}
        className={`fixed rounded-2xl border border-[#e0d6c4] bg-white shadow-2xl outline-none ${motion}`}
        style={isMobile ? { bottom: cardBottom, left: cardLeft, width: cardWidth } : { top: cardTop, left: cardLeft, width: cardWidth }}
      >
        {arrowStyle && (
          <span
            aria-hidden="true"
            data-tour-arrow
            className={`absolute h-3 w-3 rotate-45 border-[#e0d6c4] bg-white ${motion} ${
              side === "bottom"
                ? "border-l border-t"
                : side === "top"
                  ? "border-b border-r"
                  : side === "right"
                    ? "border-b border-l"
                    : "border-r border-t"
            }`}
            style={arrowStyle}
          />
        )}

        <div
          data-tour-card-body
          className="overflow-y-auto rounded-2xl p-4 sm:p-5"
          style={{ maxHeight: viewportHeight - MOBILE_MARGIN * 2 }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8d0801]">
              {stepIndex + 1} de {total}
            </p>
            <div className="flex gap-1" aria-hidden="true">
              {steps.map((item, index) => (
                <span
                  key={item.id}
                  className={`h-1.5 rounded-full ${index === stepIndex ? "w-5 bg-[#1b623a]" : "w-1.5 bg-[#e0d6c4]"} ${motion}`}
                />
              ))}
            </div>
          </div>

          <h2 id={titleId} className="mt-2 text-lg font-black leading-snug text-[#1b623a]">
            {step.title}
          </h2>
          <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-[#4d4d4d]">
            {step.description}
          </p>
          {isLast && step.target !== "guia" && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-[#6b6255]">
              <CircleHelp aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#1b623a]" />
              Para rever, use o botão {isMobile ? GUIDE_SHORT_LABEL : GUIDE_LABEL}, no topo.
            </p>
          )}

          {/* Sempre uma linha só: no celular o "Pular" fica curto pra caber com Voltar e Próximo. */}
          <div className="mt-4 flex items-center justify-between gap-2 sm:mt-5">
            {isLast ? (
              <span />
            ) : (
              <button
                type="button"
                onClick={() => onFinish("skipped")}
                aria-label="Pular apresentação"
                className="-ml-1 min-h-11 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-1 text-sm font-semibold text-[#4d4d4d] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1b623a] lg:min-h-10"
              >
                Pular<span className="hidden sm:inline"> apresentação</span>
              </button>
            )}

            <div className="flex shrink-0 items-center gap-2">
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={onBack}
                  className="min-h-11 cursor-pointer rounded-full border border-[#e0d6c4] px-3.5 text-sm font-semibold text-[#103D23] hover:bg-[#f7f5f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b623a] lg:min-h-10"
                >
                  Voltar
                </button>
              )}
              <button
                type="button"
                onClick={() => (isLast ? onFinish("completed") : onNext())}
                className="min-h-11 cursor-pointer rounded-full bg-[#1b623a] px-4 text-sm font-semibold text-white hover:bg-[#134A2A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b623a] lg:min-h-10"
              >
                {isLast ? "Concluir" : "Próximo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
