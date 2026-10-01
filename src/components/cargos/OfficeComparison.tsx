'use client';

import { useState } from 'react';
import { COMPARISONS, DEFAULT_COMPARISON_BY_POSITION, getPositionById } from '@/data/politicalPositions';

const PODER_COLOR = {
  executivo: 'text-brasil-orange',
  legislativo: 'text-brasil-green',
} as const;

function comparacaoPadrao(selectedOfficeId: string) {
  return DEFAULT_COMPARISON_BY_POSITION[selectedOfficeId] ?? COMPARISONS[0].id;
}

export default function OfficeComparison({ selectedOfficeId }: { selectedOfficeId: string }) {
  const [comparacaoId, setComparacaoId] = useState(comparacaoPadrao(selectedOfficeId));

  // Sempre que o cargo escolhido no mapa muda, a comparação acompanha — a
  // seção deve parecer conectada ao resto da página, não uma ferramenta à
  // parte. Ajustado durante a renderização (em vez de em um efeito) para
  // não disparar uma renderização em cascata.
  const [cargoAnterior, setCargoAnterior] = useState(selectedOfficeId);
  if (selectedOfficeId !== cargoAnterior) {
    setCargoAnterior(selectedOfficeId);
    setComparacaoId(comparacaoPadrao(selectedOfficeId));
  }

  const comparacaoAtual = COMPARISONS.find((c) => c.id === comparacaoId) ?? COMPARISONS[0];
  const cargoA = getPositionById(comparacaoAtual.cargoAId);
  const cargoB = getPositionById(comparacaoAtual.cargoBId);

  const linhas = [
    { label: 'Poder', a: cargoA.branch === 'executivo' ? 'Executivo' : 'Legislativo', b: cargoB.branch === 'executivo' ? 'Executivo' : 'Legislativo' },
    { label: 'Âmbito', a: cargoA.levelLabel, b: cargoB.levelLabel },
    { label: 'Mandato', a: cargoA.termLength, b: cargoB.termLength },
    { label: 'Eleição', a: cargoA.election, b: cargoB.election },
    { label: 'Função principal', a: cargoA.mainFunction, b: cargoB.mainFunction },
  ];

  return (
    <section aria-labelledby="comparacao-titulo">
      <h3 id="comparacao-titulo" className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
        Comparar cargos
      </h3>

      <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-hide">
        {COMPARISONS.map((comparacao) => {
          const nomeA = getPositionById(comparacao.cargoAId).name;
          const nomeB = getPositionById(comparacao.cargoBId).name;
          const ativo = comparacao.id === comparacaoId;

          return (
            <button
              key={comparacao.id}
              type="button"
              onClick={() => setComparacaoId(comparacao.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                ativo ? 'bg-brasil-red text-white' : 'bg-cream-panel text-ink-soft hover:bg-sand/40'
              }`}
            >
              {nomeA} × {nomeB}
            </button>
          );
        })}
      </div>

      <div key={comparacaoId} className="mt-6 animate-[votus-chat-in_0.35s_ease-out_both] overflow-x-auto">
        <div className="grid min-w-[520px] grid-cols-[1fr_1.3fr_1.3fr] gap-x-4 sm:min-w-0">
          <div />
          <p className={`pb-3 text-center font-heading text-sm font-black uppercase tracking-tight sm:text-base ${PODER_COLOR[cargoA.branch]}`}>
            {cargoA.name}
          </p>
          <p className={`pb-3 text-center font-heading text-sm font-black uppercase tracking-tight sm:text-base ${PODER_COLOR[cargoB.branch]}`}>
            {cargoB.name}
          </p>

          {linhas.map((linha) => (
            <div key={linha.label} className="contents">
              <p className="border-t border-line py-3 text-xs font-bold uppercase tracking-wide text-ink-soft sm:text-sm">
                {linha.label}
              </p>
              <p className="border-t border-line py-3 text-center text-sm font-semibold text-ink sm:text-base">{linha.a}</p>
              <p className="border-t border-line py-3 text-center text-sm font-semibold text-ink sm:text-base">{linha.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
