import { apiGet } from "./apiClient";
import type { NewsArticleApi, NewsListResponse } from "./types";

const MAX_PAGES = 10;

export function getNewsList(page = 1) {
  return apiGet<NewsListResponse>("/api/news", { page });
}

export function getNewsItem(id: number | string) {
  return apiGet<NewsArticleApi>(`/api/news/${id}`);
}

export async function getAllNews(): Promise<NewsArticleApi[]> {
  const first = await getNewsList(1);
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
