import type { ReactNode } from 'react';
import InfoTooltip from './InfoTooltip';

/**
 * Cardizinho discreto (branco, com borda, sem sombra forte) pra cada
 * estatística no topo das telas de cargos atuais e candidatos 2026 — troca
 * o texto solto de antes por algo com contorno próprio, e explica o dado ao
 * passar o mouse (desktop) ou tocar (mobile), via InfoTooltip.
 */
export default function StatCard({
  value,
  label,
  valueColor = 'text-ink',
  tooltip,
}: {
  value: string;
  label: string;
  valueColor?: string;
  tooltip?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[#e0d6c4] bg-white px-3 py-2">
      <div className="flex items-baseline gap-1.5">
        <span className={`text-xl font-black sm:text-2xl ${valueColor}`}>{value}</span>
        <span className="text-xs font-bold uppercase tracking-wide text-ink sm:text-sm">{label}</span>
      </div>
      {tooltip && (
        <InfoTooltip label={`Sobre ${label}`} iconClassName="text-ink-soft">
          {tooltip}
        </InfoTooltip>
      )}
    </div>
  );
}
