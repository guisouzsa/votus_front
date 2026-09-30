"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, ACTIVE_CLASS, getActiveRouteId } from "./navItems";
import { prefetchRoute } from "@/lib/prefetch";

// Cor/sombra do marcador que desliza atrás do item ativo — mesmo visual que
// ACTIVE_CLASS já dava (bg-[#EDDBBA]/50 shadow-sm), só que agora é um único
// elemento posicionado por cima da largura/altura de cada slot, em vez de
// cada botão ligar/desligar o próprio fundo (o que fazia o destaque
// "piscar" de um item pro outro em vez de deslizar). A cor do texto/ícone
// (text-[#1B623A]) continua sendo aplicada por botão, sem mudança.
const MARKER_CLASS = "bg-[#EDDBBA]/50 shadow-sm";
const ACTIVE_TEXT_CLASS = "text-[#1B623A]";

export default function MobileBottomNav() {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const pathname = usePathname();
  const activeRouteId = getActiveRouteId(pathname);

  const closePopover = () => setExpandedGroupId(null);

  const navRef = useRef<HTMLElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [marker, setMarker] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  // Índice do slot em destaque agora (0-3 = 4 primeiros itens, 4 = "Mais"),
  // ou null se nenhum estiver ativo — mesma condição que cada botão já usava
  // pra decidir se aplica ACTIVE_CLASS, só centralizada aqui pra mover o
  // marcador único em vez de cada botão ligar/desligar o próprio destaque.
  const highlightedIndex = (() => {
    for (let i = 0; i < 4; i++) {
      const item = NAV_ITEMS[i];
      const isActive = activeRouteId === item.id;
      const isGroupActive = item.children?.some((child) => child.id === activeRouteId) ?? false;
      const isOpen = expandedGroupId === item.id;

      if (item.children ? isGroupActive || isOpen : isActive) return i;
    }

    return expandedGroupId === "mais" ? 4 : null;
  })();

  // Mede a posição/tamanho real do slot em destaque (via DOM) e reposiciona
  // o marcador — roda antes da pintura (useLayoutEffect) pra nunca mostrar
  // o marcador "pulando" de lugar. O deslizar em si é feito por transition
  // no CSS (ver style abaixo), não aqui.
  useLayoutEffect(() => {
    function medir() {
      if (highlightedIndex === null || !navRef.current) return;

      const slot = slotRefs.current[highlightedIndex];
      if (!slot) return;

      const navRect = navRef.current.getBoundingClientRect();
      const slotRect = slot.getBoundingClientRect();

      // Pill um pouco mais larga que o botão circular (48px), pra dar a
      // aparência pedida sem depender de medir o botão em si.
      const largura = 64;
      const centroX = slotRect.left - navRect.left + slotRect.width / 2;

      setMarker({
        left: centroX - largura / 2,
        top: slotRect.top - navRect.top,
        width: largura,
        height: slotRect.height,
      });
    }

    medir();

    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [highlightedIndex]);

  return (
    <>
      {expandedGroupId && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closePopover}
          className="fixed inset-0 z-30 md:hidden"
        />
      )}

      <nav
        ref={navRef}
        aria-label="Navegação principal"
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-0.5 rounded-full border border-[#8D0801]/15 bg-[#FDF8EE] px-2 py-2 shadow-lg md:hidden"
      >
        {/* Marcador único que desliza atrás do item ativo, em vez de cada
            botão ligar/desligar o próprio fundo — ver highlightedIndex e o
            useLayoutEffect acima. Some com opacidade quando nada bate
            (ex: página fora dos itens do menu). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full transition-[left,top,width,height,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: marker?.left ?? 0,
            top: marker?.top ?? 0,
            width: marker?.width ?? 48,
            height: marker?.height ?? 48,
            opacity: marker && highlightedIndex !== null ? 1 : 0,
          }}
        >
          <div className={`h-full w-full rounded-full ${MARKER_CLASS}`} />
        </div>

        {/* Primeiros 4 itens (Início, Notícias, Cargos atuais, Candidatos 2026) */}
        {NAV_ITEMS.slice(0, 4).map(({ id, label, icon, iconClass, path, children }, index) => {
          const isActive = activeRouteId === id;
          const isGroupActive = children?.some((child) => child.id === activeRouteId) ?? false;

          if (children) {
            const isOpen = expandedGroupId === id;

            return (
              <div
                key={id}
                ref={(el) => {
                  slotRefs.current[index] = el;
                }}
                className="relative flex flex-1 justify-center"
              >
                {isOpen && (
                  <div className="absolute bottom-[calc(100%+0.75rem)] left-1/2 z-40 flex -translate-x-1/2 flex-col gap-1 whitespace-nowrap rounded-2xl border border-[#8D0801]/15 bg-[#FDF8EE] p-2 shadow-lg">
                    <span className="px-4 pb-1 pt-1.5 text-left text-xs font-bold uppercase tracking-wide text-[#103D23]/60">
                      {label}
                    </span>
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.path}
                        onTouchStart={() => prefetchRoute(child.path)}
                        onClick={closePopover}
                        className={`rounded-xl px-4 py-2 text-left text-sm font-medium transition-colors ${
                          activeRouteId === child.id ? ACTIVE_CLASS : "text-[#103D23] hover:bg-black/5"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setExpandedGroupId((prev) => (prev === id ? null : id))}
                  aria-expanded={isOpen}
                  aria-label={label}
                  title={label}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    isGroupActive || isOpen ? ACTIVE_TEXT_CLASS : "text-[#103D23]"
                  }`}
                >
                  <img src={icon} alt="" className={`${iconClass || "h-6 w-6"} shrink-0`} />
                </button>
              </div>
            );
          }

          return (
            <div
              key={id}
              ref={(el) => {
                slotRefs.current[index] = el;
              }}
              className="flex flex-1 justify-center"
            >
              <Link
                href={path!}
                onTouchStart={() => prefetchRoute(path!)}
                onClick={closePopover}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                title={label}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  isActive ? ACTIVE_TEXT_CLASS : "text-[#103D23]"
                }`}
              >
                <img src={icon} alt="" className={`${iconClass || "h-6 w-6"} shrink-0`} />
              </Link>
            </div>
          );
        })}

        {/* Botão 'Mais' agrupando Propostas, Santinho, Explicações, Sobre Nós */}
        <div
          ref={(el) => {
            slotRefs.current[4] = el;
          }}
          className="relative flex flex-1 justify-center"
        >
          {expandedGroupId === "mais" && (
            <div className="absolute bottom-[calc(100%+0.75rem)] right-0 z-40 flex max-h-[70vh] flex-col gap-1 overflow-y-auto whitespace-nowrap rounded-2xl border border-[#8D0801]/15 bg-[#FDF8EE] p-2 shadow-lg">
              {NAV_ITEMS.slice(4).map((child) =>
                child.children ? (
                  <div key={child.id} className="flex flex-col gap-1">
                    <span className="flex items-center gap-3 pl-4 pr-5 pt-1.5 text-left text-xs font-bold uppercase tracking-wide text-[#103D23]/60">
                      {child.label}
                    </span>
                    {child.children.map((grandchild) => (
                      <Link
                        key={grandchild.id}
                        href={grandchild.path}
                        onTouchStart={() => prefetchRoute(grandchild.path)}
                        onClick={closePopover}
                        className={`flex items-center gap-3 rounded-xl py-2 pl-8 pr-5 text-left text-sm font-medium transition-colors ${
                          activeRouteId === grandchild.id ? ACTIVE_CLASS : "text-[#103D23] hover:bg-black/5"
                        }`}
                      >
                        <span>{grandchild.label}</span>
                      </Link>
                    ))}
                  </div>
                ) : child.path ? (
                  <Link
                    key={child.id}
                    href={child.path}
                    onTouchStart={() => prefetchRoute(child.path)}
                    onClick={closePopover}
                    className={`flex items-center gap-3 rounded-xl py-2 pl-4 pr-5 text-left text-sm font-medium transition-colors ${
                      activeRouteId === child.id ? ACTIVE_CLASS : "text-[#103D23] hover:bg-black/5"
                    }`}
                  >
                    <img src={child.icon} alt="" className="h-5 w-5 shrink-0 opacity-70" />
                    <span>{child.label}</span>
                  </Link>
                ) : (
                  <button
                    key={child.id}
                    type="button"
                    onClick={closePopover}
                    className="flex items-center gap-3 rounded-xl py-2 pl-4 pr-5 text-left text-sm font-medium text-[#103D23] transition-colors hover:bg-black/5"
                  >
                    <img src={child.icon} alt="" className="h-5 w-5 shrink-0 opacity-70" />
                    <span>{child.label}</span>
                  </button>
                )
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setExpandedGroupId((prev) => (prev === "mais" ? null : "mais"))}
            aria-expanded={expandedGroupId === "mais"}
            aria-label="Mais opções"
            title="Mais opções"
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              expandedGroupId === "mais" ? ACTIVE_TEXT_CLASS : "text-[#103D23]"
            }`}
          >
            {/* Ícone genérico de menu/mais */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </nav>
    </>
  );
}
