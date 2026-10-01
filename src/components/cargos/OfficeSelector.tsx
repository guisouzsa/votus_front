'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { POSITIONS, LEVELS, type Branch } from '@/data/politicalPositions';

const PODER_DOT: Record<Branch, string> = {
  executivo: 'bg-brasil-orange',
  legislativo: 'bg-brasil-green',
};

const PODER_ATIVO: Record<Branch, string> = {
  executivo: 'border-brasil-orange bg-brasil-orange/10 text-brasil-orange',
  legislativo: 'border-brasil-green bg-brasil-green/10 text-brasil-green',
};

// Substitui o antigo CargosMapa + CargosMiniSeletor (a barra fixa que
// aparecia ao rolar) por um único seletor sempre visível: no desktop fica
// fixo numa coluna lateral (não precisa rolar pra trocar de cargo), e no
// celular aparece como um bloco normal no topo, sem esconder/aparecer.
export default function OfficeSelector({
  selecionadoId,
  onSelect,
}: {
  selecionadoId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Selecionar cargo político" className="flex flex-col gap-6">
      {LEVELS.map((nivel) => (
        <div key={nivel.id}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-ink-soft">{nivel.label}</p>

          <div className="flex flex-col gap-2">
            {POSITIONS.filter((cargo) => cargo.level === nivel.id).map((cargo) => {
              const ativo = cargo.id === selecionadoId;

              return (
                <button
                  key={cargo.id}
                  type="button"
                  onClick={() => onSelect(cargo.id)}
                  aria-pressed={ativo}
                  className={`flex items-center gap-2.5 rounded-[10px] border px-4 py-3 text-left text-sm font-bold transition-colors ${
                    ativo ? PODER_ATIVO[cargo.branch] : 'border-line text-ink hover:border-ink/20 hover:bg-sand/30'
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${PODER_DOT[cargo.branch]}`} aria-hidden="true" />
                  {cargo.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* "Você Sabia?" não é um cargo: é a área de explicações com quiz
      (/explicacao), incorporada aqui como último item da lista. Por isso é
      um link de navegação, não um botão que troca a ficha ao lado. */}
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-ink-soft">Aprenda mais</p>
        <Link
          href="/explicacao"
          className="flex items-center gap-2.5 rounded-[10px] border border-line px-4 py-3 text-left text-sm font-bold text-ink transition-colors hover:border-brasil-red/40 hover:bg-sand/30"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-brasil-red" aria-hidden="true" />
          Você Sabia?
          <ArrowRight size={16} className="ml-auto text-brasil-red" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
