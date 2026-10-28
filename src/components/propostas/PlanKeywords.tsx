'use client';

import { ExternalLink } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';
import type { IndexProposal } from '@/services/proposalComparisonService';
import { coverage, documentStatus, pdfPageUrl } from './coverage';
import type { ComparisonCandidate } from './types';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function PageLinks({ externalId, pages }: { externalId: string; pages: number[] }) {
  const document = coverage.documents[externalId];

  return (
    <>
      {pages.map((page, i) => (
        <span key={page}>
          {i > 0 && ', '}
          <a
            href={pdfPageUrl(document, page) ?? '#'}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[#1B623A] underline underline-offset-2"
          >
            {page}
          </a>
        </span>
      ))}
    </>
  );
}

/**
 * Palavras-chave de cada plano registrado no TSE e quanto das propostas
 * listadas no Votus aparece no próprio plano. Tudo vem de
 * scripts/plan-coverage/audit.mjs (texto integral dos PDFs), não da IA.
 */
export default function PlanKeywords({
  candidates,
  proposals,
  onPick,
}: {
  candidates: ComparisonCandidate[];
  proposals: IndexProposal[];
  onPick: (term: string) => void;
}) {
  const analysed = candidates.filter((c) => coverage.keywords?.[String(c.external_id)]?.length);
  if (analysed.length === 0) return null;

  const shared = coverage.shared_keywords ?? [];

  return (
    <section id="palavras-chave" aria-labelledby="palavras-chave-titulo" className="mt-8">
      <div className="flex items-center gap-1.5">
        <h2 id="palavras-chave-titulo" className="text-sm font-black uppercase tracking-wide text-[#1B623A]">
          Palavras-chave dos planos oficiais
        </h2>
        <InfoTooltip label="Sobre as palavras-chave" iconClassName="text-[#8D0801]">
          Expressões de duas palavras que mais se repetem no plano registrado no TSE, sem contar sumário e índice e
          ignorando palavras de ligação e de discurso (como “vamos” ou “mandato”). Repetição não mede prioridade nem
          compromisso: depende do estilo e do tamanho de cada documento. Toque numa expressão para buscá-la nas
          propostas.
        </InfoTooltip>
      </div>

      <div className={`mt-3 grid grid-cols-1 gap-4 ${analysed.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {analysed.map((candidate) => {
          const externalId = String(candidate.external_id);
          const document = coverage.documents[externalId];
          const list = coverage.keywords[externalId];
          const own = proposals.filter((p) => p.candidate_id === candidate.id);
          const statuses = own.map((p) => documentStatus(p, externalId));
          const inPlan = statuses.filter((s) => s.kind === 'located').length;
          const related = statuses.filter((s) => s.kind === 'related').length;
          const literal = own.some((p) => p.extraction === 'literal');

          return (
            <article key={candidate.id} className="rounded-2xl border border-[#e0d6c4] bg-white p-4">
              <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-base font-black text-ink">{candidate.name}</h3>
                {document && (
                  <a
                    href={document.plan_pdf_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B623A] underline underline-offset-2"
                  >
                    Plano no TSE · {document.plan_pages} p.
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                )}
              </header>

              {own.length > 0 && document && (
                <p className="mt-2 rounded-xl bg-[#f7f5f2] px-3 py-2 text-[13px] leading-relaxed text-ink-soft">
                  {literal ? (
                    <>
                      As propostas listadas foram copiadas de{' '}
                      <strong className="text-ink">{hostOf(document.extraction_source_url)}</strong>.{' '}
                      <strong className="text-ink">{inPlan} de {own.length}</strong> têm trecho localizado no plano do
                      TSE{related > 0 && <> e <strong className="text-ink">{related}</strong> têm o assunto localizado, sem os detalhes do site</>};
                      cada proposta indica a página.
                    </>
                  ) : (
                    <>
                      <strong className="text-ink">{inPlan} de {own.length}</strong> propostas listadas têm o trecho
                      original localizado no plano do TSE (fonte das propostas:{' '}
                      {hostOf(document.extraction_source_url)}).
                    </>
                  )}
                </p>
              )}

              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Palavras-chave do plano de ${candidate.name}`}>
                {list.map((k) => (
                  <li key={k.term}>
                    <button
                      type="button"
                      onClick={() => onPick(k.term)}
                      title={`${k.occurrences} ocorrências em ${k.pages.length} páginas`}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-3 py-1 text-xs font-semibold text-[#1B623A] transition-colors hover:border-[#1B623A]/40 hover:bg-[#EDDBBA]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]"
                    >
                      {k.term}
                      <span className="tabular-nums text-[11px] font-bold text-ink-soft">{k.occurrences}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <details className="mt-3 text-[13px]">
                <summary className="cursor-pointer text-xs font-bold text-[#1B623A]">Ver páginas de cada expressão</summary>
                <ul className="mt-2 space-y-1 text-ink-soft">
                  {list.map((k) => (
                    <li key={k.term}>
                      <span className="font-semibold text-ink">{k.term}</span>: p. <PageLinks externalId={externalId} pages={k.pages} />
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          );
        })}
      </div>

      {shared.length > 0 && analysed.length > 1 && (
        <div className="mt-4 rounded-2xl border border-[#e0d6c4] bg-white p-4">
          <h3 className="text-xs font-black uppercase tracking-wide text-ink-soft">Nos dois planos</h3>
          <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
            {shared.map((k) => (
              <li key={k.term} className="flex items-baseline justify-between gap-3 border-b border-[#f3eee4] pb-1.5">
                <button
                  type="button"
                  onClick={() => onPick(k.term)}
                  className="text-left font-semibold text-[#1B623A] hover:underline"
                >
                  {k.term}
                </button>
                <span className="shrink-0 text-xs tabular-nums text-ink-soft">
                  {analysed.map((c) => `${c.name.split(' ')[0]} ${k.candidates[String(c.external_id)]?.occurrences ?? 0}`).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
        Análise do texto integral dos PDFs em {new Date(coverage.generated_at).toLocaleDateString('pt-BR')}. Contagens de
        palavras não indicam qual plano é melhor.
      </p>
    </section>
  );
}
