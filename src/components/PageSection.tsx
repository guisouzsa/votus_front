import type { ReactNode } from 'react';

/**
 * Seção de página de dados (Radar, Comparador de propostas): sem moldura —
 * um separador fino no topo, título com ícone pequeno na cor da seção e,
 * à direita, a fonte ou uma ação. Mesmo padrão em todas as páginas.
 */
export default function PageSection({
  id,
  title,
  icon,
  color = '#1B623A',
  aside,
  info,
  children,
  className = '',
}: {
  id?: string;
  title: ReactNode;
  icon?: ReactNode;
  color?: string;
  /** Fonte, link ou ação no canto direito do título. */
  aside?: ReactNode;
  /** Ajuda curta ao lado do título (ex.: InfoTooltip). */
  info?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-titulo` : undefined} className={`min-w-0 border-t border-line pt-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <h2 id={id ? `${id}-titulo` : undefined} className="flex min-w-0 scroll-mt-24 items-center gap-2 text-lg font-black text-ink">
            {icon && (
              <span aria-hidden="true" className="flex shrink-0" style={{ color }}>
                {icon}
              </span>
            )}
            <span className="min-w-0 break-words">{title}</span>
          </h2>
          {info}
        </div>
        {aside && <div className="text-[11px] font-semibold text-ink-soft">{aside}</div>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
