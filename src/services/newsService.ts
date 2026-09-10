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
  const items = [...first.data];
  const lastPage = Math.min(first.last_page, MAX_PAGES);

  for (let page = 2; page <= lastPage; page++) {
    const next = await getNewsList(page);
    items.push(...next.data);
  }

  return items;
}
