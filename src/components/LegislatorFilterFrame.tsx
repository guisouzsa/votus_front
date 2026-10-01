'use client';

import { ChevronDown, Search } from 'lucide-react';

interface LegislatorFilterFrameProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  // Opcional: candidatos não têm "situação do mandato" (o campo de situação
  // da candidatura vem vazio no CSV do TSE), então lá o filtro não aparece
  // em vez de exibir opções sem dado real por trás.
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  partyValue: string;
  onPartyChange: (value: string) => void;
  partyOptions: string[];
  onApply: () => void;
  onClear: () => void;
  searchPlaceholder?: string;
  // Desabilita os botões enquanto a busca filtrada está carregando, pra não
  // disparar a mesma requisição várias vezes com cliques repetidos.
  busy?: boolean;
}

// Mesma linguagem visual da busca de Notícias (SearchBar: pílulas
// arredondadas, ícone à esquerda, sem card/fundo decorativo) — adaptada pros
// filtros de cargo/candidato, que são de confirmação (Aplicar/Limpar) em vez
// de instantâneos, e por isso mantêm os botões explícitos.
export default function LegislatorFilterFrame({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions,
  partyValue,
  onPartyChange,
  partyOptions,
  onApply,
  onClear,
  searchPlaceholder = 'Pesquisar por nome ou partido...',
  busy = false,
}: LegislatorFilterFrameProps) {
  const activeCount = [searchValue.trim(), statusValue, partyValue].filter(Boolean).length;

  return (
    <div className="mt-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <label className="relative w-full md:min-w-[220px] md:flex-1">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1B623A]" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !busy) onApply();
          }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-10 w-full rounded-full border border-[#EDDBBA] bg-[#FDF8EE] pl-11 pr-4 text-sm text-[#1B623A] outline-none placeholder:text-[#1B623A]/70 focus:ring-2 focus:ring-[#1B623A]/20"
        />
      </label>

      {statusOptions && onStatusChange && (
        <label className="relative block w-full md:w-[180px]">
          <span className="sr-only">Situação do mandato</span>
          <select
            value={statusValue ?? ''}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-10 w-full appearance-none rounded-full border border-[#EDDBBA] bg-[#FDF8EE] pl-4 pr-9 text-sm font-medium text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1B623A]" />
        </label>
      )}

      <label className="relative block w-full md:w-[180px]">
        <span className="sr-only">Partido</span>
        <select
          value={partyValue}
          onChange={(event) => onPartyChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-full border border-[#EDDBBA] bg-[#FDF8EE] pl-4 pr-9 text-sm font-medium text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20"
        >
          <option value="">Todos</option>
          {partyOptions.map((party) => (
            <option key={party} value={party}>
              {party}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1B623A]" />
      </label>

      <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3 md:ml-auto">
        {activeCount > 0 && (
          <span className="text-xs font-semibold text-[#1B623A] md:mr-1">Filtros ({activeCount})</span>
        )}
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          className="h-10 w-full rounded-full border border-[#EDDBBA] px-5 text-sm font-semibold text-[#1B623A] disabled:opacity-50 md:w-auto"
        >
          Limpar filtros
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={busy}
          className="h-10 w-full rounded-full bg-[#1B623A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#103D23] disabled:opacity-60 md:w-auto"
        >
          {busy ? 'Filtrando...' : 'Aplicar filtros'}
        </button>
      </div>
    </div>
  );
}
