'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CargoPolitico } from '@/data/cargosPoliticos';

const CTA_LABEL_POR_CARGO: Record<string, string> = {
  senador: 'Ver senadores',
  'deputado-federal': 'Ver deputados',
};

export default function CargosConheca({ cargo }: { cargo: CargoPolitico }) {
  return (
    <section
      key={cargo.id}
      aria-labelledby="conheca-titulo"
      className="flex animate-[votus-chat-in_0.35s_ease-out_both] flex-col items-start gap-4 rounded-[10px] bg-sand/40 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10"
    >
      <p id="conheca-titulo" className="max-w-lg text-base font-semibold leading-relaxed text-ink sm:text-lg">
        Você acabou de entender o que faz um(a){' '}
        <span className="text-brasil-red">{cargo.nome}</span>.
        {cargo.rotaVotus ? ' Agora veja quem ocupa esse cargo.' : ' O Votus ainda não acompanha esse cargo por aqui.'}
      </p>

      {cargo.rotaVotus ? (
        <Link
          href={cargo.rotaVotus}
          className="flex shrink-0 items-center gap-2 rounded-[10px] bg-brasil-red px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#6d0601]"
        >
          {CTA_LABEL_POR_CARGO[cargo.id] ?? 'Ver mais'}
          <ArrowRight size={16} />
        </Link>
      ) : (
        <span className="shrink-0 rounded-[10px] border border-ink-soft/30 px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink-soft">
          Em breve no Votus
        </span>
      )}
    </section>
  );
}
