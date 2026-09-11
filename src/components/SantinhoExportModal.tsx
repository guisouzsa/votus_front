'use client';

import { FileDown, Loader2, X } from 'lucide-react';
import WovenRibbon from './WovenRibbon';
import SantinhoPreview, { type SantinhoCandidato } from './SantinhoPreview';

const GRID_CLASS_BY_COUNT: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  4: 'grid-cols-2',
  6: 'grid-cols-2 sm:grid-cols-3',
};

export default function SantinhoExportModal({
  candidatos,
  quantidadePaginas,
  santinhosPorPagina,
  salvando,
  erro,
  onClose,
  onConfirm,
}: {
  candidatos: SantinhoCandidato[];
  quantidadePaginas: number;
  santinhosPorPagina: number;
  salvando: boolean;
  erro?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const gridClass = GRID_CLASS_BY_COUNT[santinhosPorPagina] ?? GRID_CLASS_BY_COUNT[1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pré-visualização do PDF"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[20px] bg-[#FDF8EE] shadow-2xl"
      >
        <WovenRibbon className="h-3 shrink-0" />

        {/* O scroll fica só aqui dentro, nunca no elemento com os cantos
            arredondados — senão a barra de rolagem risca a borda do modal. */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8d0801]">
                <FileDown size={18} className="text-white" strokeWidth={2.5} />
              </span>
              <div>
                <h2 className="font-display text-lg font-black uppercase tracking-tight text-[#8d0801]">
                  Assim ficará no seu PDF
                </h2>
                <p className="mt-0.5 text-sm font-medium text-[#1b623a]">
                  {quantidadePaginas} {quantidadePaginas === 1 ? 'página' : 'páginas'} · {santinhosPorPagina}{' '}
                  {santinhosPorPagina === 1 ? 'santinho' : 'santinhos'} por página
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="shrink-0 rounded-full p-1.5 text-[#8d0801]/60 transition-colors hover:bg-[#8d0801]/10 hover:text-[#8d0801]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[16px] border-2 border-[#EDDBBA] bg-white p-4 sm:p-6">
            <p className="mb-4 inline-block rounded-full bg-[#1b623a] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
              Página 1
            </p>
            <div className={`grid gap-4 ${gridClass}`}>
              {Array.from({ length: santinhosPorPagina }).map((_, index) => (
                <div key={index} className="mx-auto w-full max-w-[200px]">
                  <SantinhoPreview candidatos={candidatos} />
                </div>
              ))}
            </div>

            {quantidadePaginas > 1 && (
              <p className="mt-4 text-center text-xs font-semibold text-[#1b623a]">
                + {quantidadePaginas - 1} {quantidadePaginas - 1 === 1 ? 'página idêntica' : 'páginas idênticas'} a
                esta
              </p>
            )}
          </div>

          {erro && <p className="mt-4 text-sm font-semibold text-[#8d0801]">{erro}</p>}

          <button
            type="button"
            onClick={onConfirm}
            disabled={salvando}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-[#1b623a] text-base font-bold text-white transition-colors hover:bg-[#164f30] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando && <Loader2 size={18} className="animate-spin" />}
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
