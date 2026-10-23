'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { THEME_GROUPS } from '@/data/proposalThemeGroups';
import Tag from './Tag';
import { coverage, coverageStatus, normalize, pdfPageUrl, type CoverageSubject } from './coverage';
import type { ComparisonCandidate } from './types';

function StatusTags({ subject, candidate }: { subject: CoverageSubject; candidate: ComparisonCandidate }) {
  const cell = subject.candidates[String(candidate.external_id)];
  const status = coverageStatus(cell);

  return (
    <div className="flex flex-wrap gap-1">
      {status === 'mentioned' && (
        <Tag tone="mentioned">
          Mencionado no plano · {cell!.plan_pages.length} {cell!.plan_pages.length === 1 ? 'página' : 'páginas'}
        </Tag>
      )}
      {status === 'not_found' && <Tag tone="notFound">Não localizado na análise</Tag>}
      {status === 'unverified' && <Tag tone="neutral">Cobertura não verificada</Tag>}
      {cell && cell.stored_proposal_ids.length > 0 && (
        <Tag tone="verified">
          {cell.stored_proposal_ids.length} {cell.stored_proposal_ids.length === 1 ? 'proposta identificada' : 'propostas identificadas'}
        </Tag>
      )}
    </div>
  );
}

function SubjectDetail({ subject, candidates }: { subject: CoverageSubject; candidates: ComparisonCandidate[] }) {
  return (
    <div className="space-y-3 bg-[#fbfaf7] px-3 py-3 text-[13px]">
      <p className="text-ink-soft">
        Termos buscados: <span className="font-semibold text-ink">{subject.terms.join(', ')}</span>
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {candidates.map((candidate) => {
          const cell = subject.candidates[String(candidate.external_id)];
          const document = coverage.documents[String(candidate.external_id)];

          return (
            <div key={candidate.id}>
              <p className="font-bold text-ink">{candidate.name}</p>
              {!cell ? (
                <p className="mt-1 text-ink-soft">Este plano não foi analisado.</p>
              ) : cell.plan_pages.length === 0 ? (
                <p className="mt-1 text-ink-soft">
                  Nenhum dos termos aparece no plano registrado no TSE. Isso não prova que o assunto está ausente: o plano
                  pode tratá-lo com outras palavras.
                </p>
              ) : (
                <>
                  <ul className="mt-1 space-y-2">
                    {cell.excerpts.map((excerpt) => (
                      <li key={excerpt.page}>
                        <blockquote className="border-l-4 border-[#1B623A]/30 pl-2.5 italic leading-relaxed text-ink">
                          {excerpt.text}
                        </blockquote>
                        {pdfPageUrl(document, excerpt.page) && (
                          <a
                            href={pdfPageUrl(document, excerpt.page)!}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#1B623A] underline underline-offset-2"
                          >
                            Plano do TSE, p. {excerpt.page}
                            <ExternalLink size={11} aria-hidden="true" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                  {cell.plan_pages.length > cell.excerpts.length && (
                    <p className="mt-1.5 text-xs text-ink-soft">Também nas páginas {cell.plan_pages.slice(cell.excerpts.length).join(', ')}.</p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Matriz de cobertura: assuntos x planos registrados no TSE. Mostra se o
 * assunto é mencionado no documento (com trecho e página) e se o Votus
 * extraiu propostas sobre ele — duas coisas diferentes.
 */
export default function SubjectCoverage({
  candidates,
  query,
}: {
  candidates: ComparisonCandidate[];
  query: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  // Grupos fechados de saída (menos o primeiro), para não despejar 27
  // assuntos de uma vez; numa busca, os grupos com resultado ficam abertos.
  const [openGroups, setOpenGroups] = useState<string[]>([THEME_GROUPS[0].key]);
  const q = normalize(query.trim());
  const allOpen = openGroups.length === THEME_GROUPS.length;
  const toggleGroup = (key: string) =>
    setOpenGroups(openGroups.includes(key) ? openGroups.filter((k) => k !== key) : [...openGroups, key]);

  const subjects = q
    ? coverage.subjects.filter((s) => normalize(s.label).includes(q) || s.terms.some((t) => t.includes(q) || q.includes(t)))
    : coverage.subjects;

  if (subjects.length === 0) return null;

  return (
    <section id="assuntos-mencionados" aria-labelledby="assuntos-titulo" className="mt-8">
      <h2 id="assuntos-titulo" className="text-sm font-black uppercase tracking-wide text-[#1B623A]">
        Assuntos mencionados nos planos oficiais
      </h2>
      <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-soft">
        Busca de termos no texto integral dos planos registrados no TSE, sem contar sumário e índice. “Mencionado” quer
        dizer apenas que o assunto aparece no documento, inclusive em diagnósticos; isso não significa que exista uma proposta sobre ele.
        Abra um assunto para ver os trechos e as páginas.
      </p>
      {!q && (
        <button
          type="button"
          onClick={() => setOpenGroups(allOpen ? [] : THEME_GROUPS.map((g) => g.key))}
          className="mt-2 text-xs font-bold text-[#1B623A] underline underline-offset-2"
        >
          {allOpen ? 'Fechar todas as áreas' : 'Abrir todas as áreas'}
        </button>
      )}

      <div className="mt-3 overflow-hidden rounded-xl border border-[#e0d6c4] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="hidden bg-[#f7f5f2] text-xs uppercase text-ink-soft md:table-header-group">
            <tr>
              <th scope="col" className="px-3 py-2 font-bold">Assunto</th>
              {candidates.map((c) => (
                <th key={c.id} scope="col" className="px-3 py-2 font-bold">{c.name}</th>
              ))}
            </tr>
          </thead>
          {THEME_GROUPS.map((group) => {
            const rows = subjects.filter((s) => s.group === group.key);
            if (rows.length === 0) return null;
            const groupOpen = Boolean(q) || openGroups.includes(group.key);

            return (
              <tbody key={group.key} className="border-t border-[#e0d6c4]">
                <tr className="block md:table-row">
                  <th colSpan={candidates.length + 1} scope="rowgroup" className="block bg-[#fbfaf7] px-3 py-1.5 md:table-cell">
                    <button
                      type="button"
                      aria-expanded={groupOpen}
                      disabled={Boolean(q)}
                      onClick={() => toggleGroup(group.key)}
                      className="inline-flex items-start gap-1 text-left text-[11px] font-bold uppercase tracking-wide text-ink-soft hover:text-[#1B623A]"
                    >
                      <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${groupOpen ? 'rotate-180' : ''}`} />
                      {group.label}
                      <span className="font-normal normal-case">
                        ({rows.length} {rows.length === 1 ? 'assunto' : 'assuntos'})
                      </span>
                    </button>
                  </th>
                </tr>
                {groupOpen && rows.map((subject) => {
                  const isOpen = open === subject.slug;

                  return [
                    <tr key={subject.slug} className="block border-t border-[#efe8da] align-top md:table-row">
                      <th scope="row" className="block px-3 py-2 font-semibold md:table-cell">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpen(isOpen ? null : subject.slug)}
                          className="inline-flex items-start gap-1 text-left text-ink hover:text-[#1B623A]"
                        >
                          <ChevronDown size={16} aria-hidden="true" className={`mt-0.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          {subject.label}
                        </button>
                      </th>
                      {candidates.map((candidate) => (
                        <td key={candidate.id} className="block px-3 pb-2 md:table-cell md:py-2">
                          <span className="mb-0.5 block text-[11px] font-bold text-ink-soft md:hidden">{candidate.name}</span>
                          <StatusTags subject={subject} candidate={candidate} />
                        </td>
                      ))}
                    </tr>,
                    isOpen ? (
                      <tr key={`${subject.slug}-detalhe`} className="block md:table-row">
                        <td colSpan={candidates.length + 1} className="block md:table-cell">
                          <SubjectDetail subject={subject} candidates={candidates} />
                        </td>
                      </tr>
                    ) : null,
                  ];
                })}
              </tbody>
            );
          })}
        </table>
      </div>
    </section>
  );
}
