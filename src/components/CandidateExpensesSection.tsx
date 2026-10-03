'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ChevronDown } from 'lucide-react';
import { getCandidateExpenses, type CandidateOfficeSlug } from '@/services/candidatesService';
import { ApiError } from '@/services/apiClient';
import type { Candidate, CandidateExpenseFilters, CandidateExpenseSort } from '@/services/types';
import Pagination from '@/components/Pagination';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

function tituloCaso(texto: string | null): string {
  if (!texto) return '—';

  return texto
    .toLowerCase()
    .split(' ')
    .map((palavra) => (palavra.length > 2 ? palavra[0].toUpperCase() + palavra.slice(1) : palavra))
    .join(' ');
}

const SORT_OPTIONS: { value: CandidateExpenseSort; label: string }[] = [
  { value: 'date_desc', label: 'Mais recentes' },
  { value: 'date_asc', label: 'Mais antigas' },
  { value: 'amount_desc', label: 'Maior valor' },
  { value: 'amount_asc', label: 'Menor valor' },
];

const FILTROS_VAZIOS: Required<Pick<CandidateExpenseFilters, 'search' | 'supplierType' | 'dateFrom' | 'dateTo' | 'sort'>> = {
  search: '',
  supplierType: '',
  dateFrom: '',
  dateTo: '',
  sort: 'date_desc',
};

// Input de data estilizado igual aos outros campos do filtro — o seletor
// nativo de calendário do navegador continua funcionando ao clicar em
// qualquer parte do campo, só o ícone padrão (que não combinava com o
// resto do design) fica escondido via CSS.
function CampoData({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className="h-9 w-full min-w-0 rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-3 text-xs text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20 md:w-[120px] md:shrink-0 [&::-webkit-calendar-picker-indicator]:opacity-0"
    />
  );
}

/**
 * "Prestação de contas" do candidato — hoje só cobre despesas de campanha
 * (não existe no Votus nenhum dado de receita ou de bens declarados, por
 * isso essas duas categorias não aparecem aqui nem como aba vazia). Quando
 * `summary` vem ausente (candidato sem despesa importada — hoje só existe
 * esse dado pros candidatos do Ceará), a seção inteira não renderiza nada.
 *
 * Hierarquia pensada pra responder, na ordem, as 5 perguntas que alguém
 * abrindo o perfil faria: quanto foi gasto, quantos registros, como está
 * distribuído, quais os principais gastos, e onde ver os detalhes.
 */
