import { preload } from "swr";
import { getDeputados } from "@/services/deputadosService";
import { getSenadores } from "@/services/senadoresService";
import { getAllNews } from "@/services/newsService";
import { getProposals } from "@/services/proposalsService";
import { getCategories } from "@/services/categoriesService";

/**
 * Warms the SWR cache for a route's first-page data before the user
 * actually navigates there (on link hover/touch), so the destination page's
 * useSWR resolves from cache instead of showing a loading state.
 */
function safePreload<T>(key: string | readonly unknown[], fetcher: () => Promise<T>) {
  Promise.resolve(preload(key, fetcher)).catch(() => {});
}

const PREFETCH_BY_PATH: Record<string, () => void> = {
  "/DeputadosPage": () => safePreload(["deputados", 1], () => getDeputados({ page: 1 })),
  "/SenadoresPage": () => safePreload(["senadores", 1], () => getSenadores({ page: 1 })),
  "/Painelnoticias": () => safePreload("news", () => getAllNews()),
  "/PropostasPage": () => {
    safePreload(["proposals", 1], () => getProposals({ page: 1 }));
    safePreload("proposal-categories", () => getCategories());
  },
};

export function prefetchRoute(path?: string): void {
  if (!path) return;
  PREFETCH_BY_PATH[path]?.();
}
