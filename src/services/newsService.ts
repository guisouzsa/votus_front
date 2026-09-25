import { apiGet } from "./apiClient";
import type { NewsArticleApi, NewsListResponse } from "./types";

const MAX_PAGES = 10;

export function getNewsList(page = 1, perPage?: number) {
  return apiGet<NewsListResponse>("/api/news", { page, per_page: perPage });
}

export function getNewsItem(id: number | string) {
  return apiGet<NewsArticleApi>(`/api/news/${id}`);
}

const PER_PAGE_PADRAO = 15;

export async function getAllNews(): Promise<NewsArticleApi[]> {
  // Uma requisição só com as mesmas até 150 notícias (MAX_PAGES × 15) que
  // antes vinham em 10 chamadas. O backend processava as 10 em fila, uma de
  // cada vez, então "em paralelo" na prática somava ~10× a latência.
  const first = await getNewsList(1, MAX_PAGES * PER_PAGE_PADRAO);

  // Backend ainda sem suporte a per_page (responde 15 por página): segue o
  // caminho antigo pra nunca mostrar menos notícias do que antes.
  if (Number(first.per_page) >= MAX_PAGES * PER_PAGE_PADRAO) {
    return first.data;
  }

  const lastPage = Math.min(first.last_page, MAX_PAGES);

  if (lastPage <= 1) {
    return first.data;
  }

  // Paralelo em vez de sequencial: já sabemos quantas páginas existem a
  // partir da primeira resposta, então não há motivo pra esperar uma
  // terminar pra pedir a próxima — isso sozinho fazia essa tela demorar
  // até 10x mais que o necessário pra carregar.
  const restantes = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, i) => getNewsList(i + 2))
  );

  return [...first.data, ...restantes.flatMap((pagina) => pagina.data)];
}
