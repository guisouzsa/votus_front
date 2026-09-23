'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { PROPOSAL_CATEGORIES } from '@/lib/proposalCategories';

export default function ProposalCategoryPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (categories: string[]) => void;
}) {
  const [showOutroInput, setShowOutroInput] = useState(false);
  const [outroText, setOutroText] = useState('');

  const outrosSelecionados = value.filter(
    (category) => !PROPOSAL_CATEGORIES.some((fixa) => fixa.toLowerCase() === category.toLowerCase())
  );

  function toggleFixa(categoria: string) {
    onChange(value.includes(categoria) ? value.filter((c) => c !== categoria) : [...value, categoria]);
  }

  function removerOutro(categoria: string) {
    onChange(value.filter((c) => c !== categoria));
  }

  function confirmarOutro() {
    const trimmed = outroText.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setOutroText('');
    setShowOutroInput(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {PROPOSAL_CATEGORIES.map((categoria) => {
          const ativo = value.includes(categoria);
          return (
            <button
              key={categoria}
              type="button"
              onClick={() => toggleFixa(categoria)}
              aria-pressed={ativo}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                ativo ? 'bg-white text-[#1b623a]' : 'bg-white/25 text-white hover:bg-white/35'
              }`}
            >
              {categoria}
            </button>
          );
        })}

        {outrosSelecionados.map((categoria) => (
          <span
            key={categoria}
            className="flex items-center gap-1 rounded-full bg-white text-[#1b623a] px-3 py-1.5 text-xs font-semibold"
          >
            {categoria}
            <button
              type="button"
              onClick={() => removerOutro(categoria)}
              aria-label={`Remover categoria ${categoria}`}
              className="bg-transparent text-[#1b623a]/70 hover:text-[#1b623a]"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {!showOutroInput && (
          <button
            type="button"
            onClick={() => setShowOutroInput(true)}
            className="rounded-full bg-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/35"
          >
            + Outro
          </button>
        )}
      </div>

      {showOutroInput && (
        <input
          type="text"
          autoFocus
          value={outroText}
          onChange={(event) => setOutroText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              confirmarOutro();
            }
            if (event.key === 'Escape') {
              setOutroText('');
              setShowOutroInput(false);
            }
          }}
          onBlur={confirmarOutro}
          placeholder="Digite a categoria e pressione Enter"
          maxLength={60}
          className="h-10 w-full rounded-[8px] border-0 bg-white px-3 text-sm font-normal text-ink outline-none placeholder:font-normal placeholder:text-[#8a8a8a]"
        />
      )}
    </div>
  );
}
