"use client";

import { useState } from "react";
import { UserRound, LayoutGrid, Search, ListTree, FolderClosed, Info, Settings } from "lucide-react";

const NAV_ITEMS = [
  { id: "perfil", label: "Perfil", icon: UserRound },
  { id: "dashboard", label: "Painel", icon: LayoutGrid },
  { id: "topicos", label: "Tópicos", icon: Search },
  { id: "categorias", label: "Categorias", icon: ListTree },
  { id: "salvos", label: "Salvos", icon: FolderClosed },
  { id: "sobre", label: "Sobre", icon: Info },
];

export default function Sidebar() {
  const [active, setActive] = useState("dashboard");

  return (
    <aside className="hidden md:flex md:w-20 shrink-0 flex-col items-center justify-between bg-cream-panel border-r border-line py-6">
      <nav className="flex flex-col items-center gap-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              title={label}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors cursor-pointer ${
                isActive ? "bg-brasil-green text-cream shadow-sm" : "text-ink-soft hover:bg-cream hover:text-brasil-green-deep"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
            </button>
          );
        })}
      </nav>

      <button type="button" aria-label="Configurações" title="Configurações"
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-ink-soft hover:bg-cream hover:text-brasil-green-deep transition-colors cursor-pointer">
        <Settings size={20} />
      </button>
    </aside>
  );
}