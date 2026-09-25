interface LegislatorFilterFrameProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  // Opcional: candidatos não têm "situação do mandato" (o campo de situação
  // da candidatura vem vazio no CSV do TSE), então lá o filtro não aparece
  // em vez de exibir opções sem dado real por trás.
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  partyValue: string;
  onPartyChange: (value: string) => void;
  partyOptions: string[];
  onApply: () => void;
  onClear: () => void;
  searchPlaceholder?: string;
  // Desabilita os botões enquanto a busca filtrada está carregando, pra não
  // disparar a mesma requisição várias vezes com cliques repetidos.
  busy?: boolean;
}

export default function LegislatorFilterFrame({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions,
  partyValue,
  onPartyChange,
  partyOptions,
  onApply,
  onClear,
  searchPlaceholder = 'Pesquisar por nome ou partido...',
  busy = false,
}: LegislatorFilterFrameProps) {
  return (
    <div className="relative mt-6 min-h-[170px] overflow-hidden rounded-[10px] border border-[#d6d1c8] bg-[#f3e6d3] p-4 shadow-sm">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{ backgroundImage: "url('/estampa_secao.png')" }}
      />

      <div className="relative z-10 flex min-h-[138px] items-center rounded-[14px] p-4 text-[#8D0801]">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:gap-x-6">
          <div className="flex-1">
            <span className="invisible block text-sm font-semibold">Pesquisar</span>
            <div className="mt-6 flex h-[52px] items-center rounded-[10px] border border-[#d6d1c8] bg-[#FDFDFD] px-4 py-3 shadow-sm">
              <input
                type="text"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !busy) onApply();
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full border-0 bg-transparent text-sm text-[#8D0801] outline-none placeholder:text-[#8D0801]"
              />
              <span className="ml-3 text-xl text-[#8D0801]">⌕</span>
            </div>
          </div>

          <div className="hidden self-stretch pt-6 md:block">
            <div className="h-full w-px rounded-full bg-[#8D0801]" />
          </div>

          {statusOptions && onStatusChange && (
            <label className="block w-full text-sm font-semibold text-[#8D0801] md:w-[220px]">
              SITUAÇÃO DO MANDATO
              <select
                value={statusValue ?? ''}
                onChange={(event) => onStatusChange(event.target.value)}
                className="mt-6 h-[52px] w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDFDFD] px-4 py-3 text-base font-semibold text-[#8D0801] outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#FDFDFD]">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block w-full text-sm font-semibold text-[#8D0801] md:w-[220px]">
            PARTIDO
            <select
              value={partyValue}
              onChange={(event) => onPartyChange(event.target.value)}
              className="mt-6 h-[52px] w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDFDFD] px-4 py-3 text-base font-semibold text-[#8D0801] outline-none"
            >
              <option value="" className="bg-[#FDFDFD]">Todos</option>
              {partyOptions.map((party) => (
                <option key={party} value={party} className="bg-[#FDFDFD]">
                  {party}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="relative z-10 flex justify-end gap-3 px-4 pb-2">
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          className="rounded-[10px] border border-[#d6d1c8] px-5 py-3 text-sm font-semibold text-[#8D0801] disabled:opacity-50"
        >
          Limpar filtros
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={busy}
          className="rounded-[10px] bg-[#8D0801] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Filtrando...' : 'Aplicar filtros'}
        </button>
      </div>
    </div>
  );
}
