'use client';

import { useState } from 'react';
import type { PoliticalPosition } from '@/data/politicalPositions';
import { ACTIONS_BY_BRANCH } from '@/data/politicalPositions';

const PODER_DOT = {
  executivo: 'bg-brasil-orange',
  legislativo: 'bg-brasil-green',
} as const;

export default function OfficeActions({ cargo }: { cargo: PoliticalPosition }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const acoes = ACTIONS_BY_BRANCH[cargo.branch];
  const dotColor = PODER_DOT[cargo.branch];

  return (
    <section key={cargo.id} aria-labelledby="acoes-cargo-titulo" className="animate-[votus-chat-in_0.35s_ease-out_both]">
      <h3 id="acoes-cargo-titulo" className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
        O que {cargo.branch === 'executivo' ? 'ele/ela faz' : 'faz'}?
      </h3>

      <div className="relative mt-8">
        <div
          className="absolute left-1.5 top-1 bottom-1 w-[2px] bg-line sm:left-6 sm:right-6 sm:top-1.5 sm:bottom-auto sm:h-[2px] sm:w-auto"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:justify-between sm:gap-4">
          {acoes.map((acao, index) => {
            const expanded = expandedIndex === index;

            return (
              <div key={acao.verbo} className="flex flex-1 flex-col items-start gap-2 sm:items-center sm:text-center">
                <button
                  type="button"
                  onClick={() => setExpandedIndex((prev) => (prev === index ? null : index))}
                  aria-expanded={expanded}
                  className="flex items-center gap-3 sm:flex-col sm:gap-3"
                >
                  <span className={`h-3 w-3 shrink-0 rounded-full ${dotColor}`} aria-hidden="true" />
                  <span className="font-heading text-base font-black uppercase tracking-tight text-ink sm:text-lg">
                    {acao.verbo}
                  </span>
                </button>

                {expanded && (
                  <p className="max-w-[220px] pl-6 text-sm leading-relaxed text-ink-soft sm:pl-0">
                    {acao.explicacao}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
