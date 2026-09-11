'use client';

import { useState } from 'react';
import { COMPARACOES, COMPARACAO_PADRAO_POR_CARGO, getCargoPorId } from '@/data/cargosPoliticos';

const PODER_COLOR = {
  executivo: 'text-brasil-orange',
  legislativo: 'text-brasil-green',
} as const;

function comparacaoPadrao(cargoSelecionadoId: string) {
  return COMPARACAO_PADRAO_POR_CARGO[cargoSelecionadoId] ?? COMPARACOES[0].id;
}

export default function CargosComparacao({ cargoSelecionadoId }: { cargoSelecionadoId: string }) {
  const [comparacaoId, setComparacaoId] = useState(comparacaoPadrao(cargoSelecionadoId));

  // Sempre que o cargo escolhido no mapa muda, a comparação acompanha — a
  // seção deve parecer conectada ao resto da página, não uma ferramenta à
  // parte. Ajustado durante a renderização (em vez de em um efeito) para
  // não disparar uma renderização em cascata.
  const [cargoAnterior, setCargoAnterior] = useState(cargoSelecionadoId);
  if (cargoSelecionadoId !== cargoAnterior) {
    setCargoAnterior(cargoSelecionadoId);
    setComparacaoId(comparacaoPadrao(cargoSelecionadoId));
  }

  const comparacaoAtual = COMPARACOES.find((c) => c.id === comparacaoId) ?? COMPARACOES[0];
  const cargoA = getCargoPorId(comparacaoAtual.cargoAId);
  const cargoB = getCargoPorId(comparacaoAtual.cargoBId);

  const linhas = [
    { label: 'Poder', a: cargoA.poder === 'executivo' ? 'Executivo' : 'Legislativo', b: cargoB.poder === 'executivo' ? 'Executivo' : 'Legislativo' },
    { label: 'Âmbito', a: cargoA.nivelLabel, b: cargoB.nivelLabel },
    { label: 'Mandato', a: cargoA.mandato, b: cargoB.mandato },
    { label: 'Eleição', a: cargoA.eleicao, b: cargoB.eleicao },
    { label: 'Função principal', a: cargoA.funcaoPrincipal, b: cargoB.funcaoPrincipal },
  ];

  return (
    <section aria-labelledby="comparacao-titulo">
      <h3 id="comparacao-titulo" className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
        Comparar cargos
      </h3>

      <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-hide">
        {COMPARACOES.map((comparacao) => {
          const nomeA = getCargoPorId(comparacao.cargoAId).nome;
          const nomeB = getCargoPorId(comparacao.cargoBId).nome;
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
          <p className={`pb-3 text-center font-heading text-sm font-black uppercase tracking-tight sm:text-base ${PODER_COLOR[cargoA.poder]}`}>
            {cargoA.nome}
          </p>
          <p className={`pb-3 text-center font-heading text-sm font-black uppercase tracking-tight sm:text-base ${PODER_COLOR[cargoB.poder]}`}>
            {cargoB.nome}
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
