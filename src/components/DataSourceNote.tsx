'use client';

import { useEffect, useState } from 'react';
import { X, Database } from 'lucide-react';

export default function DataSourceNote({
  className = '',
  variant = 'subtle',
}: {
  className?: string;
  variant?: 'subtle' | 'prominent';
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      {variant === 'prominent' ? (
        <div
          className={`flex flex-col items-center gap-3 rounded-[14px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center ${className}`}
        >
          <Database size={24} strokeWidth={2} className="text-[#1b623a]" />
          <p className="max-w-md text-sm leading-relaxed text-ink-soft">
            Todos os dados de deputados e senadores exibidos aqui vêm de fontes oficiais de Dados Abertos do Poder
            Legislativo.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#1b623a] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#164f30]"
          >
            <Database size={16} strokeWidth={2.5} />
            De onde vêm esses dados?
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b623a]/70 underline decoration-dotted underline-offset-4 transition-colors hover:text-[#1b623a] ${className}`}
        >
          <Database size={13} strokeWidth={2.5} />
          De onde vêm esses dados?
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Fontes dos dados"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[14px] bg-white p-6 text-left shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-black uppercase text-[#1b623a]">Fontes dos dados</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="shrink-0 rounded-full p-1 text-[#1b623a]/60 transition-colors hover:bg-[#1b623a]/10 hover:text-[#1b623a]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Os dados apresentados pelo Votus são obtidos de fontes oficiais de Dados Abertos do Poder Legislativo.
              O Votus não é a fonte original dos dados — a plataforma organiza e apresenta essas informações de
              maneira mais acessível.
            </p>

            <div className="mt-4 rounded-[10px] border border-[#e0d6c4] bg-[#f7f5f2] p-4">
              <p className="text-sm font-bold text-[#8d0801]">Senado Federal e Congresso Nacional</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Os dados são obtidos através da API oficial de Dados Abertos Legislativos do Senado Federal.
              </p>
              <a
                href="https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html"
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-block text-xs font-semibold text-[#1b623a] underline"
              >
                Ver documentação oficial ↗
              </a>
            </div>

            <div className="mt-3 rounded-[10px] border border-[#e0d6c4] bg-[#f7f5f2] p-4">
              <p className="text-sm font-bold text-[#8d0801]">Câmara dos Deputados</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Os dados são obtidos através da API oficial de Dados Abertos da Câmara dos Deputados.
              </p>
              <a
                href="https://dadosabertos.camara.leg.br/swagger/api.html"
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-block text-xs font-semibold text-[#1b623a] underline"
              >
                Ver documentação oficial ↗
              </a>
            </div>

            <p className="mt-4 text-xs italic text-ink-soft">
              Os dados podem ser atualizados ou alterados conforme as fontes oficiais.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
