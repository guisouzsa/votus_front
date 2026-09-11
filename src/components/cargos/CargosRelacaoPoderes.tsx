'use client';

import { useState } from 'react';
import { RELACOES_ENTRE_PODERES } from '@/data/cargosPoliticos';

export default function CargosRelacaoPoderes() {
  const [ativa, setAtiva] = useState<number | null>(null);

  return (
    <section aria-labelledby="relacao-poderes-titulo">
      <h3 id="relacao-poderes-titulo" className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
        Executivo e Legislativo se relacionam
      </h3>

      <div className="mt-8 flex flex-col items-stretch gap-0 sm:mx-auto sm:max-w-2xl">
        <div className="rounded-[10px] bg-brasil-orange px-6 py-4 text-center font-heading text-lg font-black uppercase tracking-tight text-white sm:text-xl">
          Executivo
        </div>

        <div className="flex flex-col gap-3 py-4 sm:py-5">
          {RELACOES_ENTRE_PODERES.map((relacao, index) => {
            const destacada = ativa === index;

            return (
              <button
                key={relacao.executivo}
                type="button"
                onClick={() => setAtiva((prev) => (prev === index ? null : index))}
                className="flex items-center justify-center gap-3 text-center text-xs font-semibold sm:text-sm"
              >
                <span className={`transition-colors ${destacada ? 'text-brasil-orange' : 'text-ink-soft'}`}>
                  {relacao.executivo}
                </span>
                <span aria-hidden="true" className={`text-base transition-colors ${destacada ? 'text-brasil-red' : 'text-ink-soft/60'}`}>
                  ↕
                </span>
                <span className={`transition-colors ${destacada ? 'text-brasil-green' : 'text-ink-soft'}`}>
                  {relacao.legislativo}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-[10px] bg-brasil-green px-6 py-4 text-center font-heading text-lg font-black uppercase tracking-tight text-white sm:text-xl">
          Legislativo
        </div>
      </div>
    </section>
  );
}
