'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ExternalLink } from 'lucide-react';
import { getPresidentRecord } from '@/services/executivesService';
import type { ExecutiveRecord, ExecutiveRecordIndicator } from '@/services/types';

const PAGE_SIZE = 10;

// Mesmas cores dos painéis do perfil de deputado, só as com bom contraste com texto branco.
const PANEL = { red: 'bg-[#a70700]', green: 'bg-[#1c623a]', dark: 'bg-[#0f3d22]' };

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const [year, month, day] = iso.slice(0, 10).split('-');
  return day ? `${day}/${month}/${year}` : null;
}

function formatPeriod(period: string, frequency: string): string {
  const year = period.slice(0, 4);
  const part = period.slice(4);
  return frequency === 'quarterly' ? `${Number(part)}º tri/${year}` : `${part}/${year}`;
}

function SourceLink({ href, label = 'Fonte oficial' }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      {label}
      <ExternalLink size={11} aria-hidden="true" />
    </a>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs leading-relaxed text-white/85">{children}</p>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-white/90">{children}</p>;
}

/** Lista com busca e "ver mais", pra não despejar centenas de itens de uma vez. */
function PagedList<T extends { id: string | number }>({
  items,
  searchText,
  searchLabel,
  renderItem,
}: {
  items: T[];
  searchText?: (item: T) => string;
  searchLabel?: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  const [term, setTerm] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const query = term.trim().toLowerCase();
  const filtered = searchText && query ? items.filter((item) => searchText(item).toLowerCase().includes(query)) : items;

  return (
    <>
      {searchText && items.length > PAGE_SIZE && (
        <input
          type="search"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setLimit(PAGE_SIZE);
          }}
          placeholder="Buscar nesta lista"
          aria-label={searchLabel ?? 'Buscar nesta lista'}
          className="mb-3 h-10 w-full max-w-sm rounded-full border-0 bg-white/95 px-4 text-sm text-[#103D23] outline-none placeholder:text-[#4d4d4d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        />
      )}
      {filtered.length === 0 ? (
        <Empty>Nada encontrado.</Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.slice(0, limit).map((item) => (
            <li key={item.id} className="rounded-lg bg-white/10 px-3 py-2.5">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
      {filtered.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((value) => value + PAGE_SIZE)}
          className="mt-3 min-h-10 cursor-pointer rounded-full bg-white/95 px-4 text-sm font-semibold text-[#103D23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Ver mais ({filtered.length - limit})
        </button>
      )}
    </>
  );
}

function CareerPanel({ record }: { record: ExecutiveRecord }) {
  if (record.career.length === 0) return <Empty>O histórico ainda não foi carregado.</Empty>;

  return (
    <ul className="flex flex-col gap-2">
      {record.career.map((item) => (
        <li key={item.id} className="rounded-lg bg-white/10 px-3 py-2.5">
          <p className="font-bold">
            {item.office}
            {item.place ? ` · ${item.place}` : ''}
          </p>
          <p className="mt-0.5 text-xs text-white/85">
            {item.start_year ?? '—'} a {item.end_year ?? 'atual'}
            {item.party ? ` · eleito(a) por ${item.party}` : ''}
          </p>
          <SourceLink href={item.source_url} label={item.source_name} />
        </li>
      ))}
    </ul>
  );
}

function ProjectsPanel({ record }: { record: ExecutiveRecord }) {
  if (record.propositions.length === 0) return <Empty>As proposições ainda não foram carregadas.</Empty>;

  return (
    <>
      <Note>
        Apresentadas como deputado federal e registradas na Câmara dos Deputados. É um histórico parlamentar, separado
        da atuação no Poder Executivo.
      </Note>
      <PagedList
        items={record.propositions}
        searchLabel="Buscar nas proposições"
        searchText={(item) => `${item.type} ${item.number} ${item.year} ${item.title}`}
        renderItem={(item) => (
          <>
            <p className="font-bold">
              {item.type} {item.number}/{item.year}
            </p>
            <p className="mt-0.5 text-sm">{item.title}</p>
            <p className="mt-1 text-xs text-white/85">
              {[formatDate(item.date), item.role, item.status].filter(Boolean).join(' · ')}
            </p>
            <SourceLink href={item.source_url} label="Câmara dos Deputados" />
          </>
        )}
      />
    </>
  );
}

function ActsPanel({ record }: { record: ExecutiveRecord }) {
  const terms = record.legislation?.terms ?? [];
  const [termIndex, setTermIndex] = useState(Math.max(terms.length - 1, 0));
  const term = terms[termIndex];

  if (!record.legislation || !term) return <Empty>Os atos ainda não foram carregados.</Empty>;

  return (
    <>
      <Note>
        Atos federais assinados no período do mandato, segundo o Senado Federal. Estar nesta lista não significa decisão
        pessoal do presidente, e as leis passam pelo Congresso.
      </Note>
      <div role="group" aria-label="Período do mandato" className="mb-3 flex flex-wrap gap-2">
        {terms.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={index === termIndex}
            onClick={() => setTermIndex(index)}
            className={`min-h-10 cursor-pointer rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              index === termIndex ? 'bg-white text-[#103D23]' : 'bg-white/15 text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <dl className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {Object.entries(record.legislation.types).map(([code, label]) => (
          <div key={code} className="flex gap-1.5">
            <dt className="text-white/85">{label}:</dt>
            <dd className="font-bold">{term.counts[code] ?? 0}</dd>
          </div>
        ))}
      </dl>
      <PagedList
        key={term.label}
        items={term.recent}
        searchLabel="Buscar nos atos"
        searchText={(item) => `${item.name} ${item.title}`}
        renderItem={(item) => (
          <>
            <p className="font-bold">{item.name}</p>
            <p className="mt-0.5 text-sm">{item.title}</p>
            <SourceLink href={item.source_url} label="Senado Federal" />
          </>
        )}
      />
    </>
  );
}

function ProgramsPanel({ record }: { record: ExecutiveRecord }) {
  return (
    <>
      <Note>O texto é a ementa do ato oficial que criou ou rege cada iniciativa. Alguns programas têm origem anterior a ele.</Note>
      <ul className="flex flex-col gap-2">
        {record.programs.map((item) => (
          <li key={item.id} className="rounded-lg bg-white/10 px-3 py-2.5">
            <p className="font-bold">{item.name}</p>
            <p className="mt-0.5 text-sm">{item.summary}</p>
            <p className="mt-1 text-xs text-white/85">
              {[item.act, formatDate(item.date), item.participation].filter(Boolean).join(' · ')}
            </p>
            <SourceLink href={item.source_url} label="Planalto" />
          </li>
        ))}
      </ul>
    </>
  );
}

function IndicatorCard({ item }: { item: ExecutiveRecordIndicator }) {
  const latest = item.series[item.series.length - 1];
  const previous = item.series.slice(0, -1).slice(-4);

  return (
    <li className="rounded-lg bg-white/10 px-3 py-2.5">
      <p className="font-bold">{item.name}</p>
      <p className="mt-1 text-2xl font-black">
        {latest.value.toLocaleString('pt-BR')}
        {item.unit === '%' ? '%' : ''}
        <span className="ml-2 text-xs font-semibold text-white/85">{formatPeriod(latest.period, item.frequency)}</span>
      </p>
      <p className="mt-1 text-xs text-white/85">{item.explanation}</p>
      {previous.length > 0 && (
        <p className="mt-1 text-xs text-white/85">
          Antes:{' '}
          {previous
            .map((point) => `${formatPeriod(point.period, item.frequency)}: ${point.value.toLocaleString('pt-BR')}${item.unit === '%' ? '%' : ''}`)
            .join(' · ')}
        </p>
      )}
      <SourceLink href={item.source_url} label="IBGE" />
    </li>
  );
}

function IndicatorsPanel({ record }: { record: ExecutiveRecord }) {
  if (record.indicators.length === 0) return <Empty>Os indicadores ainda não foram carregados.</Empty>;

  return (
    <>
      <Note>Dados nacionais do IBGE, para dar contexto. Esses resultados não são atribuídos a uma pessoa.</Note>
      <ul className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        {record.indicators.map((item) => (
          <IndicatorCard key={item.id} item={item} />
        ))}
      </ul>
    </>
  );
}

function AgendaPanel({ record }: { record: ExecutiveRecord }) {
  return (
    <>
      <Note>Compromissos publicados pelo Planalto nos últimos dias. A agenda pública não necessariamente mostra tudo o que foi feito.</Note>
      {record.agenda.length === 0 ? (
        <Empty>Nenhum compromisso publicado no período consultado.</Empty>
      ) : (
        <PagedList
          items={record.agenda}
          renderItem={(item) => (
            <>
              <p className="font-bold">{item.title}</p>
              <p className="mt-0.5 text-xs text-white/85">
                {[formatDate(item.date), item.time, item.place].filter(Boolean).join(' · ')}
              </p>
              <SourceLink href={item.source_url} label="Planalto" />
            </>
          )}
        />
      )}
    </>
  );
}

function SpeechesPanel({ record }: { record: ExecutiveRecord }) {
  if (record.speeches.length === 0) return <Empty>Os discursos ainda não foram carregados.</Empty>;

  return (
    <>
      <Note>Transcrições publicadas pelo Planalto. Uma declaração não é, por si só, decisão oficial nem compromisso cumprido.</Note>
      <PagedList
        items={record.speeches}
        searchLabel="Buscar nos discursos"
        searchText={(item) => `${item.title} ${item.description}`}
        renderItem={(item) => (
          <>
            <p className="font-bold">{item.title}</p>
            <p className="mt-0.5 text-xs text-white/85">{[item.kind, formatDate(item.date)].filter(Boolean).join(' · ')}</p>
            <SourceLink href={item.source_url} label="Planalto" />
          </>
        )}
      />
    </>
  );
}

/** Registro público de Lula e Alckmin, no mesmo formato de abas do perfil de deputado. */
export default function ExecutiveRecordSection({ id }: { id: string | number }) {
  const { data: record } = useSWR(['presidente-registro', id], () => getPresidentRecord(id), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const [active, setActive] = useState('Histórico');

  // Sem registro (outra pessoa no cargo, API fora do ar), o perfil segue como sempre foi.
  if (!record) return null;

  const has = (source: string) => record.applicable_sources.includes(source);
  const tabs = [
    { name: 'Histórico', color: PANEL.red, count: record.career.length, content: <CareerPanel record={record} /> },
    { name: 'Projetos', color: PANEL.green, count: record.propositions.length, content: <ProjectsPanel record={record} /> },
    ...(has('legislation') ? [{ name: 'Leis e atos', color: PANEL.dark, count: null, content: <ActsPanel record={record} /> }] : []),
    { name: 'Programas', color: PANEL.red, count: record.programs.length, content: <ProgramsPanel record={record} /> },
    ...(has('indicators') ? [{ name: 'Indicadores', color: PANEL.green, count: null, content: <IndicatorsPanel record={record} /> }] : []),
    ...(has('agenda') ? [{ name: 'Agenda', color: PANEL.dark, count: null, content: <AgendaPanel record={record} /> }] : []),
    ...(has('speeches') ? [{ name: 'Discursos', color: PANEL.red, count: record.speeches.length, content: <SpeechesPanel record={record} /> }] : []),
  ];
  const current = tabs.find((tab) => tab.name === active) ?? tabs[0];

  return (
    <section data-tour="registro" className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr]">
      <div className="flex gap-2 overflow-x-auto rounded-[10px] border-4 border-[#1b623a] bg-white p-2 md:h-fit md:flex-col md:overflow-visible">
        {tabs.map((tab) => {
          const isActive = tab.name === current.name;
          return (
            <button
              key={tab.name}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(tab.name)}
              className={`flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1b623a] ${
                isActive ? `${tab.color} text-white` : 'text-[#1b623a]'
              }`}
            >
              <span>{tab.name}</span>
              {tab.count !== null && (
                <span className={`text-xs font-bold ${isActive ? 'text-white/80' : 'text-[#1b623a]/70'}`}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <article className={`min-h-[280px] min-w-0 rounded-[10px] p-4 text-white sm:p-6 ${current.color}`}>
        <h2 className="text-xl font-black uppercase sm:text-2xl md:text-3xl">{current.name}</h2>
        <div className="mt-3 max-w-4xl text-sm leading-relaxed">{current.content}</div>
        {record.updated_at && (
          <p className="mt-4 border-t border-white/25 pt-2 text-xs text-white/85">Dados atualizados em {formatDate(record.updated_at)}</p>
        )}
      </article>
    </section>
  );
}
