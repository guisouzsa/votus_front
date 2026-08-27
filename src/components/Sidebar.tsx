"use client";

import { useState } from "react";

const NAV_ITEMS = [
  { id: "senadores", label: "Senadores", icon: "/IconeSenadores.svg" },
  { id: "juventude", label: "Juventude em Pauta", icon: "/IconeJuventude.svg" },
  { id: "noticias", label: "Notícias", icon: "/IconeNoticias.png" },
  { id: "explicacoes", label: "Explicações", icon: "/IconeExplicacoes.svg" },
  { id: "sobre", label: "Sobre Nós", icon: "/IconeSobreNos.png" },
];

const ACTIVE_CLASS = "bg-[#EDDBBA]/50 text-[#1B623A] shadow-sm";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState("principal");

  return (
    <aside
      className={`fixed left-4 top-4 z-20 flex flex-col justify-between overflow-hidden rounded-3xl shadow-lg transition-[width] duration-300 ease-in-out ${open ? "w-64" : "w-20"}`}
      style={{
        height: "calc(100vh - 2rem)",
        backgroundImage: `url(${open ? "/FundoBarraLateralAberto.svg" : "/FundoBarraLateralFechado.png"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col gap-6 px-3 pt-5">
        <div className={`flex items-center ${open ? "gap-3" : "justify-center"}`}>
          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={false}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl cursor-pointer"
            >
              <img src="/Iconeprincipal.svg" alt="" className="h-9 w-9" />
            </button>
          )}

          {open && (
            <button
              type="button"
              onClick={() => setActive("principal")}
              aria-current={active === "principal" ? "page" : undefined}
              aria-label="Principal"
              title="Principal"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl cursor-pointer ${active === "principal" ? ACTIVE_CLASS : "hover:bg-white/10"}`}
            >
              <img src="/Iconeprincipal.svg" alt="" className="h-9 w-9" />
            </button>
          )}

          {open && <img src="/IconeVotus.svg" alt="Votus" className="h-8 w-auto min-w-0 shrink" />}

          {open && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              aria-expanded={true}
              className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[#8D0801] transition-all duration-300 hover:rotate-90 hover:bg-white/10 cursor-pointer"
            >
              <img src="/IconeMenu.svg" alt="" className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="h-px w-full bg-[#8D0801]" aria-hidden="true" />

        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                aria-current={isActive ? "page" : undefined}
                title={label}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${isActive ? ACTIVE_CLASS : "text-[#103D23] hover:bg-white/10"} ${open ? "" : "justify-center px-0"}`}
              >
                <img src={icon} alt="" className="h-6 w-6 shrink-0" />
                {open && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`pb-5 ${open ? "px-3" : "px-0"}`}>
        <button
          type="button"
          onClick={() => setActive("configuracoes")}
          aria-current={active === "configuracoes" ? "page" : undefined}
          aria-label="Configurações"
          title="Configurações"
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${active === "configuracoes" ? ACTIVE_CLASS : "text-[#103D23] hover:bg-white/10"} ${open ? "" : "justify-center px-0"}`}
        >
          <img src="/IconeConfig.png" alt="" className="h-6 w-6 shrink-0" />
          {open && <span className="truncate">Configurações</span>}
        </button>
      </div>
    </aside>
  );
}
