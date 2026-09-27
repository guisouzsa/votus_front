"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";

export default function SearchBar({
  searchValue,
  onSearchChange,
  categories,
  selectedCategories,
  onToggleCategory,
  placeholder = "Buscar notícias...",
  borderColor = "#EDDBBA",
  bgColor = "#FDF8EE",
  accentColor = "#1B623A",
  badgeColor = "#EDDBBA",
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  placeholder?: string;
  borderColor?: string;
  bgColor?: string;
  accentColor?: string;
  badgeColor?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mt-6 flex items-center gap-3">
      <label className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: accentColor }}
        />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          style={{ borderColor, backgroundColor: bgColor, color: accentColor }}
          className="h-10 w-full rounded-full border pl-11 pr-4 text-sm outline-none focus:ring-2"
        />
      </label>

      {categories.length > 0 && (
        // w-10 no mobile (só cabe o círculo do ícone) e md:w-72 restaurando
        // exatamente a largura original do desktop — a versão anterior desta
        // correção tinha deixado o botão em md:w-auto, encolhendo a pílula
        // do desktop/web sem querer.
        <div className="relative w-10 shrink-0 md:w-72 md:max-w-[90vw]">
          {/* Mobile: só o ícone, num botão circular — sem texto nem badge
              separado (padrão usado em todos os filtros do Votus quando não
              há espaço pro rótulo). A partir de md, volta a ser a pílula
              com rótulo de sempre (mesmo tamanho/padding de antes). */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={selectedCategories.length > 0 ? `Filtros (${selectedCategories.length} selecionados)` : "Filtros"}
            style={{ borderColor, backgroundColor: bgColor, color: accentColor }}
            className="relative flex h-10 w-full items-center justify-center rounded-full border cursor-pointer md:justify-between md:gap-2 md:py-1.5 md:pl-5 md:pr-1.5"
          >
            <span className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal size={16} className="shrink-0" />
              <span className="hidden truncate text-sm font-medium md:inline">
                {selectedCategories.length > 0 ? `Filtros (${selectedCategories.length})` : "Filtros"}
              </span>
            </span>

            {selectedCategories.length > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white md:hidden"
                style={{ backgroundColor: accentColor }}
              >
                {selectedCategories.length}
              </span>
            )}

            <span
              className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full md:flex"
              style={{ backgroundColor: badgeColor }}
            >
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                style={{ color: badgeColor === accentColor ? "#fff" : accentColor }}
              />
            </span>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-72 max-w-[90vw] rounded-2xl border border-black/5 bg-white p-2 shadow-md">
                {categories.map((categoria, i) => {
                  const ativo = selectedCategories.includes(categoria);
                  return (
                    <button
                      key={categoria}
                      type="button"
                      onClick={() => onToggleCategory(categoria)}
                      className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-[#1B623A] cursor-pointer ${
                        i !== categories.length - 1 ? "border-b border-line" : ""
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
      )}
    </div>
  );
}
