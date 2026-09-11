'use client';

import { Loader2, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pré-visualização do PDF"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[16px] bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black uppercase text-[#8d0801]">Assim ficará no PDF</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {quantidadePaginas} {quantidadePaginas === 1 ? 'página' : 'páginas'} · {santinhosPorPagina}{' '}
              {santinhosPorPagina === 1 ? 'santinho' : 'santinhos'} por página
            </p>
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

        <div className="mt-6 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-4 sm:p-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#4d4d4d]">Página 1</p>
          <div className={`grid gap-4 ${gridClass}`}>
            {Array.from({ length: santinhosPorPagina }).map((_, index) => (
              <div key={index} className="mx-auto w-full max-w-[200px]">
                <SantinhoPreview candidatos={candidatos} />
              </div>
            ))}
          </div>

          {quantidadePaginas > 1 && (
            <p className="mt-4 text-center text-xs text-[#4d4d4d]">
              + {quantidadePaginas - 1} {quantidadePaginas - 1 === 1 ? 'página idêntica' : 'páginas idênticas'} a esta.
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
  );
}
