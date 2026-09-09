'use client';

import { useMemo, useState } from 'react';
import type { Bill } from '@/services/types';

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

export default function ProposicoesList({ bills }: { bills: Bill[] }) {
  const [selectedTopic, setSelectedTopic] = useState('');

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

  const selectedColor = selectedTopic ? colorFor(selectedTopic) : null;

  return (
    <>
      {topics.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={selectedTopic}
            onChange={(event) => setSelectedTopic(event.target.value)}
            className="rounded-full border-0 bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#1b623a] outline-none"
          >
            <option value="">Todos os temas</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.name}>
                {topic.name}
              </option>
            ))}
          </select>

          {selectedTopic && selectedColor && (
            <>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedColor.bg} ${selectedColor.text}`}>
                {selectedTopic}
              </span>
              <button
                type="button"
                onClick={() => setSelectedTopic('')}
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30"
              >
                Limpar ×
              </button>
            </>
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
