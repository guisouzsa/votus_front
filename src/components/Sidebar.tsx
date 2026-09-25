"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NAV_ITEMS, ACTIVE_CLASS, getActiveRouteId } from "./navItems";
import { prefetchRoute } from "@/lib/prefetch";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("inicio");
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const activeRouteId = getActiveRouteId(pathname);
  const activeGroup = NAV_ITEMS.find((item) => item.children?.some((child) => child.id === activeRouteId))?.id;
  const currentExpandedGroup = userInteracted ? expandedGroupId : activeGroup;

  // Reseta a interação do usuário ao mudar de página para que o menu abra automaticamente
  // no grupo ativo, caso a pessoa navegue para outra área através de um link interno.
  useEffect(() => {
    setUserInteracted(false);
  }, [pathname]);

  const handleItemClick = (id: string, path?: string) => {
    setSelectedId(id);

    if (path) {
      router.push(path);
    }
  };

  const handleGroupClick = (itemId: string) => {
    setSelectedId(itemId);

    if (!open) {
      setOpen(true);
      setExpandedGroupId(itemId);
      setUserInteracted(true);
    } else {
      setExpandedGroupId((prev) => (prev === itemId ? null : itemId));
      const isCurrentlyExpanded = currentExpandedGroup === itemId;
      setExpandedGroupId(isCurrentlyExpanded ? null : itemId);
      setUserInteracted(true);
    }
  };

  return (
    <aside
      className={`fixed left-4 top-4 z-20 hidden flex-col justify-between overflow-hidden rounded-3xl shadow-lg transition-[width] duration-300 ease-in-out md:flex ${
        open ? "w-64" : "w-20"
      }`}
      style={{
        height: "calc(100vh - 2rem)",
        backgroundImage: `url(${
          open ? "/FundoBarraLateralAberto.svg" : "/FundoBarraLateralFechado.png"
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex h-full flex-col gap-6 px-3 pt-5">
        <div className={`flex items-center ${open ? "gap-3" : "justify-center"}`}>
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={false}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl transition-transform duration-200 hover:scale-105"
            >
              <img src="/Iconeprincipal.svg" alt="" className="h-9 w-9 object-contain" />
            </button>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center">
              <img src="/Iconeprincipal.svg" alt="" className="h-9 w-9 object-contain" />
            </div>
          )}

          {open && (
            <img
              src="/IconeVotus.svg"
              alt="Votus"
              className="h-8 w-auto min-w-0 shrink"
            />
          )}

          {open && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="ml-auto flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-[#8D0801] transition-all duration-300 hover:rotate-90 hover:bg-white/10"
            >
              <img src="/IconeMenu.svg" alt="" className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="h-px w-full bg-[#8D0801]" aria-hidden="true" />

        {/* Lista de Navegação com animação em todos os botões. flex-1 +
        overflow-y-auto: sem isso, itens no fim da lista (ex: Sugestões)
        ficavam cortados e inacessíveis em telas mais baixas assim que a
        lista cresceu o suficiente pra não caber inteira na altura fixa da
        sidebar — o container pai usa overflow-hidden só pelas bordas
        arredondadas, então sem rolagem própria aqui não tinha como alcançar
        o que passasse da altura. */}
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden pb-4 pr-1 scrollbar-hide">
          {NAV_ITEMS.map(({ id, label, icon, iconClass, path, children }) => {
            const isActive = activeRouteId
              ? activeRouteId === id
              : selectedId === id;

            if (children) {
              const isGroupActive = children.some((child) => child.id === activeRouteId);
              const showChildren = open && currentExpandedGroup === id;

              return (
                <div key={id} className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleGroupClick(id)}
                    aria-current={isGroupActive ? "page" : undefined}
                    aria-expanded={showChildren}
                    title={label}
                    className={`flex cursor-pointer items-center gap-3 rounded-[20px] px-3.5 py-3 text-left text-sm font-medium transition-all duration-200 ${
                      isGroupActive
                        ? `${ACTIVE_CLASS} scale-[1.02]`
                        : "text-[#103D23] hover:scale-[1.02] hover:bg-white/10"
                    } ${open ? "" : "justify-center px-0"}`}
                  >
                    <img src={icon} alt="" className={`${iconClass || "h-6 w-6"} shrink-0`} />
                    {open && <span className="truncate">{label}</span>}
                    {open && (
                      <span
                        aria-hidden="true"
                        className={`ml-auto text-xs transition-transform duration-200 ${
                          showChildren ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    )}
                  </button>

                  {showChildren && (
                    <div className="ml-9 flex flex-col gap-1">
                      {children.map((child) => {
                        const isChildActive = activeRouteId === child.id;

                        return (
                          <Link
                            key={child.id}
                            href={child.path}
                            aria-current={isChildActive ? "page" : undefined}
                            title={child.label}
                            onMouseEnter={() => prefetchRoute(child.path)}
                            onClick={() => setSelectedId(child.id)}
                            className={`truncate rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                              isChildActive
                                ? ACTIVE_CLASS
                                : "text-[#103D23] hover:bg-white/10"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return path ? (
                <Link
                  key={id}
                  href={path}
                  aria-current={isActive ? "page" : undefined}
                  title={label}
                  onMouseEnter={() => prefetchRoute(path)}
                  onClick={() => setSelectedId(id)}
                  className={`flex cursor-pointer items-center gap-3 rounded-[20px] px-3.5 py-3 text-left text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${ACTIVE_CLASS} scale-[1.02]`
                      : "text-[#103D23] hover:scale-[1.02] hover:bg-white/10"
                  } ${open ? "" : "justify-center px-0"}`}
                >
                  <img
                    src={icon}
                    alt=""
                    className={`${iconClass || "h-6 w-6"} shrink-0`}
                  />
                  {open && <span className="truncate">{label}</span>}
                </Link>
              ) : (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleItemClick(id)}
                  aria-current={isActive ? "page" : undefined}
                  title={label}
                  className={`flex cursor-pointer items-center gap-3 rounded-[20px] px-3.5 py-3 text-left text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `${ACTIVE_CLASS} scale-[1.02]`
                    : "text-[#103D23] hover:scale-[1.02] hover:bg-white/10"
                  } ${open ? "" : "justify-center px-0"}`}
                >
                  <img
                    src={icon}
                    alt=""
                    className={`${iconClass || "h-6 w-6"} shrink-0`}
                  />
                  {open && <span className="truncate">{label}</span>}
                </button>
              );
          })}
        </nav>
      </div>
    </aside>
  );
}