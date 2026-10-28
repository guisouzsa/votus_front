'use client';

import { BarChart3, Map as MapIcon, Users, type LucideIcon } from 'lucide-react';
import type { RadarIndicatorKey, RadarStateDetail } from '@/services/radarService';
import { SOURCE_COLORS } from './radarPalette';
import { Pending, RadarCard, UpdatedAt, formatDateTime, formatIndicator } from './RadarParts';

const INDICATORS: { key: RadarIndicatorKey; icon: LucideIcon; hint: string }[] = [
  { key: 'population', icon: Users, hint: 'Quantas pessoas moram no estado, segundo a estimativa oficial.' },
  { key: 'area', icon: MapIcon, hint: 'Tamanho do território do estado.' },
  { key: 'gdp', icon: BarChart3, hint: 'Valor de tudo o que foi produzido no estado em um ano.' },
];

/**
 * Indicadores oficiais do IBGE, cada um com o próprio ano de referência. Não
 * são cruzados com a atividade legislativa nem entre si: os anos são
 * diferentes (ex.: população estimada x PIB de anos anteriores), então nada
 * de "PIB per capita" calculado aqui.
 */
export default function RadarIndicators({ detail }: { detail: RadarStateDetail }) {
  const { ibge, state } = detail;
  const ready = ibge.status === 'ok' && ibge.values && ibge.indicators;

  return (
    <RadarCard
      id="radar-indicadores"
      title={`Indicadores de ${state.name}`}
      source={<a href="https://servicodados.ibge.gov.br/api/docs/agregados" target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">IBGE</a>}
      color={SOURCE_COLORS.ibge}
      icon={<BarChart3 size={20} />}
    >
      {!ready ? (
        <Pending>
          {ibge.last_failed_at
            ? `Os indicadores do IBGE estão indisponíveis no momento: a última consulta (${formatDateTime(ibge.last_failed_at)}) falhou. Os dados da Câmara e do Senado acima não são afetados.`
            : 'Os indicadores do IBGE estão sendo preparados. Volte em alguns minutos.'}
        </Pending>
      ) : (
        <>
          {/* Três colunas no tablet; empilhado no celular e na coluna mais
              estreita ao lado da evolução anual (desktop). */}
          <dl className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-1 lg:divide-x-0 lg:divide-y">
            {INDICATORS.map(({ key, icon: Icon, hint }) => {
              const meta = ibge.indicators![key];
              const value = ibge.values![key];

              return (
                <div key={key} className="py-3 first:pt-0 sm:px-4 sm:py-0 sm:first:pl-0 lg:px-0 lg:py-3 lg:first:pt-0">
                  <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase leading-tight text-[#8a4a0e]">
                    <Icon size={14} aria-hidden="true" className="shrink-0" />
                    {meta.label}
                  </dt>
                  <dd className="mt-1.5 text-xl font-black tabular-nums text-ink">
                    {value === null ? <span className="text-base text-ink-soft">Não informado pelo IBGE</span> : formatIndicator(value, meta.unit)}
                  </dd>
                  <dd className="mt-0.5 text-[11px] font-semibold text-ink">Referência: {meta.period}</dd>
                  <dd className="mt-1 text-[11px] leading-snug text-ink-soft">{hint}</dd>
                  <dd className="mt-1 text-[11px]">
                    <a href={meta.url} target="_blank" rel="noreferrer noopener" className="text-ink-soft underline underline-offset-2">
                      {meta.source}
                    </a>
                  </dd>
                </div>
              );
            })}
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
            Cada indicador tem o seu ano de referência; por isso eles não são combinados entre si nem com a atividade
            legislativa.
            {ibge.from_snapshot && ' Valores da última consulta bem-sucedida ao IBGE, guardados pelo Votus enquanto a consulta automática não responde.'}
          </p>
        </>
      )}
      <UpdatedAt
        generatedAt={ibge.generated_at}
        lastFailedAt={ready ? ibge.last_failed_at : null}
        generatedLabel={ibge.from_snapshot ? 'Consulta ao IBGE feita em' : 'Atualizado em'}
      />
    </RadarCard>
  );
}
