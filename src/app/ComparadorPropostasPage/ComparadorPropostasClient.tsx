'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeft, ChevronDown, RotateCcw, Search, Sparkles } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import PageHeader from '@/components/PageHeader';
import ComparadorSkeleton from '@/components/propostas/ComparadorSkeleton';
import ProposalColumns from '@/components/propostas/ProposalColumns';
import SourcesPanel from '@/components/propostas/SourcesPanel';
import SubjectCoverage from '@/components/propostas/SubjectCoverage';
import { coverage, excerptCheck, normalize } from '@/components/propostas/coverage';
import type { ComparisonCandidate } from '@/components/propostas/types';
import { OTHER_GROUP, THEME_GROUPS, groupOfTheme } from '@/data/proposalThemeGroups';
import { getProposalIndex, getProposalTheme, type ProposalIndex } from '@/services/proposalComparisonService';

// Filtros na URL (?busca=sus&tema=saude&candidato=...&situacao=...&de=...):
// voltar de um perfil reabre a comparação como estava, e o link pode ser
// compartilhado. Mesmo padrão de CandidatosListClient.
const EVENTO_URL = 'votus:comparador-url';

function assinarUrl(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener(EVENTO_URL, callback);

  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(EVENTO_URL, callback);
  };
}

const lerQueryAtual = () => window.location.search;
const lerQueryServidor = () => '';

interface Filtros {
  busca: string;
  tema: string; // '' | 'grupo:<chave>' | '<slug do tema>'
  candidato: string; // external_id
  situacao: '' | 'plano' | 'pendente';
}

const CAMPOS: (keyof Filtros)[] = ['busca', 'tema', 'candidato', 'situacao'];

function lerFiltros(query: string): Filtros & { de: string } {
  const params = new URLSearchParams(query);
  const situacao = params.get('situacao');

  return {
    busca: params.get('busca') ?? '',
    tema: params.get('tema') ?? '',
    candidato: params.get('candidato') ?? '',
    situacao: situacao === 'plano' || situacao === 'pendente' ? situacao : '',
    de: params.get('de') ?? '',
  };
}

function coresDoCandidato(name: string) {
  const nome = normalize(name);
  if (nome.includes('bolsonaro')) return { texto: 'text-brasil-green', barra: 'bg-brasil-green' };
  if (nome.includes('lula')) return { texto: 'text-brasil-red', barra: 'bg-brasil-red' };
  return { texto: 'text-ink-soft', barra: 'bg-ink-soft' };
}

function gravarFiltros(filtros: Filtros, de: string) {
  const params = new URLSearchParams();
  for (const campo of CAMPOS) if (filtros[campo]) params.set(campo, filtros[campo]);
  if (de) params.set('de', de);

  const query = params.toString();
  window.history.replaceState(window.history.state, '', query ? `?${query}` : window.location.pathname);
  window.dispatchEvent(new Event(EVENTO_URL));
}

