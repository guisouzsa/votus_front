"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";

const CATEGORIAS = [
  "Educação",
  "Saúde",
  "Direitos trabalhistas",
  "Economia",
  "Segurança pública",
  "Meio ambiente",
  "Infraestrutura e transporte",
  "Políticas urbanas",
  "Cultura",
  "Ciência, tecnologia e inovação",
];

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);

  function toggleCategoria(categoria: string) {
    setSelecionadas((prev) =>
      prev.includes(categoria) ? prev.filter((c) => c !== categoria) : [...prev, categoria]
    );
  }

  return (
    <div className="relative mt-6 flex items-center gap-3">
      <label className="relative flex-1">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest" />
        <input
          type="search"
          placeholder="Buscar notícias..."
          className="w-full rounded-full border border-line bg-sand py-3.5 pl-11 pr-4 text-sm text-forest placeholder:text-forest/60 outline-none focus:ring-2 focus:ring-forest/20"
        />
      </label>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-[150px] items-center justify-between gap-4 rounded-full border border-line bg-sand px-6 py-3.5 text-sm font-medium text-forest cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={18} />
            Filtros
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-72 max-w-[90vw] rounded-2xl border border-line bg-white p-2 shadow-lg">
              {CATEGORIAS.map((categoria, i) => {
                const ativo = selecionadas.includes(categoria);
                return (
                  <button
                    key={categoria}
                    type="button"
                    onClick={() => toggleCategoria(categoria)}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-ink cursor-pointer ${
                      i !== CATEGORIAS.length - 1 ? "border-b border-line" : ""
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                        ativo ? "border-forest bg-forest" : "border-line bg-white"
                      }`}
                    >
                      {ativo && <Check size={13} className="text-white" strokeWidth={3} />}
                    </span>
                    {categoria}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}