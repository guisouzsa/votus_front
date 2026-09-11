'use client';

import type { CargoPolitico } from '@/data/cargosPoliticos';

const PODER_COLOR = {
  executivo: 'text-brasil-orange',
  legislativo: 'text-brasil-green',
} as const;

const PODER_LABEL = {
  executivo: 'Executivo',
  legislativo: 'Legislativo',
} as const;

export default function CargoFicha({ cargo }: { cargo: CargoPolitico }) {
  const fatos = [
    { label: 'Poder', valor: PODER_LABEL[cargo.poder] },
    { label: 'Âmbito', valor: cargo.nivelLabel },
    { label: 'Mandato', valor: cargo.mandato },
    { label: 'Eleição', valor: cargo.eleicao },
  ];

  return (
    <section
      key={cargo.id}
      aria-labelledby="ficha-cargo-titulo"
      className="grid animate-[votus-chat-in_0.35s_ease-out_both] grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
    >
      <div>
        <h2
          id="ficha-cargo-titulo"
          className={`font-heading text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-4xl md:text-5xl ${PODER_COLOR[cargo.poder]}`}
        >
          {cargo.nome}
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink sm:text-lg">{cargo.descricao}</p>
      </div>

      <dl className="flex flex-col">
        {fatos.map((fato) => (
          <div key={fato.label} className="flex items-baseline justify-between gap-4 border-t border-line py-4 first:border-t-0 sm:py-5">
            <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">{fato.label}</dt>
            <dd className="text-xl font-black text-ink sm:text-2xl">{fato.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