function useCandidatos(index: ProposalIndex | undefined): ComparisonCandidate[] {
  return useMemo(() => {
    const lista: ComparisonCandidate[] = (index?.candidates ?? []).map((c) => ({ ...c, external_id: String(c.external_id) }));
    // Plano analisado sem candidato no índice (sem proposta, ou endpoint
    // agregado ainda não publicado): a coluna aparece mesmo assim.
    Object.entries(coverage.documents).forEach(([externalId, document], i) => {
      if (!lista.some((c) => c.external_id === externalId)) {
        lista.push({ id: -(i + 1), external_id: externalId, name: document.name, party: null, plan_document_url: document.plan_pdf_url });
      }
    });

    return lista.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [index]);
}

function AiComparison({ slug }: { slug: string }) {
  const { data, error, isLoading } = useSWR(['proposal-theme', slug], () => getProposalTheme(slug).then((r) => r.data), {
    revalidateOnFocus: false,
  });
  const comparison = data?.comparison;

  if (isLoading) {
    return (
      <div role="status" className="animate-pulse space-y-2 rounded-2xl border border-[#e0d6c4] bg-white p-4">
        <p className="text-xs font-semibold text-ink-soft">Carregando resumo comparativo...</p>
        <div className="h-3 w-11/12 rounded bg-[#eee6d8]" />
        <div className="h-3 w-4/5 rounded bg-[#eee6d8]" />
        <div className="h-3 w-2/3 rounded bg-[#eee6d8]" />
      </div>
    );
  }
  if (error || !comparison) return null;

  return (
    <details open className="rounded-2xl border border-[#e0d6c4] bg-white p-4">
      <summary className="flex cursor-pointer flex-wrap items-center gap-2">
        <span className="text-sm font-black uppercase tracking-wide text-[#1B623A]">Resumo comparativo do tema</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#EDDBBA]/60 px-2 py-0.5 text-[10px] font-bold uppercase text-[#6b4f1d]">
          <Sparkles size={11} aria-hidden="true" /> Gerado por IA
        </span>
      </summary>
      <p className="mt-2 text-sm leading-relaxed text-ink">{comparison.summary}</p>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          { titulo: 'Pontos em comum', itens: comparison.similarities },
          { titulo: 'Diferenças', itens: comparison.differences },
        ].map(({ titulo, itens }) => (
          <div key={titulo}>
            <h3 className="text-xs font-bold uppercase text-ink-soft">{titulo}</h3>
            {itens.length > 0 ? (
              <ul className="mt-1 list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-ink">
                {itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[13px] text-ink-soft">Nenhum item apontado.</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft">
        Texto descritivo gerado só a partir das propostas extraídas listadas abaixo; não avalia qual é melhor. Quando
        diz que um candidato “não menciona” algo, significa que nenhuma proposta extraída trata disso — não que o plano
        registrado no TSE não trate. Confira os trechos originais e “Assuntos nos planos oficiais”.
      </p>
    </details>
  );
}

export default function ComparadorPropostasClient({ initialIndex }: { initialIndex?: ProposalIndex }) {
  const { data: index, error, isLoading, isValidating, mutate } = useSWR('proposal-index', getProposalIndex, {
    fallbackData: initialIndex,
    revalidateOnFocus: false,
    revalidateIfStale: !initialIndex,
  });

  const query = useSyncExternalStore(assinarUrl, lerQueryAtual, lerQueryServidor);
  const { de, ...filtros } = useMemo(() => lerFiltros(query), [query]);
  const [gruposAbertos, setGruposAbertos] = useState<string[]>([]);

  const candidatos = useCandidatos(index);
  const themeNames = useMemo(() => Object.fromEntries((index?.themes ?? []).map((t) => [t.slug, t.name])), [index]);
  const candidatoDeOrigem = candidatos.find((c) => c.external_id === de);
  const externalIdPorId = useMemo(
    () => Object.fromEntries(candidatos.map((c) => [c.id, c.external_id])) as Record<number, string>,
    [candidatos],
  );

  const atualizar = (campo: keyof Filtros, valor: string) => gravarFiltros({ ...filtros, [campo]: valor }, de);
  const limpar = () => gravarFiltros({ busca: '', tema: '', candidato: '', situacao: '' }, de);
  const temFiltro = CAMPOS.some((campo) => filtros[campo]);

  const temaSelecionado = filtros.tema && !filtros.tema.startsWith('grupo:') ? filtros.tema : null;
  const grupoSelecionado = filtros.tema.startsWith('grupo:') ? filtros.tema.slice(6) : null;

  const candidatosVisiveis = filtros.candidato ? candidatos.filter((c) => c.external_id === filtros.candidato) : candidatos;

  const filtradas = useMemo(() => {
    const termo = normalize(filtros.busca.trim());

    return (index?.proposals ?? []).filter((p) => {
      if (temaSelecionado && p.theme_slug !== temaSelecionado) return false;
      if (grupoSelecionado && groupOfTheme(p.theme_slug).key !== grupoSelecionado) return false;
      if (filtros.situacao) {
        const kind = excerptCheck(p, externalIdPorId[p.candidate_id] ?? '').kind;
        if (filtros.situacao === 'plano' && kind !== 'plan') return false;
        if (filtros.situacao === 'pendente' && kind !== 'pending') return false;
      }
      if (termo && !normalize(`${p.title} ${p.description} ${p.source_excerpt ?? ''} ${themeNames[p.theme_slug] ?? ''}`).includes(termo)) {
        return false;
      }
      return true;
    });
  }, [index, filtros.busca, filtros.situacao, temaSelecionado, grupoSelecionado, themeNames, externalIdPorId]);

  // Visão geral: propostas extraídas por área e candidato.
  const porGrupo = useMemo(() => {
    const grupos = [...THEME_GROUPS, OTHER_GROUP].map((group) => {
      const temas = (index?.themes ?? []).filter((t) => groupOfTheme(t.slug).key === group.key);
      const contagem = (candidateId: number, slug?: string) =>
        (index?.proposals ?? []).filter(
          (p) => p.candidate_id === candidateId && (slug ? p.theme_slug === slug : groupOfTheme(p.theme_slug).key === group.key),
        ).length;

      return { group, temas, contagem };
    });

    return grupos.filter((g) => g.temas.length > 0);
  }, [index]);

  const resumoResultados = candidatosVisiveis
    .map((c) => `${filtradas.filter((p) => p.candidate_id === c.id).length} de ${c.name}`)
    .join(' e ');

  const methodology = (
    <div className="space-y-2 text-sm leading-relaxed text-ink-soft">
      <p>
        <strong className="text-ink">Uso de IA.</strong> As propostas foram extraídas das fontes oficiais de cada
        candidato e organizadas por tema com auxílio de inteligência artificial. Os resumos são descritivos e não indicam
        qual proposta é melhor. A extração e a classificação podem conter erros: consulte sempre o trecho original e a
        fonte.
      </p>
      <p>
        <strong className="text-ink">Propostas.</strong> Uma IA lê a página de origem de cada candidato, separa as
        propostas, escreve um resumo de até duas frases e indica um trecho literal. Se o trecho não existe no texto de
        origem, ele é descartado e a proposta fica como “Fonte pendente de validação”.
      </p>
      <p>
        <strong className="text-ink">Conferência.</strong> Cada trecho foi procurado no plano registrado no TSE.
        “Trecho conferido no plano do TSE” traz a página; “Trecho conferido só na página de origem” indica que ele não
        está no plano do TSE.
      </p>
      <p>
        <strong className="text-ink">Contagens.</strong> Os números são de propostas extraídas pelo Votus, não de
        páginas nem de ocorrências de palavras. Não medem prioridade, compromisso ou qualidade — e dependem do tamanho
        de cada fonte.
      </p>
      <p>
        <strong className="text-ink">Assuntos nos planos oficiais.</strong> {coverage.method.unit}; {coverage.method.search}.
        Análise feita em {new Date(coverage.generated_at).toLocaleDateString('pt-BR')}. Páginas sem texto extraível
        (imagens) não puderam ser analisadas.
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 overflow-x-hidden overflow-y-auto">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-4 py-8 sm:px-10">
          <Link
            href={candidatoDeOrigem ? `/CandidatosPage/presidente/${candidatoDeOrigem.external_id}` : '/CandidatosPage/presidente'}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1B623A]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {candidatoDeOrigem ? `Voltar ao perfil de ${candidatoDeOrigem.name}` : 'Candidatos a Presidente'}
          </Link>

          <PageHeader
            eyebrow="Eleições 2026"
            title="Compare as propostas para Presidente"
            description="Compare propostas, trechos originais e fontes oficiais, tema a tema."
            compact
            note={
              <>
                A IA pode errar; confira os trechos. Fontes variam: veja{' '}
                <a href="#fontes-analisadas" className="font-bold text-[#1B623A] underline underline-offset-2">
                  Fontes analisadas
                </a>
              </>
            }
          />

          {isLoading && !index ? (
            <ComparadorSkeleton />
          ) : error && !index ? (
            <div role="alert" className="mt-6 rounded-2xl border border-[#e0d6c4] bg-white p-5 text-sm">
              <p className="font-semibold text-[#8d0801]">Não foi possível carregar as propostas agora.</p>
              <p className="mt-1 text-ink-soft">Pode ser uma instabilidade momentânea do servidor.</p>
              <button
                type="button"
                onClick={() => mutate()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1B623A] px-4 py-2 text-xs font-bold text-white hover:bg-[#164f30]"
              >
                <RotateCcw size={14} aria-hidden="true" /> Tentar novamente
              </button>
            </div>
          ) : index && index.proposals.length === 0 ? (
            <p role="status" className="mt-6 rounded-2xl border border-[#e0d6c4] bg-white p-5 text-sm text-ink-soft">
              Ainda não há propostas processadas. Elas aparecem aqui depois que os planos de governo forem importados das
              fontes oficiais.
            </p>
          ) : (
            <>
              {/* Busca e filtros */}
              <section aria-labelledby="filtros-titulo" className="sticky top-0 z-30 mt-3 rounded-2xl border border-[#e0d6c4] bg-white p-3 shadow-sm sm:p-4">
                <h2 id="filtros-titulo" className="sr-only">Buscar e filtrar propostas</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
                  <label className="block text-xs font-bold uppercase text-ink-soft">
                    Buscar nas propostas
                    <span className="relative mt-1 block">
                      <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1B623A]" />
                      <input
                        type="search"
                        value={filtros.busca}
                        onChange={(e) => atualizar('busca', e.target.value)}
                        placeholder="Ex.: SUS, escola, livros"
                        className="h-10 w-full rounded-full border border-[#EDDBBA] bg-[#FDF8EE] py-2 pl-9 pr-4 text-sm font-normal normal-case text-[#1B623A] placeholder:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]"
                      />
                    </span>
                  </label>
                  <label className="block text-xs font-bold uppercase text-ink-soft">
                    Área ou tema
                    <select
                      value={filtros.tema}
                      onChange={(e) => atualizar('tema', e.target.value)}
                      className="mt-1 h-10 w-full rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-4 py-2 text-sm font-normal normal-case text-[#1B623A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]"
                    >
                      <option value="">Todas as áreas</option>
                      {porGrupo.map(({ group, temas }) => (
                        <optgroup key={group.key} label={group.label}>
                          <option value={`grupo:${group.key}`}>{group.label} (todos)</option>
                          {temas.map((t) => (
                            <option key={t.slug} value={t.slug}>{t.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-bold uppercase text-ink-soft">
                    Candidato
                    <select
                      value={filtros.candidato}
                      onChange={(e) => atualizar('candidato', e.target.value)}
                      className="mt-1 h-10 w-full rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-4 py-2 text-sm font-normal normal-case text-[#1B623A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]"
                    >
                      <option value="">Todos</option>
                      {candidatos.map((c) => (
                        <option key={c.external_id} value={c.external_id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-bold uppercase text-ink-soft">
                    Situação do trecho
                    <select
                      value={filtros.situacao}
                      onChange={(e) => atualizar('situacao', e.target.value)}
                      className="mt-1 h-10 w-full rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-4 py-2 text-sm font-normal normal-case text-[#1B623A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]"
                    >
                      <option value="">Todas</option>
                      <option value="plano">Conferido no plano do TSE</option>
                      <option value="pendente">Fonte pendente de validação</option>
                    </select>
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p aria-live="polite" className="min-w-0 text-sm text-ink-soft">
                    {temFiltro ? `Mostrando ${resumoResultados}.` : `${index?.proposals.length ?? 0} propostas em ${index?.themes.length ?? 0} temas.`}
                    {isValidating && ' Atualizando…'}
                  </p>
                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={limpar}
                      disabled={!temFiltro}
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#1B623A] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A] disabled:cursor-not-allowed disabled:text-ink-soft disabled:no-underline"
                    >
                      <RotateCcw size={14} aria-hidden="true" /> Limpar filtros
                    </button>
                    <FloatingAIButton placement="inline" />
                  </div>
                </div>
              </section>

              <section aria-labelledby="visao-geral-titulo" className="mt-6">
                <h2 id="visao-geral-titulo" className="text-sm font-black uppercase tracking-wide text-[#1B623A]">
                  Visão geral por área
                </h2>
                <p className="mt-1 text-[13px] text-ink-soft">
                  Número de propostas extraídas pelo Votus em cada área. Abra uma área para ver os temas, ou escolha
                  “Comparar” para ver as propostas lado a lado.
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  “0 propostas extraídas” não significa que o plano ignore o tema. Consulte{' '}
                  <a href="#assuntos-mencionados" className="font-semibold text-[#1B623A] underline underline-offset-2">
                    Assuntos mencionados nos planos oficiais
                  </a>.
                </p>
                <div className="mt-3 overflow-x-auto rounded-xl border border-[#e0d6c4] bg-white">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">Propostas extraídas por área e candidato</caption>
                    <thead className="bg-[#f7f5f2] text-xs uppercase text-ink-soft">
                      <tr>
                        <th scope="col" className="px-3 py-2 font-bold">Área</th>
                        {candidatos.map((c) => {
                          const cores = coresDoCandidato(c.name);
                          return (
                            <th key={c.id} scope="col" className={`px-3 py-2 text-center font-bold ${cores.texto}`}>
                              {c.name}
                            </th>
                          );
                        })}
                        <th scope="col" className="hidden px-3 py-2 sm:table-cell"><span className="sr-only">Ações</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {porGrupo.map(({ group, temas, contagem }) => {
                        const aberto = gruposAbertos.includes(group.key);
                        const maiorContagem = Math.max(0, ...candidatos.map((c) => contagem(c.id)));

                        return [
                          <tr key={group.key} className="border-t border-[#efe8da]">
                            <th scope="row" className="px-3 py-2 font-semibold">
                              <button
                                type="button"
                                aria-expanded={aberto}
                                onClick={() => setGruposAbertos(aberto ? gruposAbertos.filter((k) => k !== group.key) : [...gruposAbertos, group.key])}
                                className="inline-flex items-center gap-1 text-left text-ink hover:text-[#1B623A]"
                              >
                                <ChevronDown size={16} aria-hidden="true" className={`shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                                {group.label}
                                <span className="ml-1 hidden text-xs font-normal text-ink-soft sm:inline">
                                  ({temas.length} {temas.length === 1 ? 'tema' : 'temas'})
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => atualizar('tema', `grupo:${group.key}`)}
                                className="ml-5 mt-1 inline-flex min-h-9 items-center justify-center rounded-lg bg-[#1B623A] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#134A2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A] sm:hidden"
                              >
                                Comparar
                              </button>
                            </th>
                            {candidatos.map((c) => {
                              const quantidade = contagem(c.id);
                              const largura = maiorContagem > 0 ? (quantidade / maiorContagem) * 100 : 0;
                              const cores = coresDoCandidato(c.name);

                              return (
                                <td key={c.id} className="px-3 py-2 text-center tabular-nums">
                                  <span>{quantidade}</span>
                                  <span aria-hidden="true" className="mx-auto mt-1 block h-1.5 w-12 overflow-hidden rounded-full bg-line">
                                    <span className={`block h-full rounded-full ${cores.barra}`} style={{ width: `${largura}%` }} />
                                  </span>
                                </td>
                              );
                            })}
                            <td className="hidden px-3 py-2 text-right sm:table-cell">
                              <button
                                type="button"
                                onClick={() => atualizar('tema', `grupo:${group.key}`)}
                                className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#1B623A] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#134A2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]"
                              >
                                Comparar
                              </button>
                            </td>
                          </tr>,
                          aberto
                            ? temas.map((t) => (
                                <tr key={t.slug} className="border-t border-[#f3eee4] bg-[#fbfaf7]">
                                  <th scope="row" className="py-1.5 pl-9 pr-3 text-[13px] font-normal text-ink">
                                    {/* No celular a coluna "Comparar" some: o próprio nome do tema abre a comparação. */}
                                    <button
                                      type="button"
                                      onClick={() => atualizar('tema', t.slug)}
                                      className="text-left hover:text-[#1B623A] hover:underline"
                                    >
                                      {t.name}
                                    </button>
                                  </th>
                                  {candidatos.map((c) => (
                                    <td key={c.id} className="px-3 py-1.5 text-center text-[13px] tabular-nums text-ink-soft">{contagem(c.id, t.slug)}</td>
                                  ))}
                                  <td className="hidden px-3 py-1.5 text-right sm:table-cell">
                                    <button
                                      type="button"
                                      onClick={() => atualizar('tema', t.slug)}
                                      className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#1B623A] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#134A2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]"
                                    >
                                      Comparar
                                    </button>
                                  </td>
                                </tr>
                              ))
                            : null,
                        ];
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {temFiltro && (
                <section aria-labelledby="resultado-titulo" className="mt-6 space-y-4">
                  <h2 id="resultado-titulo" className="text-xl font-black text-[#1B623A]">
                    {temaSelecionado
                      ? themeNames[temaSelecionado] ?? temaSelecionado
                      : grupoSelecionado
                        ? [...THEME_GROUPS, OTHER_GROUP].find((g) => g.key === grupoSelecionado)?.label
                        : 'Resultado da busca'}
                  </h2>
                  {temaSelecionado && <AiComparison slug={temaSelecionado} />}
                  {filtradas.length === 0 && (
                    <p className="rounded-xl bg-[#f7f5f2] p-3 text-sm text-ink-soft">
                      Nenhuma proposta extraída corresponde a esses filtros. Revise a busca, tente um sinônimo ou veja
                      abaixo se o assunto aparece nos planos oficiais.
                    </p>
                  )}
                  <ProposalColumns
                    candidates={candidatosVisiveis}
                    proposals={filtradas}
                    themeNames={themeNames}
                    highlightExternalId={null}
                    showTheme={!temaSelecionado}
                    emptyHint="Nenhuma proposta extraída deste candidato com esses filtros. Isso não quer dizer que o plano não trate do assunto — veja “Assuntos nos planos oficiais”."
                  />
                </section>
              )}

              <SubjectCoverage candidates={candidatosVisiveis} query={filtros.busca} />
              <SourcesPanel candidates={candidatos} proposals={index?.proposals ?? []} methodology={methodology} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
