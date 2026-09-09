'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Bill } from '@/services/types';

const BREAKPOINTS = [
  { query: '(min-width: 1024px)', count: 3 },
  { query: '(min-width: 640px)', count: 2 },
];

function useVisibleCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const mediaQueries = BREAKPOINTS.map(({ query, count: value }) => ({
      mql: window.matchMedia(query),
      count: value,
    }));

    const update = () => {
      const match = mediaQueries.find(({ mql }) => mql.matches);
      setCount(match ? match.count : 1);
    };

    update();
    mediaQueries.forEach(({ mql }) => mql.addEventListener('change', update));
    return () => mediaQueries.forEach(({ mql }) => mql.removeEventListener('change', update));
  }, []);

  return count;
}

export default function LegislativeTimeline({ bills }: { bills: Bill[] }) {
  const visibleCount = useVisibleCount();
  const [index, setIndex] = useState(0);

  const items = [...bills]
    .filter((bill) => bill.presented_at)
    .sort((a, b) => new Date(a.presented_at as string).getTime() - new Date(b.presented_at as string).getTime());

  if (items.length === 0) {
    return <p>Sem eventos recentes.</p>;
  }

  const maxIndex = Math.max(0, items.length - visibleCount);
  const clampedIndex = Math.min(index, maxIndex);
  const visibleItems = items.slice(clampedIndex, clampedIndex + visibleCount);
  const isStart = clampedIndex <= 0;
  const isEnd = clampedIndex >= maxIndex;

  return (
    <div className="flex h-full min-h-[260px] flex-col gap-3">
      {maxIndex > 0 && (
        <p className="text-center text-xs font-semibold text-white/80 sm:text-sm">
          ↔ Role com os botões para ver o restante da linha do tempo
        </p>
      )}

      <div className="flex flex-1 items-stretch gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Ver eventos anteriores"
          disabled={isStart}
          onClick={() => setIndex(Math.max(0, clampedIndex - 1))}
          className="flex shrink-0 items-center justify-center bg-transparent p-1 text-[#8d0801] transition-transform hover:scale-125 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-9 w-9 sm:h-12 sm:w-12" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        </button>

        <div
          className="grid flex-1 gap-3 sm:gap-4"
          style={{ gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: visibleCount }).map((_, slot) => {
            const bill = visibleItems[slot];
            if (!bill) {
              return <div key={`empty-${slot}`} aria-hidden="true" />;
            }

            return (
              <article
                key={bill.id}
                className="flex h-full flex-col justify-between rounded-[10px] bg-[#8d0801] p-4 text-white shadow-sm sm:p-5"
              >
                <div>
                  <p className="text-3xl font-black leading-none sm:text-4xl">
                    {bill.presented_at ? new Date(bill.presented_at).getFullYear() : '—'}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide opacity-90 sm:text-sm">
                    {bill.type}
                  </p>
                </div>
                <p className="mt-3 line-clamp-5 text-xs leading-snug sm:text-sm">{bill.summary}</p>
                {bill.status_situacao && (
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide opacity-80 sm:text-xs">
                    {bill.status_situacao}
                  </p>
                )}
              </article>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Ver próximos eventos"
          disabled={isEnd}
          onClick={() => setIndex(Math.min(maxIndex, clampedIndex + 1))}
          className="flex shrink-0 items-center justify-center bg-transparent p-1 text-[#8d0801] transition-transform hover:scale-125 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-9 w-9 sm:h-12 sm:w-12" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        </button>
      </div>

      {maxIndex > 0 && (
        <p className="text-center text-xs font-bold text-white/90 sm:text-sm" aria-live="polite">
          {isStart && '⏮ Início da linha do tempo'}
          {isEnd && !isStart && '⏭ Fim da linha do tempo — não há mais eventos'}
          {!isStart && !isEnd && `Mostrando ${clampedIndex + 1}–${clampedIndex + visibleItems.length} de ${items.length}`}
        </p>
      )}
    </div>
  );
}
