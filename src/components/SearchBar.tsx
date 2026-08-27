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
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1B623A]"
        />
        <input
          type="search"
          placeholder="Buscar notícias..."
          className="h-10 w-full rounded-full border border-[#EDDBBA] bg-[#FDF8EE] pl-11 pr-4 text-sm text-[#1B623A] placeholder:text-[#1B623A] outline-none focus:border-[#1B623A] focus:ring-2 focus:ring-[#1B623A]/20"
        />
      </label>

      <div className="relative w-72 max-w-[90vw] shrink-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-full items-center justify-between rounded-full border border-[#EDDBBA] bg-[#FDF8EE] py-1.5 pl-5 pr-1.5 text-sm font-medium text-[#1B623A] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} />
            Filtros
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EDDBBA]">
            <ChevronDown
              size={14}
              className={`text-[#1B623A] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-72 max-w-[90vw] rounded-2xl border border-black/5 bg-white p-2 shadow-md">
              {CATEGORIAS.map((categoria, i) => {
                const ativo = selecionadas.includes(categoria);
                return (
                  <button
                    key={categoria}
                    type="button"
                    onClick={() => toggleCategoria(categoria)}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-[#1B623A] cursor-pointer ${
                      i !== CATEGORIAS.length - 1 ? "border-b border-line" : ""
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        ativo ? "border-2 border-[#1B623A] bg-[#1B623A]" : "border border-[#1B623A] bg-white"
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