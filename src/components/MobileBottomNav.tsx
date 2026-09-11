"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, ACTIVE_CLASS, getActiveRouteId } from "./navItems";
import { prefetchRoute } from "@/lib/prefetch";

export default function MobileBottomNav() {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const pathname = usePathname();
  const activeRouteId = getActiveRouteId(pathname);

  const closePopover = () => setExpandedGroupId(null);

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
        aria-label="Navegação principal"
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-0.5 rounded-full border border-[#8D0801]/15 bg-[#FDF8EE] px-2 py-2 shadow-lg md:hidden"
      >
        {/* Primeiros 4 itens (Início, Notícias, Cargos, Juventude) */}
        {NAV_ITEMS.slice(0, 4).map(({ id, label, icon, iconClass, path, children }) => {
          const isActive = activeRouteId === id;
          const isGroupActive = children?.some((child) => child.id === activeRouteId) ?? false;

          if (children) {
            const isOpen = expandedGroupId === id;

            return (
              <div key={id} className="relative flex flex-1 justify-center">
                {isOpen && (
                  <div className="absolute bottom-[calc(100%+0.75rem)] left-1/2 z-40 flex -translate-x-1/2 flex-col gap-1 whitespace-nowrap rounded-2xl border border-[#8D0801]/15 bg-[#FDF8EE] p-2 shadow-lg">
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
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    isGroupActive || isOpen ? ACTIVE_CLASS : "text-[#103D23]"
                  }`}
                >
                  <img src={icon} alt="" className={`${iconClass || "h-6 w-6"} shrink-0`} />
                </button>
              </div>
            );
          }

          return (
            <div key={id} className="flex flex-1 justify-center">
              <Link
                href={path!}
                onTouchStart={() => prefetchRoute(path!)}
                onClick={closePopover}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                title={label}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  isActive ? ACTIVE_CLASS : "text-[#103D23]"
                }`}
              >
                <img src={icon} alt="" className={`${iconClass || "h-6 w-6"} shrink-0`} />
              </Link>
            </div>
          );
        })}

        {/* Botão 'Mais' agrupando Propostas, Santinho, Explicações, Sobre Nós */}
        <div className="relative flex flex-1 justify-center">
          {expandedGroupId === "mais" && (
            <div className="absolute bottom-[calc(100%+0.75rem)] right-0 z-40 flex flex-col gap-1 whitespace-nowrap rounded-2xl border border-[#8D0801]/15 bg-[#FDF8EE] p-2 shadow-lg">
              {NAV_ITEMS.slice(4).map((child) => (
                child.path ? (
                  <Link
                    key={child.id}
                    href={child.path}
                    onTouchStart={() => prefetchRoute(child.path)}
                    onClick={closePopover}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2 text-left text-sm font-medium transition-colors ${
                      activeRouteId === child.id ? ACTIVE_CLASS : "text-[#103D23] hover:bg-black/5"
                    }`}
                  >
                    <img src={child.icon} alt="" className="h-5 w-5 opacity-70" />
                    {child.label}
                  </Link>
                ) : (
                  <button
                    key={child.id}
                    type="button"
                    onClick={closePopover}
                    className="flex items-center gap-3 rounded-xl px-4 py-2 text-left text-sm font-medium text-[#103D23] transition-colors hover:bg-black/5"
                  >
                    <img src={child.icon} alt="" className="h-5 w-5 opacity-70" />
                    {child.label}
                  </button>
                )
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setExpandedGroupId((prev) => (prev === "mais" ? null : "mais"))}
            aria-expanded={expandedGroupId === "mais"}
            aria-label="Mais opções"
            title="Mais opções"
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              expandedGroupId === "mais" ? ACTIVE_CLASS : "text-[#103D23]"
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
