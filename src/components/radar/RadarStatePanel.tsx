'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import type { RadarIndicatorKey, RadarStateDetail } from '@/services/radarService';

const INDICATOR_ORDER: RadarIndicatorKey[] = ['population', 'area', 'gdp'];

// Temas visíveis de saída; o restante fica em "Ver todos".
const TOP_TOPICS = 6;

function TopicList({ items }: { items: ReactNode[] }) {
  return (
    <>
      <ul className="mt-3 space-y-2.5">{items.slice(0, TOP_TOPICS)}</ul>
      {items.length > TOP_TOPICS && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-bold text-[#1B623A] underline-offset-2 hover:underline">
            Ver todos os {items.length} temas
          </summary>
          <ul className="mt-2.5 space-y-2.5">{items.slice(TOP_TOPICS)}</ul>
        </details>
      )}
    </>
  );
}

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

function Block({ title, source, children }: { title: string; source: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#e0d6c4] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-black uppercase tracking-wide text-[#1B623A]">{title}</h3>
        <span className="text-[11px] font-semibold text-ink-soft">{source}</span>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Pending({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-[#f7f5f2] p-3 text-sm text-ink-soft">
      <Clock size={16} className="mt-0.5 shrink-0 text-[#1B623A]" />
      <span>{children}</span>
    </p>
  );
}

function UpdatedAt({ generatedAt, lastFailedAt }: { generatedAt: string | null; lastFailedAt: string | null }) {
  return (
    <div className="mt-3 space-y-1 text-[11px] text-ink-soft">
      {generatedAt && <p>Atualizado em {formatDateTime(generatedAt)}.</p>}
      {lastFailedAt && (
        <p className="flex items-start gap-1 text-[#8d0801]">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          {generatedAt
            ? `A última tentativa de atualização (${formatDateTime(lastFailedAt)}) falhou na fonte oficial; os dados exibidos são os últimos validados.`
            : `A última tentativa de buscar os dados (${formatDateTime(lastFailedAt)}) falhou na fonte oficial. Uma nova tentativa é feita automaticamente.`}
        </p>
      )}
    </div>
  );
}

function TopicBar({ name, value, width, detail }: { name: string; value: string; width: number; detail?: string }) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-ink">{name}</span>
        <span className="shrink-0 font-bold text-[#1B623A]">{value}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#f1ebe0]" aria-hidden="true">
        <div className="h-full rounded-full bg-[#1B623A]" style={{ width: `${Math.max(width, 2)}%` }} />
      </div>
      {detail && <p className="mt-0.5 text-[11px] text-ink-soft">{detail}</p>}
    </li>
  );
}

// Esqueleto no formato do painel (cabeçalho, indicadores e dois blocos de
// temas), no padrão dos skeletons do Votus.
function PanelSkeleton() {
  return (
    <div role="status" className="animate-pulse space-y-4">
      <span className="sr-only">Carregando dados do estado...</span>
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-[#eee6d8]" />
        <div className="h-7 w-56 rounded bg-[#eee6d8]" />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-[#eee6d8]" />
        ))}
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-[#e0d6c4] bg-white p-4">
          <div className="h-4 w-40 rounded bg-[#eee6d8]" />
          {[0, 1, 2, 3].map((j) => (
            <div key={j} className="h-3 rounded bg-[#eee6d8]" style={{ width: `${90 - j * 15}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function RadarStatePanel({
  detail,
  loading,
  updating = false,
  error,
  onRetry,
}: {
  detail: RadarStateDetail | undefined;
  loading: boolean;
  updating?: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-[#e0d6c4] bg-white p-5 text-sm">
        <p className="font-semibold text-[#8d0801]">{error}</p>
        <p className="mt-1 text-ink-soft">Pode ser uma instabilidade momentânea do servidor.</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-2 font-bold text-[#1B623A] underline underline-offset-2">
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (loading || !detail) {
    return <PanelSkeleton />;
  }

  const { state, ibge, camara, senado, period } = detail;
  const camaraData = camara.data;
  const senadoData = senado.data;
  const senadoMax = Math.max(1, ...(senadoData?.topics.map((t) => t.count) ?? [1]));

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{state.region}</p>
        <h2 className="text-2xl font-black text-[#1B623A]">
          {state.name} <span className="text-ink-soft">({state.uf})</span>
        </h2>
        <p className="text-sm text-ink-soft" aria-live="polite">
          {period.label}
          {updating && <span className="ml-2 text-xs font-semibold text-[#1B623A]">Atualizando…</span>}
        </p>
      </header>

      <Block title="Indicadores" source="IBGE">
        {ibge.status === 'pending' || !ibge.values || !ibge.indicators ? (
          <Pending>Os indicadores do IBGE estão sendo preparados. Volte em alguns minutos.</Pending>
        ) : (
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {INDICATOR_ORDER.map((key) => {
              const meta = ibge.indicators![key];

              return (
                <div key={key} className="rounded-xl bg-[#f7f5f2] p-3">
                  <dt className="text-[11px] font-bold uppercase leading-tight text-ink-soft">{meta.label}</dt>
                  <dd className="mt-1 text-lg font-black text-ink">{formatIndicator(ibge.values![key], meta.unit)}</dd>
                  <dd className="text-[11px] text-ink-soft">
                    <a href={meta.url} target="_blank" rel="noreferrer noopener" className="underline">
                      {meta.source}, {meta.period}
                    </a>
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
        <UpdatedAt generatedAt={ibge.generated_at} lastFailedAt={ibge.last_failed_at} />
      </Block>

      <Block title="Câmara dos Deputados" source="Dados Abertos da Câmara">
        {camara.status === 'pending' || !camaraData ? (
          <Pending>
            Os dados da Câmara {camara.missing_years.length > 0 ? `(${camara.missing_years.join(', ')}) ` : ''}
            estão sendo preparados a partir dos arquivos oficiais. Volte em alguns minutos.
          </Pending>
        ) : camaraData.propositions === 0 ? (
          <p className="text-sm text-ink-soft">Nenhuma proposição de deputados de {state.uf} com tema oficial neste período.</p>
        ) : (
          <>
            <p className="text-sm text-ink">
              <strong>{camaraData.propositions.toLocaleString('pt-BR')}</strong> projetos de lei (PL) e propostas de emenda à
              Constituição (PEC) com tema oficial, apresentados por deputados de {state.uf}
              {camaraData.deputies !== null && (
                <>
                  {' '}
                  (<strong>{camaraData.deputies}</strong> {camaraData.deputies === 1 ? 'deputado autor' : 'deputados autores'})
                </>
              )}
              .
            </p>
            <TopicList
              items={camaraData.topics.map((topic) => (
                <TopicBar
                  key={topic.code}
                  name={topic.name}
                  value={`${topic.share.toLocaleString('pt-BR')}%`}
                  width={topic.share}
                  detail={`${topic.count.toLocaleString('pt-BR')} de ${camaraData.propositions.toLocaleString('pt-BR')} proposições`}
                />
              ))}
            />
            <p className="mt-3 text-[11px] text-ink-soft">
              {camaraData.multi_theme_propositions.toLocaleString('pt-BR')} proposições têm mais de um tema e contam em
              cada um — por isso os percentuais somam mais de 100%.
            </p>
          </>
        )}
        <UpdatedAt generatedAt={camara.generated_at} lastFailedAt={camara.last_failed_at} />
      </Block>

      <Block title="Senado Federal" source="Dados Abertos do Senado">
        {senado.status === 'pending' || !senadoData ? (
          <Pending>Os dados do Senado para {state.uf} estão sendo preparados. Volte em alguns minutos.</Pending>
        ) : (
          <>
            <p className="text-sm text-ink">
              <strong>{senadoData.propositions}</strong> PL e PEC dos senadores em exercício de {state.uf}
              {senadoData.senators.length > 0 && (
                <> ({senadoData.senators.map((s) => s.name).filter(Boolean).join(', ')})</>
              )}
              .
            </p>
            {senadoData.small_sample && senadoData.propositions > 0 && (
              <p className="mt-2 rounded-xl bg-[#fdf3e7] p-2.5 text-[12px] text-[#7a4a00]">
                Amostra pequena: mostramos só a contagem de proposições por tema, sem percentuais.
              </p>
            )}
            {senadoData.topics.length > 0 ? (
              <TopicList
                items={senadoData.topics.map((topic) => (
                  <TopicBar
                    key={topic.name}
                    name={topic.name}
                    value={`${topic.count} ${topic.count === 1 ? 'proposição' : 'proposições'}`}
                    width={(topic.count / senadoMax) * 100}
                  />
                ))}
              />
            ) : (
              <p className="mt-2 text-sm text-ink-soft">Nenhuma proposição classificada neste período.</p>
            )}
            {(senadoData.without_topic > 0 || senadoData.details_failed > 0) && (
              <p className="mt-3 text-[11px] text-ink-soft">
                {senadoData.without_topic > 0 && `${senadoData.without_topic} sem classificação temática no Senado. `}
                {senadoData.details_failed > 0 &&
                  `${senadoData.details_failed} não puderam ser consultadas na fonte e ficaram fora da contagem.`}
              </p>
            )}
          </>
        )}
        <UpdatedAt generatedAt={senado.generated_at} lastFailedAt={senado.last_failed_at} />
      </Block>

      {camara.source_files.length > 0 && (
        <details className="rounded-2xl border border-[#e0d6c4] bg-white p-4 text-sm">
          <summary className="cursor-pointer font-bold text-[#1B623A]">Arquivos oficiais usados (Câmara)</summary>
          <ul className="mt-2 space-y-1 text-[12px]">
            {camara.source_files.map((file) => (
              <li key={file.url}>
                <a href={file.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 break-all underline">
                  {file.url.split('/').pop()}
                  <ExternalLink size={11} className="shrink-0" />
                </a>
                {file.last_modified && <span className="text-ink-soft"> — publicado em {formatDateTime(file.last_modified)}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
