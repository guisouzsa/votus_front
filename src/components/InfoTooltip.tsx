'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({
  label,
  children,
  className = '',
  iconClassName = 'text-white',
}: {
  label: string;
  children: ReactNode;
  className?: string;
  // Os usos originais ficam sobre fundo colorido (precisa de ícone branco);
  // em cima de um card branco (ex: StatCard) o ícone precisa de outra cor
  // pra não sumir.
  iconClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Por padrão a tooltip fica centralizada sob o ícone — mas quando o ícone
  // está perto da borda da tela (ex: canto superior direito de um StatCard),
  // isso cortava o painel pela metade. Mede a posição real e desloca o
  // quanto for preciso pra caber inteira na tela, sem mudar nada quando já
  // cabe (offset continua 0).
  function reposition() {
    const panel = panelRef.current;
    if (!panel) return;

    const margin = 12;
    const rect = panel.getBoundingClientRect();
    let delta = 0;

    if (rect.left < margin) {
      delta = margin - rect.left;
    } else if (rect.right > window.innerWidth - margin) {
      delta = window.innerWidth - margin - rect.right;
    }

    if (delta !== 0) setOffset((previous) => previous + delta);
  }

  useEffect(() => {
    if (!open) return;

    setOffset(0);
    const id = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(id);
  }, [open]);

  return (
    <span ref={ref} className={`group relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => {
          setOffset(0);
          requestAnimationFrame(reposition);
        }}
        className={`flex items-center justify-center bg-transparent transition-transform hover:scale-110 ${iconClassName}`}
      >
        <Info size={16} strokeWidth={2.5} />
      </button>

      <span
        ref={panelRef}
        role="tooltip"
        style={{ transform: `translateX(calc(-50% + ${offset}px))` }}
        className={`pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-lg bg-white p-3 text-left text-xs normal-case leading-snug text-[#1b623a] opacity-0 shadow-xl ring-1 ring-black/5 transition-opacity duration-150 group-hover:opacity-100 ${
          open ? 'opacity-100' : ''
        }`}
      >
        {children}
      </span>
    </span>
  );
}
