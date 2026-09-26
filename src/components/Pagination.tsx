'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  lastPage,
  onChange,
}: {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        aria-label="Página anterior"
        className="flex h-10 items-center gap-1.5 rounded-full border border-[#d6d1c8] bg-white px-4 text-sm font-bold text-[#8d0801] transition-colors hover:bg-[#8d0801]/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <span className="whitespace-nowrap rounded-full bg-[#f7f5f2] px-4 py-2 text-xs font-bold uppercase text-[#8d0801]">
        {page} / {lastPage}
      </span>

      <button
        type="button"
        disabled={page >= lastPage}
        onClick={() => onChange(Math.min(lastPage, page + 1))}
        aria-label="Próxima página"
        className="flex h-10 items-center gap-1.5 rounded-full bg-[#8d0801] px-4 text-sm font-bold text-white transition-colors hover:bg-[#6d0601] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#8d0801]"
      >
        <span className="hidden sm:inline">Próxima</span>
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </nav>
  );
}
