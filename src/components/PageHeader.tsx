import type { ReactNode } from 'react';
import DashboardHeader from '@/components/DashboardHeader';

/**
 * Cabeçalho padrão das páginas de dados (Eleições 2026): identificação da
 * seção e, com o mesmo título dos outros painéis (DashboardHeader: só texto
 * com cor, sem fundo), título e descrição curta. Opcionalmente, uma nota de
 * transparência resumida com a explicação completa sob demanda.
 *
 * Padrão editorial: `eyebrow` em maiúsculas curtas ("ELEIÇÕES 2026"),
 * descrição em uma ou duas frases.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  note,
  noteDetails,
  noteDetailsLabel = 'Como isso foi feito',
}: {
  eyebrow: string;
  title: string;
  description: string;
  note?: ReactNode;
  noteDetails?: ReactNode;
  noteDetailsLabel?: string;
}) {
  return (
    <header>
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-brasil-red">{eyebrow}</p>
      <DashboardHeader titleText={title} titleColor="text-brasil-green" subtitle={description} />

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
