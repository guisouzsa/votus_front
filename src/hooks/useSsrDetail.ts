import useSWR, { type SWRResponse } from 'swr';

/**
 * SWR para uma página de detalhe cujo item já foi buscado no servidor (ver
 * page.tsx de cada rota: o mesmo fetch que monta o <title> é repassado como
 * `initialData`). Antes, o servidor buscava o item só pro metadata e
 * descartava; o HTML chegava com skeleton e o navegador buscava o MESMO item
 * de novo depois de hidratar — uma segunda ida ao backend, em cascata, só
 * pra mostrar o que o servidor já tinha em mãos.
 *
 * Mesmas duas regras de useSsrPaginatedList: `isLoading` não usa o do SWR
 * (que ignora fallbackData) e não revalida ao montar quando já veio dado do
 * servidor. Se o servidor falhou (initialData undefined), cai no fetch
 * normal do client, como era antes.
 */
export function useSsrDetail<T>(
  key: unknown[] | null,
  fetcher: () => Promise<T>,
  initialData: T | undefined
): Pick<SWRResponse<T>, 'error' | 'mutate'> & { data: T | undefined; isLoading: boolean } {
  const { data, error, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    fallbackData: initialData,
    revalidateIfStale: !initialData,
  });

  return { data, error, mutate, isLoading: Boolean(key) && !data && !error };
}
