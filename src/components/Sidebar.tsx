"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { ChevronDown, LayoutGrid, Menu, Newspaper, X } from "lucide-react";
import {
  NAV_GROUPS,
  ACTIVE_CLASS,
  OPEN_ARRIVAL_MENU_EVENT,
  getActiveGroupId,
  getActiveRouteId,
  type NavGroup,
} from "./navItems";
import PageTour from "./onboarding/PageTour";
import { getTourForPath } from "./onboarding/tours";
import { prefetchRoute } from "@/lib/prefetch";

const LINK_CLASS = "text-[#103D23] hover:bg-[#EDDBBA]/40";
// Botões dos grupos da navbar: texto escuro e fundo areia no hover; o grupo
// da página atual ganha fundo areia + contorno verde (sem pintar a barra
// inteira de cor forte).
const GROUP_IDLE_CLASS = "text-[#103D23] hover:bg-[#EDDBBA]/45";
const GROUP_ACTIVE_CLASS = "bg-[#EDDBBA]/70 text-[#1B623A] ring-1 ring-inset ring-[#1B623A]/25";
const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]";
const NEWS_PATH = "/PainelNoticiasPage";
// Mesmo formato pros botões da barra no celular/tablet (o do guia, em PageTour, segue igual).
const MOBILE_BUTTON_CLASS =
  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[#1B623A]/25 bg-white px-3 text-[13px] font-semibold shadow-sm transition-colors sm:px-3.5 sm:text-sm";

function GroupIcon({ group, className }: { group: NavGroup; className: string }) {
  if (!group.icon) return <LayoutGrid aria-hidden="true" className={`${className} text-[#1B623A]`} strokeWidth={2.2} />;
  return <img src={group.icon} alt="" className={`${className} object-contain`} />;
}

// Atalho de Notícias no celular/tablet. No desktop é um item comum da navbar
// (NAV_GROUPS); o Radar continua no menu.
function MobileNewsButton({ active }: { active: boolean }) {
  return (
    <Link
      href={NEWS_PATH}
      aria-current={active ? "page" : undefined}
      onMouseEnter={() => prefetchRoute(NEWS_PATH)}
      className={`${MOBILE_BUTTON_CLASS} ${active ? GROUP_ACTIVE_CLASS : GROUP_IDLE_CLASS} ${FOCUS_RING}`}
    >
      <Newspaper aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
      Notícias
    </Link>
  );
}

// Navbar superior. O componente mantém o nome Sidebar porque as páginas já o
// importam (cada página monta a própria navegação); assim a troca de menu
// lateral pra barra no topo não precisa mexer no import de cada uma.
export default function Sidebar() {
  const pathname = usePathname();
  const activeRouteId = getActiveRouteId(pathname);
  const activeGroupId = getActiveGroupId(activeRouteId);
  const tour = getTourForPath(pathname);

  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const focusFirstLinkRef = useRef(false);

  // Fecha tudo ao trocar de página.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpenGroupId(null);
    setMobileOpen(false);
  }

  // Chegada pela landing: o menu abre sozinho, também no desktop, logo abaixo da
  // barra. null = menu comum do celular.
  const [arrivalTop, setArrivalTop] = useState<number | null>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setArrivalTop(null);
  }, []);

  useEffect(() => {
    function openOnArrival() {
      setArrivalTop(window.innerWidth >= 1024 ? (headerRef.current?.getBoundingClientRect().bottom ?? 0) + 12 : 12);
      setMobileOpen(true);
    }
    window.addEventListener(OPEN_ARRIVAL_MENU_EVENT, openOnArrival);
    return () => window.removeEventListener(OPEN_ARRIVAL_MENU_EVENT, openOnArrival);
  }, []);

  // O tour fecha os menus da barra: aberto, o dropdown ficaria sobre os alvos.
  const closeMenus = useCallback(() => {
    setOpenGroupId(null);
    setMobileOpen(false);
  }, []);

  // Clique fora ou Esc fecham o dropdown aberto (Esc devolve o foco ao botão).
  useEffect(() => {
    if (!openGroupId) return;

    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setOpenGroupId(null);
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      buttonRefs.current[openGroupId!]?.focus();
      setOpenGroupId(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openGroupId]);

  // Abriu pelo teclado (seta pra baixo): foco vai pro primeiro link do painel.
  useEffect(() => {
    if (!openGroupId || !focusFirstLinkRef.current) return;
    focusFirstLinkRef.current = false;
    panelRefs.current[openGroupId]?.querySelector<HTMLElement>("a")?.focus();
  }, [openGroupId]);

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>, groupId: string) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    focusFirstLinkRef.current = true;
    if (openGroupId === groupId) {
      panelRefs.current[groupId]?.querySelector<HTMLElement>("a")?.focus();
    } else {
      setOpenGroupId(groupId);
    }
  }

  // Setas/Home/End percorrem os links do painel aberto.
  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a"));
    const index = links.indexOf(document.activeElement as HTMLElement);
    let next: number | null = null;

    if (event.key === "ArrowDown") next = (index + 1) % links.length;
    if (event.key === "ArrowUp") next = (index - 1 + links.length) % links.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = links.length - 1;
    if (next === null) return;

    event.preventDefault();
    links[next]?.focus();
  }

  return (
    <header
      data-tour="navbar"
      className="sticky top-0 z-40 bg-white/95 shadow-[0_8px_24px_-16px_rgba(16,61,35,0.45)] backdrop-blur"
    >
      <div
        ref={headerRef}
        // Tab pra fora da navbar fecha o dropdown aberto.
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenGroupId(null);
        }}
        className="flex h-16 w-full items-center gap-1.5 px-3 sm:gap-3 sm:px-6 lg:h-[72px] lg:gap-3 lg:px-6 xl:gap-4 xl:px-10"
      >
        <Link
          href="/InicialPage"
          aria-label="Votus — página inicial"
          className={`flex shrink-0 items-center gap-2 rounded-xl ${FOCUS_RING}`}
        >
          <img src="/Iconeprincipal.svg" alt="" className="h-8 w-8 object-contain lg:h-10 lg:w-10" />
          {/* Celular estreito e desktop até 1279px: só o papagaio, pra caber a barra toda. */}
          <img src="/IconeVotus.svg" alt="" className="hidden h-6 w-auto sm:block lg:hidden xl:block xl:h-8" />
        </Link>

        <nav aria-label="Navegação principal" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {NAV_GROUPS.map((group, index) => {
              const isGroupActive = activeGroupId === group.id;

              if (group.path) {
                return (
                  <li key={group.id}>
                    <Link
                      href={group.path}
                      aria-current={activeRouteId === group.id ? "page" : undefined}
                      onMouseEnter={() => prefetchRoute(group.path!)}
                      className={`flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors xl:px-3.5 ${
                        isGroupActive ? GROUP_ACTIVE_CLASS : GROUP_IDLE_CLASS
                      } ${FOCUS_RING}`}
                    >
                      <GroupIcon group={group} className="hidden h-[22px] w-[22px] shrink-0 2xl:block" />
                      {group.shortLabel ? (
                        <>
                          <span className="xl:hidden">{group.shortLabel}</span>
                          <span className="hidden xl:inline">{group.label}</span>
                        </>
                      ) : (
                        group.label
                      )}
                    </Link>
                  </li>
                );
              }

              const isOpen = openGroupId === group.id;
              const panelId = `navbar-${group.id}`;
              const alignRight = index === NAV_GROUPS.length - 1;

              return (
                <li key={group.id} className="relative">
                  <button
                    ref={(el) => {
                      buttonRefs.current[group.id] = el;
                    }}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenGroupId(isOpen ? null : group.id)}
                    onKeyDown={(event) => handleButtonKeyDown(event, group.id)}
                    className={`flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors xl:gap-2 xl:px-3.5 ${
                      isGroupActive || isOpen ? GROUP_ACTIVE_CLASS : GROUP_IDLE_CLASS
                    } ${FOCUS_RING}`}
                  >
                    <GroupIcon group={group} className="hidden h-[22px] w-[22px] shrink-0 2xl:block" />
                    {group.label}
                    {isGroupActive && <span className="sr-only"> (área atual)</span>}
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      ref={(el) => {
                        panelRefs.current[group.id] = el;
                      }}
                      onKeyDown={handlePanelKeyDown}
                      className={`absolute top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-[#8D0801]/10 bg-white p-2 shadow-xl ${
                        alignRight ? "right-0" : "left-0"
                      }`}
                    >
                      <GroupSections
                        group={group}
                        activeRouteId={activeRouteId}
                        onNavigate={() => setOpenGroupId(null)}
                        columns
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Celular/tablet: Notícias, Menu e, por último, o guia da página.
            No desktop só o guia fica aqui (Notícias está na lista acima). */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
          <span className="lg:hidden">
            <MobileNewsButton active={activeRouteId === "noticias"} />
          </span>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            aria-label="Abrir menu"
            className={`${MOBILE_BUTTON_CLASS} ${GROUP_IDLE_CLASS} lg:hidden ${FOCUS_RING}`}
          >
            <Menu aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
            {/* Em tela muito estreita fica só o ícone. */}
            <span className="hidden min-[350px]:inline">Menu</span>
          </button>

          {tour && <PageTour key={tour.pageId} tour={tour} onOpen={closeMenus} />}
        </div>
      </div>

      {/* Faixa fina com as cores do Votus: dá identidade e separa a barra do
          conteúdo sem pesar. */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full bg-[linear-gradient(90deg,#1B623A_0_25%,#FCC100_25%_50%,#FF7700_50%_75%,#8D0801_75%_100%)]"
      />

      {/* Portal: o backdrop-blur do header vira o "containing block" de
          elementos fixed, o que prenderia o painel dentro da navbar. */}
      {mobileOpen &&
        createPortal(
          <MobileMenu activeRouteId={activeRouteId} activeGroupId={activeGroupId} arrivalTop={arrivalTop} onClose={closeMobile} />,
          document.body
        )}
    </header>
  );
}

function GroupSections({
  group,
  activeRouteId,
  onNavigate,
  columns = false,
  linkClassName = "px-3 py-2",
}: {
  group: NavGroup;
  activeRouteId: string | undefined;
  onNavigate: () => void;
  columns?: boolean;
  linkClassName?: string;
}) {
  const sections = group.sections ?? [];
  const multiColumn = columns && sections.length > 1 && sections.every((section) => section.label);

  return (
    <div className={multiColumn ? "grid w-[30rem] grid-cols-2 gap-2" : columns ? "flex w-60 flex-col gap-2" : "flex flex-col gap-2"}>
      {sections.map((section, index) => (
        <div key={section.label ?? index}>
          {section.label && (
            <p className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wider text-[#103D23]/55">
              {section.label}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const isActive = activeRouteId === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={() => prefetchRoute(item.path)}
                    onClick={onNavigate}
                    className={`flex items-center rounded-xl text-sm font-medium transition-colors ${linkClassName} ${
                      isActive ? ACTIVE_CLASS : LINK_CLASS
                    } ${FOCUS_RING}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Menu do celular/tablet: painel lateral com os mesmos grupos da navbar, em
// sanfona (o grupo da página atual já vem aberto).
function MobileMenu({
  activeRouteId,
  activeGroupId,
  arrivalTop,
  onClose,
}: {
  activeRouteId: string | undefined;
  activeGroupId: string | undefined;
  arrivalTop: number | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(
    activeGroupId && activeGroupId !== "inicio" ? activeGroupId : null
  );

  // Trava a rolagem da página, prende o Tab dentro do painel, fecha com Esc e
  // devolve o foco pra quem abriu o menu.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-[60] ${arrivalTop === null ? "lg:hidden" : ""}`}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#103D23]/40"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu do Votus"
        // Cartão branco que cresce só o necessário, em vez de um painel na altura
        // toda da tela. Com um grupo aberto em tela baixa, a lista rola por dentro.
        className="absolute right-3 top-3 flex w-[min(19rem,calc(100vw-1.5rem))] animate-[votus-chat-in_0.2s_ease-out_both] flex-col overflow-hidden rounded-2xl border border-[#e0d6c4] bg-white shadow-2xl lg:right-6 xl:right-10"
        style={{ top: arrivalTop ?? undefined, maxHeight: `calc(100dvh - ${(arrivalTop ?? 12) + 12}px)` }}
      >
        <div className="flex shrink-0 items-center justify-between py-1 pl-4 pr-1.5">
          {arrivalTop === null ? (
            <img src="/IconeVotus.svg" alt="Votus" className="h-5 w-auto" />
          ) : (
            <p className="min-w-0 text-sm font-bold leading-tight text-[#1B623A]">Navegue pelo site por aqui</p>
          )}
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label="Fechar menu"
            className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[#103D23] hover:bg-[#EDDBBA]/40 ${FOCUS_RING}`}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Navegação principal" className="min-h-0 overflow-y-auto px-2 pb-2">
          <ul className="flex flex-col gap-0.5">
            {NAV_GROUPS.map((group) => {
              const isGroupActive = activeGroupId === group.id;

              if (group.path) {
                return (
                  <li key={group.id}>
                    <Link
                      href={group.path}
                      aria-current={activeRouteId === group.id ? "page" : undefined}
                      onClick={onClose}
                      className={`flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold transition-colors ${
                        isGroupActive ? ACTIVE_CLASS : LINK_CLASS
                      } ${FOCUS_RING}`}
                    >
                      <GroupIcon group={group} className="h-5 w-5 shrink-0" />
                      {group.label}
                    </Link>
                  </li>
                );
              }

              const isExpanded = expandedId === group.id;
              const panelId = `menu-celular-${group.id}`;

              return (
                <li key={group.id}>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() => setExpandedId(isExpanded ? null : group.id)}
                    className={`flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl px-3 text-left text-sm font-semibold transition-colors ${
                      isGroupActive ? "text-[#1B623A]" : "text-[#103D23]"
                    } hover:bg-[#EDDBBA]/40 ${FOCUS_RING}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <GroupIcon group={group} className="h-5 w-5 shrink-0" />
                      {group.label}
                      {isGroupActive && <span className="sr-only"> (área atual)</span>}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isExpanded && (
                    <div id={panelId} className="pb-1.5 pl-[1.625rem]">
                      <GroupSections
                        group={group}
                        activeRouteId={activeRouteId}
                        onNavigate={onClose}
                        linkClassName="min-h-10 px-3"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
