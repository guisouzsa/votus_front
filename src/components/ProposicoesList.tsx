'use client';

import { useMemo, useState } from 'react';
import type { Bill, Topic } from '@/services/types';

// TEMPORÁRIO: a API em produção ainda não retorna `bill.topics` (aguardando
// deploy do backend). Enquanto isso, simulamos um tema por proposição só
// para pré-visualizar o design. Remover DEMO_TOPICS e withDemoTopics()
// assim que a API passar a enviar os temas reais.
const DEMO_TOPICS = ['Saúde', 'Educação', 'Segurança Pública', 'Economia', 'Meio Ambiente', 'Infraestrutura'];

function withDemoTopics(bill: Bill): Bill {
  if (bill.topics && bill.topics.length > 0) return bill;
  const name = DEMO_TOPICS[bill.id % DEMO_TOPICS.length];
  const demoTopic: Topic = { id: -(bill.id % DEMO_TOPICS.length) - 1, name };
  return { ...bill, topics: [demoTopic] };
}

const PALETTE = [
  { bg: 'bg-[#DCEEE3]', text: 'text-[#1B623A]' },
  { bg: 'bg-[#FBE3D0]', text: 'text-[#B85C00]' },
  { bg: 'bg-[#F7D9D9]', text: 'text-[#8D0801]' },
  { bg: 'bg-[#FCEFC2]', text: 'text-[#8A6D00]' },
  { bg: 'bg-[#E4E0F5]', text: 'text-[#4B3F91]' },
  { bg: 'bg-[#D9EAF7]', text: 'text-[#1B4F72]' },
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export default function ProposicoesList({ bills: rawBills }: { bills: Bill[] }) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const bills = useMemo(() => rawBills.map(withDemoTopics), [rawBills]);

  const topics = useMemo(
    () =>
      Array.from(new Map(bills.flatMap((bill) => bill.topics ?? []).map((topic) => [topic.name, topic])).values()).sort(
        (a, b) => a.name.localeCompare(b.name, 'pt-BR')
      ),
    [bills]
  );

  const filteredBills = useMemo(() => {
    if (!selectedTopic) return bills;
    return bills.filter((bill) => (bill.topics ?? []).some((topic) => topic.name === selectedTopic));
  }, [bills, selectedTopic]);

  if (bills.length === 0) {
    return <p>Nenhuma proposição registrada.</p>;
  }

  return (
    <>
      {topics.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {topics.map((topic) => {
            const { bg, text } = colorFor(topic.name);
            const isActive = selectedTopic === topic.name;

            return (
              <button
                key={topic.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedTopic(isActive ? null : topic.name)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${bg} ${text} ${
                  isActive ? 'ring-2 ring-white ring-offset-1 ring-offset-current' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {topic.name}
              </button>
            );
          })}
          {selectedTopic && (
            <button
              type="button"
              onClick={() => setSelectedTopic(null)}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30"
            >
              Limpar filtro ×
            </button>
          )}
        </div>
      )}

      {filteredBills.length === 0 ? (
        <p>Nenhuma proposição encontrada para este tema.</p>
      ) : (
        <ul className="flex max-h-80 flex-col gap-3 scrollbar-hide overflow-y-auto pr-2">
          {filteredBills.map((bill) => (
            <li key={bill.id}>
              <strong>{bill.type}</strong> — {bill.summary}
              {bill.status_situacao && <div className="mt-0.5 text-xs opacity-80">{bill.status_situacao}</div>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
