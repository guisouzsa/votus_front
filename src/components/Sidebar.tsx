"use client";

import { useState } from "react";

const NAV_ITEMS = [
  { id: "senadores", label: "Senadores", icon: "/IconeSenadores.svg" },
  { id: "juventude", label: "Juventude em Pauta", icon: "/IconeJuventude.svg" },
  { id: "noticias", label: "Notícias", icon: "/IconeNoticias.svg" },
  { id: "explicacoes", label: "Explicações", icon: "/IconeExplicacoes.svg" },
  { id: "sobre", label: "Sobre Nós", icon: "/IconeSobreNos.svg" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("principal");

  return (
    <aside
      className={`fixed left-4 top-4 z-40 hidden md:flex flex-col justify-between overflow-hidden rounded-3xl shadow-lg transition-[width] duration-300 ease-in-out ${
        open ? "w-64" : "w-20"
      }`}
      style={{
        height: "calc(100vh - 2rem)",
        backgroundImage: `url(${
          open ? "/FundoBarraLateralAberto.png" : "/FundoBarraLateralFechado.png"
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col gap-6 px-3 pt-5">
        {/* Hamburguer: abre/fecha a barra */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors hover:bg-white/10 cursor-pointer"
        >
          <img src="/IconeMenu.svg" alt="" className="h-6 w-6" />
        </button>

        {/* IconePrincipal (primeiro item) + IconeVotus (só quando aberto) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActive("principal")}
            aria-current={active === "principal" ? "page" : undefined}
            aria-label="Principal"
            title="Principal"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors cursor-pointer ${
              active === "principal"
                ? "bg-brasil-green/90 shadow-sm"
                : "hover:bg-white/10"
            }`}
          >
            <img src="/IconePrincipal.svg" alt="" className="h-6 w-6" />
          </button>

          {open && (
            <img
              src="/IconeVotus.svg"
              alt="Votus"
              className="h-5 w-auto shrink-0"
            />
          )}
        </div>

        {/* Demais itens de navegação: Senadores, Juventude, Notícias, Explicações, Sobre Nós */}
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
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-brasil-green/90 text-cream shadow-sm"
                    : "text-ink-soft hover:bg-white/10"
                }`}
              >
                <img src={icon} alt="" className="h-6 w-6 shrink-0" />
                {open && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* IconeConfig: separado, embaixo */}
      <div className="px-3 pb-5">
        <button
          type="button"
          aria-label="Configurações"
          title="Configurações"
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-white/10 cursor-pointer"
        >
          <img src="/IconeConfig.svg" alt="" className="h-6 w-6 shrink-0" />
          {open && <span className="truncate">Configurações</span>}
        </button>
      </div>
    </aside>
  );
}