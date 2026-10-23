import type { ReactNode } from 'react';

/**
 * Cabeçalho padrão das páginas de dados (Eleições 2026, Radar): identificação
 * da seção, título, descrição curta e, opcionalmente, uma nota de
 * transparência resumida com a explicação completa sob demanda.
 *
 * Padrão editorial: `eyebrow` em maiúsculas curtas ("ELEIÇÕES 2026"), título
 * com só a primeira letra maiúscula, descrição em uma ou duas frases.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  note,
  noteDetails,
  noteDetailsLabel = 'Como isso foi feito',
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  note?: ReactNode;
  noteDetails?: ReactNode;
  noteDetailsLabel?: string;
  compact?: boolean;
}) {
  return (
    <header>
      <section className={`rounded-lg bg-[#1B623A] px-4 text-white ${compact ? 'py-2 sm:px-6 sm:py-3' : 'py-3 sm:px-6 sm:py-4'}`}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/80 sm:text-xs">{eyebrow}</p>
        <h1 className="mt-0.5 text-xl font-black leading-tight tracking-tight sm:text-2xl md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-3xl text-xs leading-snug text-white/90 sm:text-sm">{description}</p>
      </section>

      {note && (
        <div className="mt-3 rounded-xl border border-[#e0d6c4] bg-[#f7f5f2] px-3 py-2.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
          <p>{note}</p>
          {noteDetails && (
            <details className="mt-1.5 group">
              <summary className="cursor-pointer font-bold text-[#1B623A] underline-offset-2 hover:underline">
                {noteDetailsLabel}
              </summary>
              <div className="mt-2 space-y-2 border-t border-[#e0d6c4] pt-2">{noteDetails}</div>
            </details>
          )}
        </div>
      )}
    </header>
  );
}
