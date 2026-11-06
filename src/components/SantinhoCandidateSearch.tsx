'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Search } from 'lucide-react';
import { getCandidates, type CandidateOfficeSlug } from '@/services/candidatesService';

const MAX_RESULTADOS = 6;

/**
 * Busca pelo nome, pra quem não sabe o número de cor. Só aparece nos cargos em
 * que a eleição tem candidatos no Votus; escolher um só preenche o número.
 */
export default function SantinhoCandidateSearch({
  office,
  digitos,
  rotulo,
  apenasSegundoTurno = false,
  onSelect,
}: {
  office: CandidateOfficeSlug;
  digitos: number;
  rotulo: string;
  apenasSegundoTurno?: boolean;
  onSelect: (numero: string) => void;
}) {
  const [texto, setTexto] = useState('');
  const [termo, setTermo] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setTermo(texto.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [texto]);

  const { data, isLoading, error } = useSWR(
    termo.length >= 2 ? ['santinho-busca', office, termo, apenasSegundoTurno] : null,
    () =>
      getCandidates(office, 1, {
        search: termo,
        state: office === 'presidente' ? undefined : 'CE',
        electionResult: apenasSegundoTurno ? 'runoff' : undefined,
      }),
    { revalidateOnFocus: false }
  );

  // Só quem tem número válido pro cargo pode ser escolhido.
  const resultados = (data?.data ?? []).filter((c) => c.ballot_number?.length === digitos).slice(0, MAX_RESULTADOS);
  const mostrarLista = termo.length >= 2 && termo === texto.trim();

  return (
    <div>
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#1b623a]" aria-hidden="true" />
        <input
          type="search"
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder="Não sabe o número? Busque pelo nome"
          aria-label={`Buscar candidato: ${rotulo}`}
          className="h-10 w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] pl-9 pr-3 text-sm text-[#103D23] outline-none placeholder:text-ink-soft focus:border-[#1b623a] focus:ring-2 focus:ring-[#1b623a]/20"
        />
      </div>

      {mostrarLista && (
        <div aria-live="polite" className="mt-1.5">
          {isLoading && <p className="text-xs text-ink-soft">Buscando...</p>}
          {!isLoading && error && <p className="text-xs font-semibold text-[#8d0801]">Não foi possível buscar agora. Digite o número.</p>}
          {!isLoading && !error && resultados.length === 0 && (
            <p className="text-xs text-ink-soft">Nenhum candidato encontrado. Se souber o número, digite acima.</p>
          )}
          {resultados.length > 0 && (
            <ul className="flex flex-col gap-1">
              {resultados.map((candidato) => (
                <li key={candidato.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(candidato.ballot_number ?? '');
                      setTexto('');
                    }}
                    className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[8px] border border-[#e7e0d2] bg-white px-3 py-1.5 text-left text-sm transition-colors hover:border-[#1b623a]/40 hover:bg-[#FDF8EE]"
                  >
                    <span className="font-bold text-[#8d0801]">{candidato.ballot_number}</span>
                    <span className="min-w-0 truncate font-medium text-[#103D23]">{candidato.ballot_name}</span>
                    {candidato.party.acronym && <span className="ml-auto shrink-0 text-xs text-ink-soft">{candidato.party.acronym}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