export default function CandidateExpensesSection({
  office,
  candidateId,
  summary,
}: {
  office: CandidateOfficeSlug;
  candidateId: number;
  summary?: Candidate['expenses_summary'];
}) {
  const [aberto, setAberto] = useState(false);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [aplicados, setAplicados] = useState(FILTROS_VAZIOS);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const {
    data: response,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR(
    aberto ? ['candidate-expenses', office, candidateId, page, aplicados] : null,
    () => getCandidateExpenses(office, candidateId, page, aplicados),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  if (!summary) {
    return null;
  }

  const expenses = response?.data ?? [];
  const lastPage = response?.meta.last_page ?? 1;

  const { pessoa_fisica: pf, pessoa_juridica: pj } = summary.by_supplier_type;
  const totalTipos = pf + pj;
  const pctPf = totalTipos > 0 ? Math.round((pf / totalTipos) * 100) : 0;

  function aplicarFiltros() {
    setAplicados(filtros);
    setPage(1);
  }

  function limparFiltros() {
    setFiltros(FILTROS_VAZIOS);
    setAplicados(FILTROS_VAZIOS);
    setPage(1);
  }

  return (
    <section className="mt-4 rounded-[10px] border border-[#e0d6c4] bg-white p-4 sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a8a8a]">Prestação de contas</p>
      <p className="text-xs text-[#4d4d4d]">Gastos declarados durante a campanha.</p>

      {/* Número principal — sem card/borda própria, é a primeira coisa que
          o olho deve encontrar. */}
      <p className="mt-3 text-3xl font-black leading-none text-[#8d0801] sm:text-4xl">
        {formatCurrency(summary.total)}
      </p>
      <p className="mt-1 text-xs font-semibold text-[#4d4d4d]">
        {summary.count} despesa{summary.count === 1 ? '' : 's'} declarada{summary.count === 1 ? '' : 's'}
        {summary.last_synced_at && ` · sincronizado em ${formatDate(summary.last_synced_at)}`}
      </p>

      {/* Mini visualização — só pessoa física vs jurídica, os únicos 2
          valores reais que o TSE distingue (não é uma "categoria" de gasto). */}
      {totalTipos > 0 && (
        <div className="mt-4">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#f7f5f2]">
            <div className="h-full bg-[#1B623A]" style={{ width: `${pctPf}%` }} />
            <div className="h-full bg-[#F07A00]" style={{ width: `${100 - pctPf}%` }} />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#4d4d4d]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#1B623A]" /> Pessoa física ·{' '}
              {formatCurrency(pf)}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#F07A00]" /> Pessoa jurídica ·{' '}
              {formatCurrency(pj)}
            </span>
          </div>
        </div>
      )}

      {/* Principais gastos — responde "onde o dinheiro foi" sem precisar
          abrir a lista completa. */}
      {summary.top_expenses.length > 0 && (
        <div className="mt-4 border-t border-[#e0d6c4] pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a8a8a]">Principais gastos</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {summary.top_expenses.map((item, index) => (
              <li key={index} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-[#1b623a]">{item.description ?? 'Sem descrição'}</span>
                <span className="shrink-0 font-bold text-[#8d0801]">{formatCurrency(item.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        className="mt-4 flex items-center gap-1 bg-transparent text-sm font-semibold text-[#1b623a]"
      >
        <ChevronDown size={16} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
        {aberto ? 'Ocultar despesas detalhadas' : 'Ver despesas detalhadas'}
      </button>

      {aberto && (
        <div className="mt-4 border-t border-[#e0d6c4] pt-4">
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
            <input
              type="text"
              value={filtros.search}
              onChange={(event) => setFiltros((atual) => ({ ...atual, search: event.target.value }))}
              onKeyDown={(event) => event.key === 'Enter' && aplicarFiltros()}
              placeholder="Buscar por descrição ou fornecedor..."
              aria-label="Buscar por descrição ou fornecedor"
              className="col-span-2 h-9 w-full min-w-0 rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-4 text-xs text-[#1B623A] outline-none placeholder:text-[#1B623A]/70 focus:ring-2 focus:ring-[#1B623A]/20 md:min-w-[180px] md:flex-1"
            />
            <label className="relative block w-full min-w-0 md:w-[150px] md:shrink-0">
              <span className="sr-only">Tipo de fornecedor</span>
              <select
                value={filtros.supplierType}
                onChange={(event) => setFiltros((atual) => ({ ...atual, supplierType: event.target.value }))}
                className="h-9 w-full rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-3 text-xs font-medium text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20"
              >
                <option value="">Todos os tipos</option>
                <option value="PESSOA FÍSICA">Pessoa física</option>
                <option value="PESSOA JURÍDICA">Pessoa jurídica</option>
              </select>
            </label>
            <label className="relative block w-full min-w-0 md:w-[140px] md:shrink-0">
              <span className="sr-only">Ordenar por</span>
              <select
                value={filtros.sort}
                onChange={(event) =>
                  setFiltros((atual) => ({ ...atual, sort: event.target.value as CandidateExpenseSort }))
                }
                className="h-9 w-full rounded-full border border-[#EDDBBA] bg-[#FDF8EE] px-3 text-xs font-medium text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <CampoData value={filtros.dateFrom} onChange={(v) => setFiltros((a) => ({ ...a, dateFrom: v }))} label="De" />
            <CampoData value={filtros.dateTo} onChange={(v) => setFiltros((a) => ({ ...a, dateTo: v }))} label="Até" />
            <div className="col-span-2 flex w-full gap-2 md:w-auto md:shrink-0 md:ml-auto">
              <button
                type="button"
                onClick={limparFiltros}
                className="h-9 flex-1 rounded-full border border-[#EDDBBA] px-4 text-xs font-semibold text-[#1B623A] md:flex-none"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={aplicarFiltros}
                className="h-9 flex-1 rounded-full bg-[#1B623A] px-4 text-xs font-semibold text-white md:flex-none"
              >
                Filtrar
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="mt-4 flex flex-col gap-2" aria-label="Carregando despesas">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-[8px] bg-[#f7f5f2]" />
              ))}
            </div>
          )}

          {!isLoading && swrError && (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-[10px] bg-[#f7f5f2] p-4 text-center">
              <p className="text-xs font-semibold text-[#8d0801]">
                {swrError instanceof ApiError
                  ? 'Não foi possível carregar os dados agora. Tente novamente.'
                  : 'Ocorreu um erro inesperado ao carregar as despesas.'}
              </p>
              <button
                type="button"
                onClick={() => mutate()}
                className="rounded-full bg-[#8d0801] px-4 py-1.5 text-xs font-semibold text-white"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !swrError && expenses.length === 0 && (
            <p className="mt-4 text-xs text-[#4d4d4d]">Nenhuma despesa encontrada para esse filtro.</p>
          )}

          {!isLoading && !swrError && expenses.length > 0 && (
            <>
              <div className="mt-4 hidden grid-cols-[90px_1fr_1fr_120px] gap-3 border-b border-[#e0d6c4] px-2 pb-2 text-[11px] font-bold uppercase text-[#8a8a8a] md:grid">
                <span>Data</span>
                <span>Descrição</span>
                <span>Fornecedor</span>
                <span className="text-right">Valor</span>
              </div>

              <ul className="divide-y divide-[#e0d6c4]">
                {expenses.map((expense) => {
                  const expandido = expandedId === expense.id;
                  return (
                    <li key={expense.id}>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandido ? null : expense.id)}
                        aria-expanded={expandido}
                        className="grid w-full grid-cols-1 gap-1 bg-transparent px-2 py-2.5 text-left transition-colors hover:bg-[#f7f5f2] md:grid-cols-[90px_1fr_1fr_120px] md:items-center md:gap-3"
                      >
                        <span className="text-sm font-semibold text-[#1b623a] md:hidden">
                          {expense.description ?? 'Sem descrição'}
                        </span>
                        <span className="text-xs text-[#4d4d4d] md:hidden">{expense.supplier_name ?? '—'}</span>
                        <span className="flex items-center justify-between text-xs text-[#4d4d4d] md:hidden">
                          <span>{formatDate(expense.expense_date)}</span>
                          <span className="font-bold text-[#8d0801]">{formatCurrency(expense.amount)}</span>
                        </span>

                        <span className="hidden text-xs text-[#4d4d4d] md:block">
                          {formatDate(expense.expense_date)}
                        </span>
                        <span className="hidden truncate text-sm text-[#1b623a] md:block">
                          {expense.description ?? 'Sem descrição'}
                        </span>
                        <span className="hidden truncate text-xs text-[#4d4d4d] md:block">
                          {expense.supplier_name ?? '—'}
                        </span>
                        <span className="hidden text-right text-sm font-bold text-[#8d0801] md:block">
                          {formatCurrency(expense.amount)}
                        </span>
                      </button>

                      {expandido && (
                        <div className="mb-2 grid grid-cols-2 gap-3 rounded-[8px] bg-[#f7f5f2] p-3 text-xs sm:grid-cols-4">
                          <div>
                            <p className="text-[#8a8a8a]">Valor</p>
                            <p className="font-semibold text-[#1b623a]">{formatCurrency(expense.amount)}</p>
                          </div>
                          <div>
                            <p className="text-[#8a8a8a]">Data</p>
                            <p className="font-semibold text-[#1b623a]">{formatDate(expense.expense_date)}</p>
                          </div>
                          <div>
                            <p className="text-[#8a8a8a]">Fornecedor</p>
                            <p className="font-semibold text-[#1b623a]">{expense.supplier_name ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-[#8a8a8a]">Tipo</p>
                            <p className="font-semibold text-[#1b623a]">{tituloCaso(expense.supplier_type)}</p>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex justify-center">
                <Pagination page={page} lastPage={lastPage} onChange={setPage} />
              </div>
            </>
          )}
        </div>
      )}

      <p className="mt-4 border-t border-[#e0d6c4] pt-3 text-[10px] text-[#b3b3b3]">
        Total e distribuição calculados pelo Votus a partir dos registros oficiais. Fonte:{' '}
        <a
          href="https://dadosabertos.tse.jus.br/dataset/prestacao-de-contas-eleitorais-2026"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          TSE — Dados Abertos, Prestação de Contas Eleitorais
        </a>
        .
      </p>
    </section>
  );
}
