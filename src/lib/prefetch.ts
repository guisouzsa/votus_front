import { preload } from "swr";
import { getNewsFeed } from "@/services/newsService";
import { getProposals } from "@/services/proposalsService";

/**
 * Warms the SWR cache for a route's first-page data before the user
 * actually navigates there (on link hover/touch), so the destination page's
 * useSWR resolves from cache instead of showing a loading state.
 */
function safePreload<T>(key: string | readonly unknown[], fetcher: () => Promise<T>) {
  Promise.resolve(preload(key, fetcher)).catch(() => {});
}

// Só rotas cujos dados são buscados no navegador. Deputados, Senadores e
// Candidatos saíram daqui: a página já vem com os dados do servidor (ISR, ver
// page.tsx de cada uma) e o <Link> do Next pré-carrega isso sozinho — o
// preload via API só gerava mais uma requisição ao backend a cada hover.
const PREFETCH_BY_PATH: Record<string, () => void> = {
  "/Painelnoticias": () => safePreload("news-feed", getNewsFeed),
  "/PropostasPage": () => safePreload(["proposals", 1], () => getProposals({ page: 1 })),
};

export function prefetchRoute(path?: string): void {
  if (!path) return;
  PREFETCH_BY_PATH[path]?.();
}
