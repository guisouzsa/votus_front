import { apiGet } from "./apiClient";
import type { Category } from "./types";

export function getCategories(search?: string) {
  return apiGet<{ data: Category[] }>("/api/categories", { q: search });
}
