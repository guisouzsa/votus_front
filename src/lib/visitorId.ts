const STORAGE_KEY = "votus_visitor_id";

/**
 * Anonymous, per-browser identifier used only to prevent duplicate votes on
 * proposals. Not an account or login — see PropostasPage. Falls back to a
 * throwaway id if storage is unavailable (private browsing, blocked storage)
 * so voting still works, it just won't be remembered across reloads.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  try {
    let id = window.localStorage.getItem(STORAGE_KEY);

    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }

    return id;
  } catch {
    return crypto.randomUUID();
  }
}
