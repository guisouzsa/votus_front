'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeft, ChevronDown, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import InfoTooltip from '@/components/InfoTooltip';
import PageHeader from '@/components/PageHeader';
import SearchBar, { ClearFiltersButton, FilterSelect } from '@/components/SearchBar';
import PlanKeywords from '@/components/propostas/PlanKeywords';
import ComparadorSkeleton from '@/components/propostas/ComparadorSkeleton';
import ProposalColumns from '@/components/propostas/ProposalColumns';
import SourcesPanel from '@/components/propostas/SourcesPanel';
import SubjectCoverage from '@/components/propostas/SubjectCoverage';
import { candidateColors } from '@/components/propostas/candidateColors';
import {
  DOCUMENT_STATUS_LABELS,
  coverage,
  documentStatus,
  normalize,
  planReview,
  type DocumentStatusKind,
} from '@/components/propostas/coverage';
import type { ComparisonCandidate } from '@/components/propostas/types';
import { OTHER_GROUP, THEME_GROUPS, groupOfTheme } from '@/data/proposalThemeGroups';
import { getCandidates } from '@/services/candidatesService';
import { getProposalIndex, getProposalTheme, type ProposalIndex } from '@/services/proposalComparisonService';
import type { ElectionResult, ElectionResultStatus } from '@/services/types';

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

// Situação do trecho na URL ↔ estado documental (coverage.documentStatus).
const SITUACOES: Record<string, DocumentStatusKind> = {
  localizado: 'located',
  relacionado: 'related',
  'nao-localizado': 'not_found',
  'nao-verificado': 'unverified',
  'sem-documento': 'no_document',
};
// Links antigos (?situacao=plano|pendente) continuam valendo.
const SITUACOES_ANTIGAS: Record<string, string> = { plano: 'localizado', pendente: 'nao-verificado' };

interface Filtros {
  busca: string;
  tema: string; // '' | 'grupo:<chave>' | '<slug do tema>'
  candidato: string; // external_id
  situacao: string; // '' | chave de SITUACOES
}

const CAMPOS: (keyof Filtros)[] = ['busca', 'tema', 'candidato', 'situacao'];
const SEM_FILTROS: Filtros = { busca: '', tema: '', candidato: '', situacao: '' };

function lerFiltros(query: string): Filtros & { de: string } {
  const params = new URLSearchParams(query);
  const bruta = params.get('situacao') ?? '';
  const situacao = SITUACOES_ANTIGAS[bruta] ?? bruta;

  return {
    busca: params.get('busca') ?? '',
    tema: params.get('tema') ?? '',
    candidato: params.get('candidato') ?? '',
    situacao: situacao in SITUACOES ? situacao : '',
    de: params.get('de') ?? '',
  };
}

// Mesma ordem da lista de candidatos (CandidateService no backend):
// resultado confirmado primeiro; sem resultado, no fim. Empate: nome.
const ORDEM_RESULTADO: ElectionResultStatus[] = ['elected', 'runoff', 'not_elected', 'awaiting', 'unverified'];

function gravarFiltros(filtros: Filtros, de: string) {
  const params = new URLSearchParams();
  for (const campo of CAMPOS) if (filtros[campo]) params.set(campo, filtros[campo]);
  if (de) params.set('de', de);

  const query = params.toString();
  window.history.replaceState(window.history.state, '', query ? `?${query}` : window.location.pathname);
  window.dispatchEvent(new Event(EVENTO_URL));
}

function useCandidatos(index: ProposalIndex | undefined, resultados: Record<string, ElectionResult>): ComparisonCandidate[] {
  return useMemo(() => {
    const posicao = (c: ComparisonCandidate) => {
      const status = resultados[c.external_id]?.status;
      return status ? ORDEM_RESULTADO.indexOf(status) : ORDEM_RESULTADO.length;
    };
    const lista: ComparisonCandidate[] = (index?.candidates ?? []).map((c) => ({ ...c, external_id: String(c.external_id) }));
    // Plano analisado sem candidato no índice (sem proposta, ou endpoint
    // agregado ainda não publicado): a coluna aparece mesmo assim.
    Object.entries(coverage.documents).forEach(([externalId, document], i) => {
      if (!lista.some((c) => c.external_id === externalId)) {
        lista.push({ id: -(i + 1), external_id: externalId, name: document.name, party: null, plan_document_url: document.plan_pdf_url });
      }
    });

    return lista.sort((a, b) => posicao(a) - posicao(b) || a.name.localeCompare(b.name, 'pt-BR'));
  }, [index, resultados]);
}

