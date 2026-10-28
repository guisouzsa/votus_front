import type { ReactNode } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { IndexProposal } from '@/services/proposalComparisonService';
import Tag from './Tag';
import { DOCUMENT_STATUS_LABELS, coverage, documentStatus, type DocumentStatusKind } from './coverage';
import type { ComparisonCandidate } from './types';

function formatDate(httpDate: string | null): string | null {
  if (!httpDate) return null;
  const date = new Date(httpDate);

  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('pt-BR');
}

function hostAndPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '') + parsed.pathname.replace(/\/$/, '');
  } catch {
    return url;
  }
}

/**
 * Qual documento foi usado para cada candidato. A diferença de fonte muda a
 * leitura de todo o resto (quantidade de propostas, temas cobertos), por isso
 * os documentos e critérios ficam acessíveis no fim da comparação.
 */
export default function SourcesPanel({
  candidates,
  proposals,
  methodology,
}: {
  candidates: ComparisonCandidate[];
  proposals: IndexProposal[];
  methodology: ReactNode;
}) {
  return (
    <section id="fontes-e-metodologia" aria-labelledby="fontes-metodologia-titulo" className="mt-10 space-y-3">
      <h2 id="fontes-metodologia-titulo" className="text-sm font-black uppercase tracking-wide text-[#1B623A]">
        Fontes e metodologia
      </h2>
      <details id="fontes-analisadas" className="rounded-2xl border border-[#e0d6c4] bg-white">
        <summary className="group flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]">
          Fontes analisadas
          <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-[#1B623A] transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-[#e0d6c4] p-3 sm:p-4">
          <p className="text-[13px] text-ink-soft">
            A comparação inclui {candidates.length} {candidates.length === 1 ? 'candidato' : 'candidatos'}: os que tiveram
            o plano processado até agora. Os planos dos demais candidatos a Presidente estão no perfil de cada um, mas ainda
            não entram na comparação.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {candidates.map((candidate) => {
          const document = coverage.documents[String(candidate.external_id)];
          const own = proposals.filter((p) => p.candidate_id === candidate.id);
          const kinds = own.map((p) => documentStatus(p, String(candidate.external_id)).kind);
          const count = (kind: DocumentStatusKind) => kinds.filter((k) => k === kind).length;
          const sourceMatchesPlan = document ? document.extraction_source_text_found_in_plan_pct >= 80 : null;

          return (
            <li key={candidate.id} className="rounded-xl border border-[#e0d6c4] bg-white p-3.5 text-sm">
              <p className="font-black text-ink">
                {candidate.name}
                {candidate.party && <span className="ml-1 font-bold text-ink-soft">({candidate.party})</span>}
              </p>

              <dl className="mt-2 space-y-1.5 text-[13px] leading-snug">
                <div>
                  <dt className="font-bold text-ink-soft">Plano de governo registrado no TSE</dt>
                  <dd>
                    {document || candidate.plan_document_url ? (
                      <a
                        href={document?.plan_pdf_url ?? candidate.plan_document_url!}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 font-semibold text-[#1B623A] underline underline-offset-2"
                      >
                        Abrir o PDF
                        {document && ` (${document.plan_pages} páginas com texto)`}
                        <ExternalLink size={11} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-ink-soft">Documento não localizado no Votus.</span>
                    )}
                    {formatDate(document?.plan_pdf_last_modified ?? null) && (
                      <span className="text-ink-soft"> · cópia de {formatDate(document!.plan_pdf_last_modified)}</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="font-bold text-ink-soft">Propostas extraídas de</dt>
                  <dd>
                    {document ? (
                      <>
                        <a
                          href={document.extraction_source_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="break-all font-semibold text-[#1B623A] underline underline-offset-2"
                        >
                          {hostAndPath(document.extraction_source_url)}
                        </a>
                        <div className="mt-1">
                          {sourceMatchesPlan ? (
                            <Tag tone="verified">
                              {document.extraction_source_text_found_in_plan_pct}% do texto igual ao plano do TSE
                            </Tag>
                          ) : (
                            <Tag tone="pending" title="Comparação por sequências de 8 palavras">
                              Página de campanha: o texto não coincide com o plano do TSE
                            </Tag>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-ink-soft">Fonte da extração não verificada.</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="font-bold text-ink-soft">Propostas extraídas pelo Votus</dt>
                  <dd className="text-ink">
                    {own.length} no total
                    {(['located', 'related', 'not_found', 'unverified', 'no_document'] as const)
                      .filter((kind) => count(kind) > 0)
                      .map((kind) => ` · ${count(kind)} ${DOCUMENT_STATUS_LABELS[kind].toLowerCase()}`)
                      .join('')}
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
          </ul>
        </div>
      </details>
      <details className="rounded-2xl border border-[#e0d6c4] bg-white">
        <summary className="group flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]">
          Como esta comparação foi feita
          <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-[#1B623A] transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-[#e0d6c4] p-3 sm:p-4">{methodology}</div>
      </details>
    </section>
  );
}
