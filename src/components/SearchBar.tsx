"use client";

import { useState, type ReactNode } from "react";
import { Search, SlidersHorizontal, ChevronDown, Check, RotateCcw } from "lucide-react";

/**
 * Barra de busca padrão do Votus: pílula com lupa + botão "Filtros" (só o
 * ícone no celular, pílula com rótulo a partir de md). O painel de filtros é
 * a lista de categorias (multisseleção) ou, com `filterPanel`, um conteúdo
 * próprio da página (selects, botões Aplicar/Limpar etc.).
 */
export default function SearchBar({
  searchValue,
  onSearchChange,
  categories = [],
  selectedCategories = [],
  onToggleCategory,
  filterPanel,
  activeFilterCount,
  onSubmit,
  placeholder = "Buscar notícias...",
  searchLabel,
  className = "mt-6",
  borderColor = "#EDDBBA",
  bgColor = "#FDF8EE",
  accentColor = "#1B623A",
  badgeColor = "#EDDBBA",
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories?: string[];
  selectedCategories?: string[];
  onToggleCategory?: (category: string) => void;
  /** Conteúdo do painel de filtros; recebe `close` para fechá-lo (ex.: ao aplicar). */
  filterPanel?: (close: () => void) => ReactNode;
  /** Quantos filtros estão ativos (padrão: categorias selecionadas). */
  activeFilterCount?: number;
  /** Enter no campo de busca. */
  onSubmit?: () => void;
  placeholder?: string;
  searchLabel?: string;
  className?: string;
  borderColor?: string;
  bgColor?: string;
  accentColor?: string;
  badgeColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const count = activeFilterCount ?? selectedCategories.length;
  const hasFilters = Boolean(filterPanel) || categories.length > 0;

  return (
    <div className={`relative flex items-center gap-3 ${className}`}>
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{searchLabel ?? placeholder}</span>
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: accentColor }}
        />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && onSubmit) onSubmit();
          }}
          placeholder={placeholder}
          enterKeyHint={onSubmit ? "search" : undefined}
          style={{ borderColor, backgroundColor: bgColor, color: accentColor }}
          className="h-10 w-full rounded-full border pl-11 pr-4 text-sm outline-none placeholder:opacity-70 focus:ring-2"
        />
      </label>

      {hasFilters && (
        // w-10 no mobile (só cabe o círculo do ícone) e md:w-72 no desktop.
        <div className="relative w-10 shrink-0 md:w-72 md:max-w-[90vw]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={count > 0 ? `Filtros (${count} ativos)` : "Filtros"}
            style={{ borderColor, backgroundColor: bgColor, color: accentColor }}
            className="relative flex h-10 w-full items-center justify-center rounded-full border cursor-pointer md:justify-between md:gap-2 md:py-1.5 md:pl-5 md:pr-1.5"
          >
            <span className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal size={16} className="shrink-0" />
              <span className="hidden truncate text-sm font-medium md:inline">
                {count > 0 ? `Filtros (${count})` : "Filtros"}
              </span>
            </span>

            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white md:hidden"
                style={{ backgroundColor: accentColor }}
              >
                {count}
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
              <div className="absolute right-0 z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-black/5 bg-white p-2 shadow-md">
                {filterPanel
                  ? filterPanel(() => setOpen(false))
                  : categories.map((categoria, i) => {
                      const ativo = selectedCategories.includes(categoria);
                      return (
                        <button
                          key={categoria}
                          type="button"
                          onClick={() => onToggleCategory?.(categoria)}
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

/** Select rotulado para usar dentro do `filterPanel` da SearchBar. */
export function FilterSelect({
  label,
  value,
  onChange,
  children,
  className = "block px-2 py-2",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  /** Padding do painel por padrão; em grade na página, só "block". */
  className?: string;
}) {
  return (
    <label className={`${className} min-w-0 text-[11px] font-bold uppercase tracking-wide text-[#1B623A]`}>
      {label}
      <span className="relative mt-1 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-full border border-[#EDDBBA] bg-[#FDF8EE] pl-4 pr-9 text-sm font-medium normal-case tracking-normal text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20"
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1B623A]"
        />
      </span>
    </label>
  );
}

/**
 * "Limpar filtros" fora do painel (resumo de resultados, estado vazio): a
 * mesma pílula verde da ação principal do painel, para o usuário reconhecer
 * o botão em qualquer tela.
 */
export function ClearFiltersButton({ onClick, label = "Limpar filtros" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#1B623A] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#103D23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A] sm:text-sm"
    >
      <RotateCcw size={14} aria-hidden="true" />
      {label}
    </button>
  );
}

/** Rodapé do painel: Limpar + ação principal (Aplicar). */
export function FilterPanelActions({
  onClear,
  onApply,
  applyLabel = "Aplicar filtros",
  busy = false,
}: {
  onClear: () => void;
  onApply?: () => void;
  applyLabel?: string;
  busy?: boolean;
}) {
  return (
    <div className="mt-1 flex gap-2 border-t border-line px-2 pb-1 pt-3">
      <button
        type="button"
        onClick={onClear}
        disabled={busy}
        className="h-10 flex-1 rounded-full border border-[#EDDBBA] px-4 text-sm font-semibold text-[#1B623A] disabled:opacity-50"
      >
        Limpar
      </button>
      {onApply && (
        <button
          type="button"
          onClick={onApply}
          disabled={busy}
          className="h-10 flex-1 rounded-full bg-[#1B623A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#103D23] disabled:opacity-60"
        >
          {busy ? "Filtrando..." : applyLabel}
        </button>
      )}
    </div>
  );
}
