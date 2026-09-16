import { apiGet, apiPost } from "./apiClient";
import type { SuggestionQuestion } from "./types";

export function getSuggestionQuestions() {
  return apiGet<{ data: SuggestionQuestion[] }>("/api/suggestion-questions");
}

export interface SubmitSuggestionPayload {
  name?: string;
  email?: string;
  answers: { suggestion_question_id: number; answer: string }[];
}

export function createSuggestion(payload: SubmitSuggestionPayload) {
  return apiPost<{ message: string }>("/api/suggestions", payload);
}
