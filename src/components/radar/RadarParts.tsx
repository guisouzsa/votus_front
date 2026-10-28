'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;

  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// Formata o valor de um indicador do IBGE conforme a unidade que o próprio
// IBGE informou — sem arredondar para "bonito" além do que a unidade pede.
export function formatIndicator(value: number | null, unit: string | null): string {
  if (value === null) return '—';

  switch (unit) {
    case 'Pessoas':
      return `${value.toLocaleString('pt-BR')} hab.`;
    case 'Quilômetros quadrados':
      return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} km²`;
    case 'Mil Reais':
      return (value * 1000).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1,
      });
    default:
      return `${value.toLocaleString('pt-BR')}${unit ? ` ${unit}` : ''}`;
  }
}

/** "em 2025" ou "na 57ª legislatura (2023–2026)", para frases. */
export function periodPhrase(period: { key: string; label: string }): string {
  return period.key === 'legislature' ? `na ${period.label}` : `em ${period.key}`;
}

/** Dado ainda não calculado (diferente de zero): nunca vira "0". */
export function Pending({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-[#f7f5f2] p-3 text-sm text-ink-soft">
      <Clock size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#1B623A]" />
      <span>{children}</span>
    </p>
  );
}

export function UpdatedAt({
  generatedAt,
  lastFailedAt,
  generatedLabel = 'Atualizado em',
}: {
  generatedAt: string | null;
  lastFailedAt: string | null;
  /** Ex.: "Consulta ao IBGE feita em" para valores de cópia guardada. */
  generatedLabel?: string;
}) {
  if (!generatedAt && !lastFailedAt) return null;

  return (
    <div className="mt-3 space-y-1 text-[11px] text-ink-soft">
      {generatedAt && (
        <p>
          {generatedLabel} {formatDateTime(generatedAt)}.
        </p>
      )}
      {lastFailedAt && (
        <p className="flex items-start gap-1 text-[#8d0801]">
          <AlertTriangle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
          {generatedAt
            ? `A última tentativa de atualização (${formatDateTime(lastFailedAt)}) falhou na fonte oficial; os dados exibidos são os da última atualização válida.`
            : `A última tentativa de buscar os dados (${formatDateTime(lastFailedAt)}) falhou na fonte oficial. Uma nova tentativa é feita automaticamente.`}
        </p>
      )}
    </div>
  );
}

export interface TopicBarItem {
  key: string;
  name: string;
  count: number;
  /** % das proposições; ausente quando a amostra é pequena demais. */
  share?: number;
}

// Temas visíveis de saída; o restante fica em "Ver todos".
const TOP_TOPICS = 6;

/**
 * Barras horizontais de temas. O número fica sempre escrito ao lado (não
 * depende de passar o mouse); a barra é proporcional ao maior tema da lista.
 */
export function TopicBars({ items, color, total }: { items: TopicBarItem[]; color: string; total?: number }) {
  const max = Math.max(1, ...items.map((t) => t.count));

  const row = (topic: TopicBarItem, rank: number) => (
    <li key={topic.key}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 break-words font-semibold text-ink">
          <span className="mr-1.5 tabular-nums text-ink-soft">{rank}.</span>
          {topic.name}
        </span>
        <span className="shrink-0 tabular-nums font-black" style={{ color }}>
          {topic.share !== undefined ? `${topic.share.toLocaleString('pt-BR')}%` : topic.count.toLocaleString('pt-BR')}
        </span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#f1ebe0]" aria-hidden="true">
        <div
          className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500"
          style={{ width: `${Math.max((topic.count / max) * 100, 2)}%`, backgroundColor: color }}
        />
      </div>
      {topic.share !== undefined && total !== undefined && (
        <p className="mt-0.5 text-[11px] text-ink-soft">
          {topic.count.toLocaleString('pt-BR')} de {total.toLocaleString('pt-BR')} proposições
        </p>
      )}
    </li>
  );

  return (
    <>
      <ol className="space-y-3">{items.slice(0, TOP_TOPICS).map((t, i) => row(t, i + 1))}</ol>
      {items.length > TOP_TOPICS && (
        <details className="group mt-3">
          <summary className="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-3.5 text-xs font-bold text-[#1B623A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]">
            <span className="group-open:hidden">Ver todos os {items.length} temas</span>
            <span className="hidden group-open:inline">Mostrar menos</span>
          </summary>
          <ol start={TOP_TOPICS + 1} className="mt-3 space-y-3">
            {items.slice(TOP_TOPICS).map((t, i) => row(t, TOP_TOPICS + i + 1))}
          </ol>
        </details>
      )}
    </>
  );
}

/**
 * Seção do Radar: sem moldura — um separador fino no topo, título com o ícone
 * na cor da fonte (Câmara, Senado, IBGE) e a fonte à direita.
 */
export function RadarCard({
  title,
  source,
  color,
  icon,
  children,
  id,
}: {
  title: string;
  source: ReactNode;
  color: string;
  icon?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-titulo` : undefined} className="min-w-0 border-t border-line pt-5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 id={id ? `${id}-titulo` : undefined} className="flex items-center gap-2 text-lg font-black text-ink">
          {icon && (
            <span aria-hidden="true" className="flex shrink-0" style={{ color }}>
              {icon}
            </span>
          )}
          {title}
        </h2>
        <span className="text-[11px] font-semibold text-ink-soft">{source}</span>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
