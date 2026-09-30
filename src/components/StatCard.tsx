import type { ReactNode } from 'react';
import InfoTooltip from './InfoTooltip';

/**
 * Cardizinho discreto (branco, com borda, sem sombra forte) pra cada
 * estatística no topo das telas de cargos atuais e candidatos 2026.
 *
 * Valor e rótulo empilhados (não lado a lado) e o ícone de informação
 * fixo no canto — assim todo card tem a mesma altura/proporção, tenha ou
 * não tooltip, e o rótulo pode ser curto ("Partidos") ou longo ("Já foi
 * parlamentar") sem desalinhar os outros. Pensado pra entrar num grid de
 * colunas iguais (ver os usos), não num flex-wrap solto.
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
    <div className="relative flex h-full flex-col justify-center rounded-2xl border border-[#e0d6c4] bg-white px-3 py-2.5">
      {tooltip && (
        <div className="absolute right-1.5 top-1.5">
          <InfoTooltip label={`Sobre ${label}`} iconClassName="text-ink-soft">
            {tooltip}
          </InfoTooltip>
        </div>
      )}
      <span className={`text-xl font-black leading-none sm:text-2xl ${valueColor}`}>{value}</span>
      <span className="mt-1 line-clamp-2 pr-4 text-[11px] font-bold uppercase leading-tight tracking-wide text-ink sm:text-xs">
        {label}
      </span>
    </div>
  );
}
