'use client';

import { CARGOS } from '@/data/cargosPoliticos';

const PODER_ACTIVE = {
  executivo: 'bg-brasil-orange text-white',
  legislativo: 'bg-brasil-green text-white',
} as const;

export default function CargosMiniSeletor({
  visivel,
  selecionadoId,
  onSelect,
}: {
  visivel: boolean;
  selecionadoId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      aria-hidden={!visivel}
      className={`sticky top-3 z-30 mb-8 transition-all duration-300 ${
        visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
    >
      <div className="flex gap-1.5 overflow-x-auto rounded-[14px] border border-[#d6d1c8] bg-cream-panel p-1.5 shadow-md scrollbar-hide">
        {CARGOS.map((cargo) => {
          const ativo = cargo.id === selecionadoId;

          return (
            <button
              key={cargo.id}
              type="button"
              onClick={() => onSelect(cargo.id)}
              className={`shrink-0 whitespace-nowrap rounded-[8px] px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                ativo
                  ? PODER_ACTIVE[cargo.poder]
                  : 'text-ink border border-transparent hover:border-line hover:bg-sand/40'
              }`}
            >
              {cargo.nome}
            </button>
          );
        })}
      </div>
    </div>
  );
}
