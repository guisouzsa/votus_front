import useSWR, { type SWRResponse } from 'swr';

/**
 * SWR para uma listagem paginada cuja primeira página já vem pronta do
 * servidor (ver page.tsx de cada rota: busca a página 1 e passa como
 * `fallbackData`). Centraliza duas correções que já se repetiram em mais de
 * uma tela (Deputados, Senadores, Candidatos) e que voltariam a dar problema
 * se cada uma reimplementasse isso à mão:
 *
 * 1. `loading` não usa o `isLoading` do SWR — por definição ele ignora
 *    fallbackData ("This bypasses fallback data and laggy data", doc da
 *    própria lib), então ficaria `true` no primeiro render mesmo já tendo o
 *    dado da página 1, mostrando skeleton à toa antes de trocar pro real.
 * 2. Sem `revalidateIfStale: false` na página com fallbackData, o SWR
 *    dispara um fetch redundante ao montar mesmo com dado fresco do
 *    servidor — trabalho de rede/JS competindo bem na hora em que a página
 *    mais precisa ficar interativa rápido (afeta diretamente o tempo até os
 *    links da tela responderem a clique).
 */
export function useSsrPaginatedList<T>(
  key: unknown[],
  fetcher: () => Promise<T>,
  fallbackData: T | undefined
): Pick<SWRResponse<T>, 'error' | 'mutate'> & { data: T | undefined; loading: boolean } {
  const { data, error, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    fallbackData,
    revalidateIfStale: !fallbackData,
  });

  return { data, error, mutate, loading: !data && !error };
}
