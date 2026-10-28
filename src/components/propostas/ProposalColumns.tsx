import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import ElectionResultBadge from '@/components/ElectionResultBadge';
import type { IndexProposal } from '@/services/proposalComparisonService';
import type { ElectionResult } from '@/services/types';
import Tag from './Tag';
import { candidateColors } from './candidateColors';
import { DOCUMENT_STATUS_LABELS, coverage, documentStatus, isPossibleDuplicate, pdfPageUrl } from './coverage';
import type { ComparisonCandidate } from './types';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function ProposalItem({
  proposal,
  candidate,
  themeName,
}: {
  proposal: IndexProposal;
  candidate: ComparisonCandidate;
  themeName: string | null;
}) {
  const externalId = String(candidate.external_id);
  const status = documentStatus(proposal, externalId);
  const document = coverage.documents[externalId];
  const literal = proposal.extraction === 'literal';
  const pageLink = (page: number) => pdfPageUrl(document, page) ?? '#';

  return (
    <li className="border-t border-[#efe8da] pt-3 first:border-t-0 first:pt-0">
      {themeName && <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">{themeName}</p>}
      <h4 className="mt-0.5 break-words text-sm font-bold leading-snug text-ink">{proposal.title}</h4>

      <dl className="mt-1.5 space-y-2 text-[13px] leading-relaxed">
        <div>
          <dt className="text-[11px] font-bold uppercase text-ink-soft/80">
            {literal ? `Texto do site (copiado de ${hostOf(proposal.source_url)})` : 'Resumo (IA)'}
          </dt>
          <dd className="break-words text-ink-soft">{proposal.description}</dd>
        </div>

        {proposal.source_excerpt && (
          <div>
            <dt className="text-[11px] font-bold uppercase text-ink-soft/80">Trecho original da fonte</dt>
            <dd>
              <blockquote className="break-words border-l-4 border-[#1B623A]/30 pl-2.5 italic text-ink">“{proposal.source_excerpt}”</blockquote>
            </dd>
          </div>
        )}

        <div>
          <dt className="text-[11px] font-bold uppercase text-ink-soft/80">Plano de governo registrado no TSE</dt>
          <dd className="mt-1 space-y-1.5">
            {status.kind === 'located' && (
              <>
                <a href={pageLink(status.page)} target="_blank" rel="noreferrer noopener" className="inline-flex rounded-full">
                  <Tag tone="verified" title={status.how === 'exact' ? 'Mesmo texto encontrado automaticamente no PDF' : 'Trecho conferido na página do PDF'}>
                    {DOCUMENT_STATUS_LABELS.located}, p. {status.page}
                  </Tag>
                </a>
                {status.quote && status.how === 'review' && (
                  <blockquote className="break-words border-l-4 border-[#1B623A]/30 pl-2.5 italic text-ink">“{status.quote}”</blockquote>
                )}
              </>
            )}
            {status.kind === 'related' && (
              <>
                <a href={pageLink(status.page)} target="_blank" rel="noreferrer noopener" className="inline-flex rounded-full">
                  <Tag tone="mentioned" title="O plano trata do assunto, mas sem o nome do programa, números ou metas citados acima">
                    {DOCUMENT_STATUS_LABELS.related}, p. {status.page}
                  </Tag>
                </a>
                {status.quote && (
                  <blockquote className="break-words border-l-4 border-[#e0d6c4] pl-2.5 italic text-ink">“{status.quote}”</blockquote>
                )}
              </>
            )}
            {status.kind === 'not_found' && (
              <p className="flex flex-wrap items-center gap-1.5">
                <Tag tone="notFound" title="A busca no plano não achou trecho correspondente. Isso não prova que o plano ignora o assunto.">
                  {DOCUMENT_STATUS_LABELS.not_found}
                </Tag>
                {status.closest && (
                  <a
                    href={pageLink(status.closest.page)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs font-semibold text-[#1B623A] underline underline-offset-2"
                    title="Página com mais palavras em comum: um ponto de partida para conferir, não uma confirmação."
                  >
                    Página mais parecida: p. {status.closest.page} ({status.closest.sharedPct}% das palavras)
                  </a>
                )}
              </p>
            )}
            {status.kind === 'unverified' && (
              <Tag tone="pending" title="Não há trecho literal nem conferência registrada para esta proposta">
                {DOCUMENT_STATUS_LABELS.unverified}
              </Tag>
            )}
            {status.kind === 'no_document' && (
              <Tag tone="neutral" title="O plano deste candidato ainda não foi analisado pelo Votus">
                {DOCUMENT_STATUS_LABELS.no_document}
              </Tag>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {isPossibleDuplicate(proposal) && <Tag tone="pending">Possível duplicata</Tag>}
        <a
          href={proposal.source_url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-w-0 items-center gap-1 break-all text-xs font-semibold text-[#1B623A] underline underline-offset-2"
        >
          Fonte da proposta: {hostOf(proposal.source_url)}
          <ExternalLink size={11} aria-hidden="true" className="shrink-0" />
        </a>
      </div>
    </li>
  );
}

/**
 * Propostas filtradas, uma coluna por candidato (lado a lado no desktop,
 * empilhadas no celular). A coluna existe mesmo sem proposta, com o motivo.
 */
export default function ProposalColumns({
  candidates,
  proposals,
  themeNames,
  highlightExternalId,
  emptyHint,
  showTheme = true,
  electionResults = {},
}: {
  candidates: ComparisonCandidate[];
  proposals: IndexProposal[];
  themeNames: Record<string, string>;
  highlightExternalId: string | null;
  emptyHint: string;
  /** Rótulo do tema em cada proposta — desnecessário quando um só tema está filtrado. */
  showTheme?: boolean;
  /** Resultado oficial (TSE) por external_id, quando disponível. */
  electionResults?: Record<string, ElectionResult>;
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${candidates.length > 1 ? 'lg:grid-cols-2' : ''}`}>
      {candidates.map((candidate) => {
        const own = proposals.filter((p) => p.candidate_id === candidate.id);
        const highlighted = highlightExternalId === String(candidate.external_id);
        const cores = candidateColors(candidate.name);
        const result = electionResults[String(candidate.external_id)];

        return (
          <section
            key={candidate.id}
            aria-labelledby={`coluna-${candidate.id}`}
            className={`min-w-0 rounded-2xl border border-t-4 bg-white p-4 border-x-[#e0d6c4] border-b-[#e0d6c4] ${cores.borda} ${highlighted ? 'ring-2 ring-[#1B623A]/20' : ''}`}
          >
            <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-[#e0d6c4] pb-2.5">
              <div className="min-w-0">
                <h3 id={`coluna-${candidate.id}`} className={`break-words text-base font-black ${cores.texto}`}>
                  {candidate.name}
                  {candidate.party && <span className="ml-1.5 text-sm font-bold text-ink-soft">({candidate.party})</span>}
                </h3>
                {result && (
                  <div className="mt-1">
                    <ElectionResultBadge result={result} />
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-ink-soft">
                {own.length} {own.length === 1 ? 'proposta' : 'propostas'}
                {' · '}
                <Link href={`/CandidatosPage/presidente/${candidate.external_id}`} className="text-[#1B623A] underline underline-offset-2">
                  Ver perfil
                </Link>
              </span>
            </header>

            {own.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">{emptyHint}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {own.map((proposal, index) => (
                  <ProposalItem
                    key={proposal.id ?? `${proposal.theme_slug}-${index}`}
                    proposal={proposal}
                    candidate={candidate}
                    themeName={showTheme ? themeNames[proposal.theme_slug] ?? proposal.theme_slug : null}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
