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
    <nav aria-label="Paginação" className="flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        aria-label="Página anterior"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#8d0801] transition-colors hover:bg-[#8d0801]/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronLeft size={22} strokeWidth={2.5} />
      </button>

      <span className="whitespace-nowrap rounded-full bg-[#f7f5f2] px-4 py-1.5 text-xs font-bold uppercase text-[#8d0801]">
        {page} / {lastPage}
      </span>

      <button
        type="button"
        disabled={page >= lastPage}
        onClick={() => onChange(Math.min(lastPage, page + 1))}
        aria-label="Próxima página"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#8d0801] transition-colors hover:bg-[#8d0801]/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight size={22} strokeWidth={2.5} />
      </button>
    </nav>
  );
}
