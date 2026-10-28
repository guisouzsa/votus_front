'use client';

import SearchBar, { FilterPanelActions, FilterSelect } from '@/components/SearchBar';

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
  // Opcional: resultado da eleição (só candidatos).
  resultValue?: string;
  onResultChange?: (value: string) => void;
  resultOptions?: { value: string; label: string }[];
  onApply: () => void;
  onClear: () => void;
  searchPlaceholder?: string;
  // Desabilita os botões enquanto a busca filtrada está carregando, pra não
  // disparar a mesma requisição várias vezes com cliques repetidos.
  busy?: boolean;
}

// Busca de cargos/candidatos na barra padrão (SearchBar, a mesma de
// Notícias). Os filtros aqui são de confirmação: Enter na busca ou "Aplicar"
// no painel disparam a requisição.
export default function LegislatorFilterFrame({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions,
  partyValue,
  onPartyChange,
  partyOptions,
  resultValue,
  onResultChange,
  resultOptions,
  onApply,
  onClear,
  searchPlaceholder = 'Pesquisar por nome ou partido...',
  busy = false,
}: LegislatorFilterFrameProps) {
  const activeCount = [statusValue, partyValue, resultValue].filter(Boolean).length;

  return (
    <SearchBar
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onSubmit={() => {
        if (!busy) onApply();
      }}
      placeholder={searchPlaceholder}
      activeFilterCount={activeCount}
      filterPanel={(close) => (
        <div>
          {statusOptions && onStatusChange && (
            <FilterSelect label="Situação do mandato" value={statusValue ?? ''} onChange={onStatusChange}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          )}
          {resultOptions && onResultChange && (
            <FilterSelect label="Resultado da eleição" value={resultValue ?? ''} onChange={onResultChange}>
              <option value="">Todos</option>
              {resultOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          )}
          <FilterSelect label="Partido" value={partyValue} onChange={onPartyChange}>
            <option value="">Todos</option>
            {partyOptions.map((party) => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </FilterSelect>
          <FilterPanelActions
            busy={busy}
            onClear={() => {
              onClear();
              close();
            }}
            onApply={() => {
              onApply();
              close();
            }}
          />
        </div>
      )}
    />
  );
}
