'use client';

import { ExternalLink, Landmark, Scale } from 'lucide-react';
import type { RadarStateDetail } from '@/services/radarService';
import { SOURCE_COLORS } from './radarPalette';
import { Pending, RadarCard, TopicBars, UpdatedAt, formatDateTime, periodPhrase } from './RadarParts';

/**
 * Temas das proposições na Câmara e no Senado, lado a lado. As duas fontes
 * nunca são somadas: contam coisas diferentes (autores proponentes x todos
 * os signatários) e usam classificações temáticas diferentes.
 */
export default function RadarLegislative({ detail }: { detail: RadarStateDetail }) {
  const { state, camara, senado, period } = detail;
  const camaraData = camara.data;
  const senadoData = senado.data;

  return (
    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
      <RadarCard
        id="radar-camara"
        title="Câmara dos Deputados"
        source={<a href="https://dadosabertos.camara.leg.br/" target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">Dados Abertos da Câmara</a>}
        color={SOURCE_COLORS.camara}
        icon={<Landmark size={15} />}
      >
        {camara.status === 'pending' || !camaraData ? (
          <Pending>
            Os dados da Câmara {camara.missing_years.length > 0 ? `(${camara.missing_years.join(', ')}) ` : ''}
            estão sendo preparados a partir dos arquivos oficiais. Volte em alguns minutos.
          </Pending>
        ) : camaraData.propositions === 0 ? (
          <p className="text-sm text-ink-soft">
            Nenhuma proposição de deputados de {state.uf} com tema oficial {periodPhrase(period)}.
          </p>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-ink">
              <strong className="text-2xl font-black tabular-nums" style={{ color: SOURCE_COLORS.camara }}>
                {camaraData.propositions.toLocaleString('pt-BR')}
              </strong>{' '}
              projetos de lei e propostas de emenda à Constituição apresentados por deputados de {state.uf}{' '}
              {periodPhrase(period)}
              {camaraData.deputies !== null && (
                <>
                  , por <strong>{camaraData.deputies}</strong> {camaraData.deputies === 1 ? 'deputado autor' : 'deputados autores'}
                </>
              )}
              .
            </p>
            <h3 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-ink-soft">Temas mais frequentes</h3>
            <TopicBars
              color={SOURCE_COLORS.camara}
              total={camaraData.propositions}
              items={camaraData.topics.map((t) => ({ key: t.code, name: t.name, count: t.count, share: t.share }))}
            />
            <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
              {camaraData.multi_theme_propositions.toLocaleString('pt-BR')} proposições têm mais de um tema e contam em cada
              um — por isso os percentuais somam mais de 100%. Apresentada não quer dizer aprovada.
            </p>
          </>
        )}
        <UpdatedAt generatedAt={camara.generated_at} lastFailedAt={camara.last_failed_at} />
        {camara.source_files.length > 0 && (
          <details className="mt-2 text-[12px]">
            <summary className="cursor-pointer font-bold text-[#1B623A]">Arquivos oficiais usados</summary>
            <ul className="mt-2 space-y-1">
              {camara.source_files.map((file) => (
                <li key={file.url}>
                  <a href={file.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 break-all underline">
                    {file.url.split('/').pop()}
                    <ExternalLink size={11} aria-hidden="true" className="shrink-0" />
                  </a>
                  {file.last_modified && <span className="text-ink-soft"> — publicado em {formatDateTime(file.last_modified)}</span>}
                </li>
              ))}
            </ul>
          </details>
        )}
      </RadarCard>

      <RadarCard
        id="radar-senado"
        title="Senado Federal"
        source={<a href="https://www12.senado.leg.br/dados-abertos" target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">Dados Abertos do Senado</a>}
        color={SOURCE_COLORS.senado}
        icon={<Scale size={15} />}
      >
        {senado.status === 'pending' || !senadoData ? (
          <Pending>Os dados do Senado para {state.uf} estão sendo preparados. Volte em alguns minutos.</Pending>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-ink">
              <strong className="text-2xl font-black tabular-nums" style={{ color: SOURCE_COLORS.senado }}>
                {senadoData.propositions.toLocaleString('pt-BR')}
              </strong>{' '}
              projetos de lei e propostas de emenda à Constituição dos senadores em exercício por {state.uf}{' '}
              {periodPhrase(period)}.
            </p>
            {senadoData.senators.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Senadores em exercício por ${state.name}`}>
                {senadoData.senators.map((s) => (
                  <li key={s.code} className="rounded-full border border-[#d6dcef] bg-[#f3f5fb] px-2.5 py-1 text-xs font-semibold text-[#2B4C9B]">
                    {s.name ?? 'Nome não informado'}
                    {s.participation && s.participation !== 'Titular' && <span className="font-normal text-ink-soft"> · {s.participation}</span>}
                  </li>
                ))}
              </ul>
            )}
            {senadoData.small_sample && senadoData.propositions > 0 && (
              <p className="mt-3 rounded-xl bg-[#fdf3e7] p-2.5 text-[12px] text-[#7a4a00]">
                Poucas proposições: mostramos só quantas há em cada tema, sem percentuais.
              </p>
            )}
            {senadoData.topics.length > 0 ? (
              <>
                <h3 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-ink-soft">Temas mais frequentes</h3>
                <TopicBars
                  color={SOURCE_COLORS.senado}
                  items={senadoData.topics.map((t) => ({ key: t.name, name: t.name, count: t.count }))}
                />
              </>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">Nenhuma proposição classificada neste período.</p>
            )}
            {(senadoData.without_topic > 0 || senadoData.details_failed > 0) && (
              <p className="mt-3 text-[11px] text-ink-soft">
                {senadoData.without_topic > 0 && `${senadoData.without_topic} sem classificação temática no Senado. `}
                {senadoData.details_failed > 0 &&
                  `${senadoData.details_failed} não puderam ser consultadas na fonte e ficaram fora da contagem.`}
              </p>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
              No Senado, todos os que assinam constam como autores, e os temas seguem a classificação do próprio Senado — por
              isso os números não se somam aos da Câmara. Apresentada não quer dizer aprovada.
            </p>
          </>
        )}
        <UpdatedAt generatedAt={senado.generated_at} lastFailedAt={senado.last_failed_at} />
      </RadarCard>
    </div>
  );
}
