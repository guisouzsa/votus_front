import { ExternalLink } from 'lucide-react';
import type { IndexProposal } from '@/services/proposalComparisonService';
import Tag from './Tag';
import { coverage, excerptCheck } from './coverage';
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
 * fica visível no topo e não numa nota de rodapé.
 */
export default function SourcesPanel({
  candidates,
  proposals,
}: {
  candidates: ComparisonCandidate[];
  proposals: IndexProposal[];
}) {
  return (
    <section aria-labelledby="fontes-titulo" className="mt-5">
      <h2 id="fontes-titulo" className="text-sm font-black uppercase tracking-wide text-[#1B623A]">
        Fontes analisadas
      </h2>
      <p className="mt-1 text-[13px] text-ink-soft">
        A comparação inclui {candidates.length} {candidates.length === 1 ? 'candidato' : 'candidatos'}: os que tiveram
        o plano processado até agora. Os planos dos demais candidatos a Presidente estão no perfil de cada um, mas ainda
        não entram na comparação.
      </p>
      <ul className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {candidates.map((candidate) => {
          const document = coverage.documents[String(candidate.external_id)];
          const own = proposals.filter((p) => p.candidate_id === candidate.id);
          const checks = own.map((p) => excerptCheck(p, String(candidate.external_id)));
          const inPlan = checks.filter((c) => c.kind === 'plan').length;
          const pending = checks.filter((c) => c.kind === 'pending').length;
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
                    {own.length} no total · {inPlan} com trecho conferido no plano do TSE · {pending} com fonte pendente de
                    validação
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