// Resultado oficial (TSE) dos candidatos a Presidente, por external_id. Vem
// da listagem de candidatos; se falhar, a comparação segue em ordem alfabética.
function useResultados(): Record<string, ElectionResult> {
  const { data } = useSWR('president-candidates-results', () => getCandidates('presidente', 1), { revalidateOnFocus: false });

  return useMemo(
    () =>
      Object.fromEntries(
        (data?.data ?? []).filter((c) => c.election_result).map((c) => [String(c.id), c.election_result as ElectionResult]),
      ),
    [data],
  );
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
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const resultados = useResultados();
  const candidatos = useCandidatos(index, resultados);
  const themeNames = useMemo(() => Object.fromEntries((index?.themes ?? []).map((t) => [t.slug, t.name])), [index]);
  const candidatoDeOrigem = candidatos.find((c) => c.external_id === de);
  const externalIdPorId = useMemo(
    () => Object.fromEntries(candidatos.map((c) => [c.id, c.external_id])) as Record<number, string>,
    [candidatos],
  );

  const atualizar = (campo: keyof Filtros, valor: string) => gravarFiltros({ ...filtros, [campo]: valor }, de);
  const limpar = () => gravarFiltros(SEM_FILTROS, de);
  // "Comparar" (visão geral e atalhos de tema) abre a área do zero: sem isso
  // uma busca antiga continuava valendo e a área aparecia vazia mesmo com
  // propostas contadas na tabela.
  const compararTema = (tema: string) => {
    gravarFiltros({ ...SEM_FILTROS, tema }, de);
    requestAnimationFrame(() => document.getElementById('resultado-titulo')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const temFiltro = CAMPOS.some((campo) => filtros[campo]);
  const filtrosDoPainel = [filtros.tema, filtros.candidato, filtros.situacao].filter(Boolean).length;

  const temaSelecionado = filtros.tema && !filtros.tema.startsWith('grupo:') ? filtros.tema : null;
  const grupoSelecionado = filtros.tema.startsWith('grupo:') ? filtros.tema.slice(6) : null;

  const candidatosVisiveis = filtros.candidato ? candidatos.filter((c) => c.external_id === filtros.candidato) : candidatos;

  const filtradas = useMemo(() => {
    const termo = normalize(filtros.busca.trim());

    return (index?.proposals ?? []).filter((p) => {
      if (temaSelecionado && p.theme_slug !== temaSelecionado) return false;
      if (grupoSelecionado && groupOfTheme(p.theme_slug).key !== grupoSelecionado) return false;
      if (filtros.candidato && externalIdPorId[p.candidate_id] !== filtros.candidato) return false;
      if (filtros.situacao && documentStatus(p, externalIdPorId[p.candidate_id] ?? '').kind !== SITUACOES[filtros.situacao]) {
        return false;
      }
      if (termo && !normalize(`${p.title} ${p.description} ${p.source_excerpt ?? ''} ${themeNames[p.theme_slug] ?? ''}`).includes(termo)) {
        return false;
      }
      return true;
    });
  }, [index, filtros.busca, filtros.candidato, filtros.situacao, temaSelecionado, grupoSelecionado, themeNames, externalIdPorId]);

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

  // Temas em que todos os candidatos têm proposta: os que rendem comparação
  // lado a lado (e o resumo da IA, que só existe nesses casos).
  const temasComparaveis = useMemo(() => {
    const ids = candidatos.filter((c) => c.id > 0).map((c) => c.id);
    if (ids.length < 2) return [];

    return (index?.themes ?? []).filter((t) =>
      ids.every((id) => (index?.proposals ?? []).some((p) => p.candidate_id === id && p.theme_slug === t.slug)),
    );
  }, [index, candidatos]);

  // Palavra-chave clicada: vira a busca e a página sobe até o resultado.
  const buscarTermo = (termo: string) => {
    gravarFiltros({ ...filtros, busca: termo }, de);
    requestAnimationFrame(() => document.getElementById('resultado-titulo')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  // Contagem sempre a partir da lista realmente exibida.
  const porCandidato = candidatosVisiveis.map((c) => ({ candidato: c, total: filtradas.filter((p) => p.candidate_id === c.id).length }));
  const nomeDoTema = (tema: string) =>
    tema.startsWith('grupo:')
      ? [...THEME_GROUPS, OTHER_GROUP].find((g) => g.key === tema.slice(6))?.label ?? tema.slice(6)
      : themeNames[tema] ?? tema;
  const filtrosAtivos = [
    filtros.busca && `busca “${filtros.busca}”`,
    filtros.tema && nomeDoTema(filtros.tema),
    filtros.candidato && candidatos.find((c) => c.external_id === filtros.candidato)?.name,
    filtros.situacao && DOCUMENT_STATUS_LABELS[SITUACOES[filtros.situacao]].toLowerCase(),
  ].filter(Boolean) as string[];

  const methodology = (
    <div className="space-y-2 text-sm leading-relaxed text-ink-soft">
      <p>
        <strong className="text-ink">Uso de IA.</strong> As propostas foram extraídas das fontes oficiais de cada
        candidato e organizadas por tema com auxílio de inteligência artificial. Os resumos são descritivos e não indicam
        qual proposta é melhor. A extração e a classificação podem conter erros: consulte sempre o trecho original e a
        fonte.
      </p>
      <p>
        <strong className="text-ink">Propostas.</strong> Quando o site do candidato lista as propostas em formato
        estruturado, título e texto são copiados como estão, sem IA (“Texto do site (copiado)”). Nos demais casos, uma
        IA lê a página de origem, separa as propostas, escreve um resumo de até duas frases e indica um trecho literal;
        se o trecho não existe no texto de origem, ele é descartado e a proposta fica como “Fonte pendente de
        validação”.
      </p>
      <p>
        <strong className="text-ink">Conferência no plano do TSE.</strong> Cada trecho (ou, no texto copiado, o título e
        o texto) foi procurado automaticamente no PDF registrado no TSE. Nas propostas copiadas do site sem texto igual,
        o Votus revisou o PDF buscando nomes de programas, números e palavras de cada proposta (revisão em{' '}
        {new Date(`${planReview.reviewed_at}T12:00:00`).toLocaleDateString('pt-BR')}); o trecho citado foi conferido na
        página indicada. As páginas são as do visualizador de PDF, que nesses dois planos coincidem com a numeração
        impressa.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li><strong className="text-ink">{DOCUMENT_STATUS_LABELS.located}:</strong> há texto igual ou trecho correspondente, com a página.</li>
        <li><strong className="text-ink">{DOCUMENT_STATUS_LABELS.related}:</strong> o plano trata do tema, mas sem o nome do programa, números ou metas da proposta.</li>
        <li><strong className="text-ink">{DOCUMENT_STATUS_LABELS.not_found}:</strong> a busca não achou trecho correspondente. Não prova que o plano ignora o assunto; quando possível, indicamos a página com mais palavras em comum.</li>
        <li><strong className="text-ink">{DOCUMENT_STATUS_LABELS.unverified}:</strong> não há trecho literal nem conferência registrada.</li>
        <li><strong className="text-ink">{DOCUMENT_STATUS_LABELS.no_document}:</strong> o plano do candidato não pôde ser analisado.</li>
      </ul>
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
            description="Explore os planos de governo, compare propostas por tema e consulte os trechos originais dos documentos oficiais, com indicação da página e da fonte utilizada."
            note="Página de consulta a documentos: não recomenda voto nem avalia qual proposta é melhor."
            compact
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
              {/* Busca e filtros: barra padrão do Votus, fixa no topo ao rolar. */}
              <section aria-labelledby="filtros-titulo" className="sticky top-0 z-30 -mx-4 mt-3 border-b border-[#efe8da] bg-[#FDFDFD] px-4 pb-2 pt-2 sm:-mx-10 sm:px-10">
                <h2 id="filtros-titulo" className="sr-only">Buscar e filtrar propostas</h2>
                {/* Desktop: busca + 3 filtros na mesma linha. Celular: busca e
                    botão "Filtros", que abre os campos empilhados. */}
                <div className="grid grid-cols-1 gap-x-3 gap-y-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:items-end">
                  <div className="flex min-w-0 items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <span aria-hidden="true" className="block px-1 text-[11px] font-bold uppercase tracking-wide text-[#1B623A]">
                        Buscar nas propostas
                      </span>
                      <SearchBar
                        className="mt-1"
                        searchValue={filtros.busca}
                        onSearchChange={(valor) => atualizar('busca', valor)}
                        placeholder="Ex.: SUS, escola, livros"
                        searchLabel="Buscar nas propostas"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiltrosAbertos((v) => !v)}
                      aria-expanded={filtrosAbertos}
                      aria-controls="filtros-campos"
                      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-4 text-sm font-medium text-[#1B623A] lg:hidden"
                    >
                      <SlidersHorizontal size={16} aria-hidden="true" />
                      {filtrosDoPainel > 0 ? `Filtros (${filtrosDoPainel})` : 'Filtros'}
                    </button>
                  </div>
                  <div id="filtros-campos" className={`${filtrosAbertos ? 'grid' : 'hidden'} grid-cols-1 gap-2 sm:grid-cols-3 lg:contents`}>
                    <FilterSelect className="block" label="Área ou tema" value={filtros.tema} onChange={(v) => atualizar('tema', v)}>
                      <option value="">Todas as áreas</option>
                      {porGrupo.map(({ group, temas }) => (
                        <optgroup key={group.key} label={group.label}>
                          <option value={`grupo:${group.key}`}>{group.label} (todos)</option>
                          {temas.map((t) => (
                            <option key={t.slug} value={t.slug}>{t.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </FilterSelect>
                    <FilterSelect className="block" label="Candidato" value={filtros.candidato} onChange={(v) => atualizar('candidato', v)}>
                      <option value="">Todos</option>
                      {candidatos.map((c) => (
                        <option key={c.external_id} value={c.external_id}>{c.name}</option>
                      ))}
                    </FilterSelect>
                    <FilterSelect className="block" label="Situação no plano do TSE" value={filtros.situacao} onChange={(v) => atualizar('situacao', v)}>
                      <option value="">Todas</option>
                      {Object.entries(SITUACOES).map(([valor, kind]) => (
                        <option key={valor} value={valor}>{DOCUMENT_STATUS_LABELS[kind]}</option>
                      ))}
                    </FilterSelect>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                  <p aria-live="polite" className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft sm:text-sm">
                    {temFiltro ? (
                      <>
                        <span>
                          <strong className="text-ink tabular-nums">{filtradas.length}</strong>{' '}
                          {filtradas.length === 1 ? 'proposta encontrada' : 'propostas encontradas'}
                        </span>
                        {porCandidato.length > 1 &&
                          porCandidato.map(({ candidato, total }) => (
                            <span key={candidato.id} className="inline-flex items-center gap-1.5">
                              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${candidateColors(candidato.name).barra}`} />
                              {candidato.name}: <span className="tabular-nums font-semibold text-ink">{total}</span>
                            </span>
                          ))}
                      </>
                    ) : (
                      <span>
                        {index?.proposals.length ?? 0} propostas em {index?.themes.length ?? 0} temas. Busque ou filtre para comparar.
                      </span>
                    )}
                    {isValidating && <span>Atualizando…</span>}
                  </p>
                  {temFiltro && <ClearFiltersButton onClick={limpar} />}
                </div>
              </section>

              {temasComparaveis.length > 0 && (
                <nav aria-label="Temas com propostas de todos os candidatos" className="mt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Lado a lado, com propostas de todos</p>
                  <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:flex-wrap md:overflow-visible">
                    {temasComparaveis.map((t) => {
                      const ativo = temaSelecionado === t.slug;
                      return (
                        <button
                          key={t.slug}
                          type="button"
                          aria-pressed={ativo}
                          onClick={() => (ativo ? atualizar('tema', '') : compararTema(t.slug))}
                          className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors sm:text-sm ${
                            ativo
                              ? 'border-[#1B623A] bg-[#1B623A] text-white'
                              : 'border-[#EDDBBA] bg-[#FDF8EE] text-[#1B623A] hover:border-[#1B623A]/40'
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </nav>
              )}

              {temFiltro && (
                <section aria-labelledby="resultado-titulo" className="mt-6 space-y-4">
                  <h2 id="resultado-titulo" className="scroll-mt-40 break-words text-xl font-black text-[#1B623A]">
                    {filtros.tema ? nomeDoTema(filtros.tema) : 'Resultado da busca'}
                  </h2>
                  <details className="rounded-xl border border-[#e0d6c4] bg-[#f7f5f2] px-3 py-2 text-[13px] leading-relaxed text-ink-soft">
                    <summary className="cursor-pointer font-bold text-[#1B623A]">Como ler a comparação</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li><strong className="text-ink">Resumo (IA)</strong> facilita a leitura; quem confirma é o trecho original e o documento.</li>
                      <li><strong className="text-ink">Texto do site</strong> foi copiado do site de campanha, sem IA.</li>
                      <li><strong className="text-ink">Plano de governo registrado no TSE</strong> mostra se o conteúdo foi localizado no PDF oficial e em qual página; toque na etiqueta para abrir a página.</li>
                      <li>Um tema pode ter propostas de um candidato e não do outro: cada plano organiza os assuntos à sua maneira. Estar no mesmo tema não torna duas propostas equivalentes.</li>
                      <li>Os filtros se somam: busca, área, candidato e situação valem ao mesmo tempo.</li>
                    </ul>
                  </details>
                  {temaSelecionado && <AiComparison slug={temaSelecionado} />}
                  {filtradas.length === 0 && (
                    <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e0d6c4] bg-white p-3 text-sm text-ink-soft">
                      <p className="min-w-0">
                        Nenhuma proposta extraída atende a todos os filtros ao mesmo tempo ({filtrosAtivos.join(' + ')}). Tente
                        outra palavra, remova um filtro ou veja abaixo se o assunto aparece nos planos oficiais.
                      </p>
                      <ClearFiltersButton onClick={limpar} />
                    </div>
                  )}
                  <ProposalColumns
                    candidates={candidatosVisiveis}
                    proposals={filtradas}
                    themeNames={themeNames}
                    highlightExternalId={null}
                    showTheme={!temaSelecionado}
                    electionResults={resultados}
                    emptyHint="Nenhuma proposta extraída deste candidato com esses filtros. Isso não quer dizer que o plano não trate do assunto — veja “Assuntos nos planos oficiais”."
                  />
                </section>
              )}

              <section aria-labelledby="visao-geral-titulo" className="mt-8">
                <div className="flex items-center gap-1.5">
                  <h2 id="visao-geral-titulo" className="text-sm font-black uppercase tracking-wide text-[#1B623A]">
                    Visão geral por área
                  </h2>
                  <InfoTooltip label="Sobre a visão geral por área" iconClassName="text-[#8D0801]">
                    Mostra quantas propostas o Votus extraiu em cada área. Abra uma área para ver seus temas ou escolha
                    “Comparar” para ver as propostas lado a lado. “0 propostas extraídas” não significa que o plano
                    ignore o assunto. Consulte{' '}
                    <a href="#assuntos-mencionados" className="font-semibold text-[#1B623A] underline underline-offset-2">
                      Assuntos mencionados nos planos oficiais
                    </a>.
                  </InfoTooltip>
                </div>
                <div className="mt-3 overflow-x-auto rounded-xl border border-[#e0d6c4] bg-white">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">Propostas extraídas por área e candidato</caption>
                    <thead className="bg-[#f7f5f2] text-xs uppercase text-ink-soft">
                      <tr>
                        <th scope="col" className="px-3 py-2 font-bold">Área</th>
                        {candidatos.map((c) => {
                          const cores = candidateColors(c.name);
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
                                onClick={() => compararTema(`grupo:${group.key}`)}
                                className="ml-5 mt-1 inline-flex min-h-9 items-center justify-center rounded-lg bg-[#1B623A] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#134A2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A] sm:hidden"
                              >
                                Comparar
                              </button>
                            </th>
                            {candidatos.map((c) => {
                              const quantidade = contagem(c.id);
                              const largura = maiorContagem > 0 ? (quantidade / maiorContagem) * 100 : 0;
                              const cores = candidateColors(c.name);

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
                                onClick={() => compararTema(`grupo:${group.key}`)}
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
                                      onClick={() => compararTema(t.slug)}
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
                                      onClick={() => compararTema(t.slug)}
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

              <PlanKeywords candidates={candidatosVisiveis} proposals={index?.proposals ?? []} onPick={buscarTermo} />
              <SubjectCoverage candidates={candidatosVisiveis} query={filtros.busca} />
              <SourcesPanel candidates={candidatos} proposals={index?.proposals ?? []} methodology={methodology} />
              <p className="mt-4 mb-28 rounded-xl border border-[#e0d6c4] bg-[#FDF8EE] p-3 text-sm leading-relaxed text-ink-soft">
                A IA pode errar; confira os trechos. As fontes variam entre candidatos. Veja{' '}
                <a href="#fontes-analisadas" className="font-bold text-[#1B623A] underline underline-offset-2">
                  Fontes analisadas
                </a>.
              </p>
            </>
          )}
        </div>
        <FloatingAIButton />
      </main>
    </div>
  );
}
