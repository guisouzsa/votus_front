'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <span ref={ref} className={`group relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center justify-center bg-transparent text-white transition-transform hover:scale-110"
      >
        <Info size={16} strokeWidth={2.5} />
      </button>

      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-52 -translate-x-1/2 -translate-y-1 rounded-lg bg-white p-3 text-left text-xs normal-case leading-snug text-[#1b623a] opacity-0 shadow-xl ring-1 ring-black/5 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 ${
          open ? 'translate-y-0 opacity-100' : ''
        }`}
      >
        {children}
      </span>
    </span>
  );
}
