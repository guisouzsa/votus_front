'use client';

import { CARGOS, NIVEIS, type Poder } from '@/data/cargosPoliticos';

const PODER_DOT: Record<Poder, string> = {
  executivo: 'bg-brasil-orange',
  legislativo: 'bg-brasil-green',
};

const PODER_ATIVO: Record<Poder, string> = {
  executivo: 'border-brasil-orange bg-brasil-orange/10 text-brasil-orange',
  legislativo: 'border-brasil-green bg-brasil-green/10 text-brasil-green',
};

// Substitui o antigo CargosMapa + CargosMiniSeletor (a barra fixa que
// aparecia ao rolar) por um único seletor sempre visível: no desktop fica
// fixo numa coluna lateral (não precisa rolar pra trocar de cargo), e no
// celular aparece como um bloco normal no topo, sem esconder/aparecer.
export default function CargoSeletor({
  selecionadoId,
  onSelect,
}: {
  selecionadoId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Selecionar cargo político" className="flex flex-col gap-6">
      {NIVEIS.map((nivel) => (
        <div key={nivel.id}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-ink-soft">{nivel.label}</p>

          <div className="flex flex-col gap-2">
            {CARGOS.filter((cargo) => cargo.nivel === nivel.id).map((cargo) => {
              const ativo = cargo.id === selecionadoId;

              return (
                <button
                  key={cargo.id}
                  type="button"
                  onClick={() => onSelect(cargo.id)}
                  aria-pressed={ativo}
                  className={`flex items-center gap-2.5 rounded-[10px] border px-4 py-3 text-left text-sm font-bold transition-colors ${
                    ativo ? PODER_ATIVO[cargo.poder] : 'border-line text-ink hover:border-ink/20 hover:bg-sand/30'
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${PODER_DOT[cargo.poder]}`} aria-hidden="true" />
                  {cargo.nome}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
