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
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mt-6 flex items-center gap-3">
      <label className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1B623A]"
        />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-full border border-[#EDDBBA] bg-[#FDF8EE] pl-11 pr-4 text-sm text-[#1B623A] placeholder:text-[#1B623A] outline-none focus:border-[#1B623A] focus:ring-2 focus:ring-[#1B623A]/20"
        />
      </label>

      {categories.length > 0 && (
        <div className="relative w-24 shrink-0 md:w-72 md:max-w-[90vw]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-full items-center justify-between gap-1 rounded-full border border-[#EDDBBA] bg-[#FDF8EE] py-1.5 pl-3 pr-1.5 text-sm font-medium text-[#1B623A] cursor-pointer md:gap-2 md:pl-5"
          >
            <span className="flex min-w-0 items-center gap-1.5 md:gap-2">
              <SlidersHorizontal size={16} className="shrink-0" />
              <span className="hidden truncate md:inline">
                {selectedCategories.length > 0 ? `Filtros (${selectedCategories.length})` : "Filtros"}
              </span>
            </span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EDDBBA]">
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
