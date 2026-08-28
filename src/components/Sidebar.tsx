"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "inicio", label: "Início", icon: "/IconeInicial.svg", path: "/Inicial" },
  { id: "noticias", label: "Notícias", icon: "/IconeNoticias.png", path: "/Painelnoticias" },
  { id: "senadores", label: "Senadores", icon: "/IconeSenadores.svg" },
  { id: "deputados", label: "Deputados", icon: "/IconeSenadores.svg" },
  { id: "juventude", label: "Juventude em Pauta", icon: "/IconeJuventude.svg", iconClass: "h-9 w-9" },
  { id: "explicacoes", label: "Explicações", icon: "/IconeExplicacoes.svg" },
  { id: "sobre", label: "Sobre Nós", icon: "/IconeSobreNos.png" },
];

const ACTIVE_CLASS = "bg-[#EDDBBA]/50 text-[#1B623A] shadow-sm";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("inicio");
  const router = useRouter();
  const pathname = usePathname();

  const handleItemClick = (id: string, path?: string) => {
    // Mantém a animação/seleção visual em todos os botões
    setSelectedId(id);

    // Só redireciona se a rota existir (Início e Notícias), sem abrir o menu
    if (path) {
      router.push(path);
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
        {/* Topo do Sidebar */}
        <div className={`flex items-center ${open ? "gap-3" : "justify-center flex-col gap-2"}`}>
          {/* Iconeprincipal.svg SEMPRE visível no topo */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            <img
              src="/Iconeprincipal.svg"
              alt=""
              className="h-9 w-9 object-contain"
            />
          </div>

          {open && (
            <img
              src="/IconeVotus.svg"
              alt="Votus"
              className="h-8 w-auto min-w-0 shrink"
            />
          )}

          {/* Botão de PontosAmarelo.svg que É O ÚNICO QUE ABRE O MENU quando fechado */}
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              title="Abrir menu"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl hover:bg-white/10"
            >
              <img
                src="/PontosAmarelo.svg"
                alt="Abrir menu"
                className="h-8 w-8 object-contain"
              />
            </button>
          ) : (
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
          {NAV_ITEMS.map(({ id, label, icon, iconClass, path }) => {
            const isActive =
              selectedId === id ||
              (path && pathname === path) ||
              (path === "/Inicial" && pathname === "/");

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleItemClick(id, path)}
                aria-current={isActive ? "page" : undefined}
                title={label}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? ACTIVE_CLASS
                    : "text-[#103D23] hover:bg-white/10"
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
          aria-current={selectedId === "configuracoes" ? "page" : undefined}
          aria-label="Configurações"
          title="Configurações"
          className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            selectedId === "configuracoes"
              ? ACTIVE_CLASS
              : "text-[#103D23] hover:bg-white/10"
          } ${open ? "" : "justify-center px-0"}`}
        >
          <img src="/IconeConfig.svg" alt="" className="h-6 w-6 shrink-0" />
          {open && <span className="truncate">Configurações</span>}
        </button>
      </div>
    </aside>
  );
}