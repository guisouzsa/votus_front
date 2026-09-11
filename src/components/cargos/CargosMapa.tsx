'use client';

import { CARGOS, NIVEIS, type Poder } from '@/data/cargosPoliticos';

const PODER_COLOR: Record<Poder, string> = {
  executivo: 'text-brasil-orange',
  legislativo: 'text-brasil-green',
};

const PODER_BAR: Record<Poder, string> = {
  executivo: 'bg-brasil-orange',
  legislativo: 'bg-brasil-green',
};

const PODER_LABEL: Record<Poder, string> = {
  executivo: 'Executivo',
  legislativo: 'Legislativo',
};

export default function CargosMapa({
  selecionadoId,
  onSelect,
}: {
  selecionadoId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section aria-labelledby="mapa-cargos-titulo" className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-6">
      {NIVEIS.map((nivel) => (
        <div key={nivel.id} className="flex flex-col gap-4 sm:gap-5">
          {/* "Municipal" é omitido: Prefeito/Vereador já deixam o nível óbvio,
              diferente de Federal/Estadual, que ajudam a diferenciar os cargos. */}
          {nivel.id !== 'municipal' && (
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-soft">{nivel.label}</p>
          )}

          {(['executivo', 'legislativo'] as Poder[]).map((poder) => {
            const cargosDoGrupo = CARGOS.filter((cargo) => cargo.nivel === nivel.id && cargo.poder === poder);

            return (
              <div key={poder} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-[3px] w-4 rounded-full ${PODER_BAR[poder]}`} aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    {PODER_LABEL[poder]}
                  </span>
                </div>

                <div className="flex flex-col">
                  {cargosDoGrupo.map((cargo) => {
                    const ativo = cargo.id === selecionadoId;

                    return (
                      <button
                        key={cargo.id}
                        type="button"
                        onClick={() => onSelect(cargo.id)}
                        aria-pressed={ativo}
                        className={`border-t border-line py-2.5 text-left font-heading text-lg font-black uppercase leading-tight transition-all duration-200 first:border-t-0 sm:text-xl ${
                          ativo
                            ? PODER_COLOR[poder]
                            : 'text-ink/40 hover:text-ink/70'
                        }`}
                      >
                        {cargo.nome}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
