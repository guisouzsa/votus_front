"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type NavChild = { id: string; label: string; path: string };

type NavItem = {
  id: string;
  label: string;
  icon: string;
  iconClass?: string;
  path?: string;
  children?: NavChild[];
};

const NAV_ITEMS: NavItem[] = [
  { id: "inicio", label: "Início", icon: "/IconeInicial.svg", path: "/Inicial" },
  { id: "noticias", label: "Notícias", icon: "/IconeNoticias.png", path: "/Painelnoticias" },
  {
    id: "cargos",
    label: "Cargos",
    icon: "/Iconesenadores.svg",
    children: [
      { id: "senadores", label: "Senadores", path: "/SenadoresPage" },
      { id: "deputados", label: "Deputados", path: "/DeputadosPage" },
    ],
  },
  {
    id: "juventude",
    label: "Juventude",
    icon: "/IconeJuventude.svg",
    iconClass: "h-9 w-9",
    children: [
      { id: "juventude-pauta", label: "Juventude em Pauta", path: "/Juventude" },
      { id: "universidades", label: "Universidades", path: "/Universidades" },
    ],
  },
  { id: "explicacoes", label: "Explicações", icon: "/IconeExplicacoes.svg" },
  { id: "sobre", label: "Sobre Nós", icon: "/IconeSobreNos.png" },
];

const DETAIL_ROUTE_PREFIXES: { prefix: string; id: string }[] = [
  { prefix: "/ShowDeputadosPage", id: "deputados" },
  { prefix: "/ShowSenadoresPage", id: "senadores" },
  { prefix: "/noticias/", id: "noticias" },
];

const ACTIVE_CLASS = "bg-[#EDDBBA]/50 text-[#1B623A] shadow-sm";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("inicio");
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const flatRoutes: NavChild[] = NAV_ITEMS.flatMap((item) =>
    item.children ? item.children : item.path ? [{ id: item.id, label: item.label, path: item.path }] : []
  );
  const activeRouteId =
    flatRoutes.find(
      ({ path }) => path && (pathname === path || (path === "/Inicial" && pathname === "/"))
    )?.id ?? DETAIL_ROUTE_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix))?.id;

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
    } else {
      setExpandedGroupId((prev) => (prev === itemId ? null : itemId));
    }
  };

  return (
    <aside
      className={`fixed left-4 top-4 z-20 flex flex-col justify-between overflow-hidden rounded-3xl shadow-lg transition-[width] duration-300 ease-in-out ${
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
      <div className="flex flex-col gap-6 px-3 pt-5">
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

        {/* Lista de Navegação com animação em todos os botões */}
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ id, label, icon, iconClass, path, children }) => {
            const isActive = activeRouteId
              ? activeRouteId === id
              : selectedId === id;

            if (children) {
              const isGroupActive = children.some((child) => child.id === activeRouteId);
              const showChildren = open && (expandedGroupId === id || isGroupActive);

              return (
                <div key={id} className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleGroupClick(id)}
                    aria-current={isGroupActive ? "page" : undefined}
                    aria-expanded={showChildren}
                    title={label}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
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
                            onClick={() => setSelectedId(child.id)}
                            className={`truncate rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${
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
                  onClick={() => setSelectedId(id)}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
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
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
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

      {/* Botão de Configurações */}
      <div className={`pb-5 ${open ? "px-3" : "px-0"}`}>
        <button
          type="button"
          onClick={() => handleItemClick("configuracoes")}
          aria-current={!activeRouteId && selectedId === "configuracoes" ? "page" : undefined}
          aria-label="Configurações"
          title="Configurações"
          className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            !activeRouteId && selectedId === "configuracoes"
              ? `${ACTIVE_CLASS} scale-[1.02]`
              : "text-[#103D23] hover:scale-[1.02] hover:bg-white/10"
          } ${open ? "" : "justify-center px-0"}`}
        >
          <img src="/IconeConfig.svg" alt="" className="h-6 w-6 shrink-0" />
          {open && <span className="truncate">Configurações</span>}
        </button>
      </div>
    </aside>
  );
}