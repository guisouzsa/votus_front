import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import { getAdminToken } from "@/lib/adminAuth";
import type {
  AdminDashboard,
  AdminNewsItem,
  AdminPaginated,
  AdminProposal,
  AdminSuggestion,
  AdminUser,
  NewsCollectResult,
  PaginatedResponse,
  ProposalComment,
  SuggestionQuestion,
  SuggestionQuestionType,
} from "./types";

function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function adminLogin(email: string, password: string) {
  return apiPost<{ token: string; user: AdminUser }>("/api/admin/login", { email, password });
}

export function adminLogout() {
  return apiPost<{ message: string }>("/api/admin/logout", {}, authHeaders());
}

export function getAdminMe() {
  return apiGet<AdminUser>("/api/admin/me", undefined, authHeaders());
}

export function getAdminDashboard() {
  return apiGet<AdminDashboard>("/api/admin/dashboard", undefined, authHeaders());
}

export function collectNews() {
  return apiPost<NewsCollectResult>("/api/admin/news/collect", {}, authHeaders());
}

export function getAdminNews(page = 1, search = "") {
  return apiGet<AdminPaginated<AdminNewsItem>>("/api/admin/news", { page, search }, authHeaders());
}

export function getAdminProposals(page = 1, search = "") {
  return apiGet<AdminPaginated<AdminProposal>>("/api/admin/proposals", { page, search }, authHeaders());
}

export function deleteAdminProposal(id: number) {
  return apiDelete<{ message: string }>(`/api/admin/proposals/${id}`, authHeaders());
}

export function getAdminProposalComments(proposalId: number) {
  return apiGet<PaginatedResponse<ProposalComment>>(
    `/api/admin/proposals/${proposalId}/comments`,
    undefined,
    authHeaders()
  );
}

export function deleteAdminProposalComment(proposalId: number, commentId: number) {
  return apiDelete<{ message: string }>(
    `/api/admin/proposals/${proposalId}/comments/${commentId}`,
    authHeaders()
  );
}

export function getAdminSuggestions(page = 1, search = "") {
  return apiGet<AdminPaginated<AdminSuggestion>>("/api/admin/suggestions", { page, search }, authHeaders());
}

export interface CreateAdminSuggestionPayload {
  name?: string;
  email?: string;
  message: string;
}

export function createAdminSuggestion(payload: CreateAdminSuggestionPayload) {
  return apiPost<{ data: AdminSuggestion }>("/api/admin/suggestions", payload, authHeaders());
}

export function getSuggestionQuestions() {
  return apiGet<{ data: SuggestionQuestion[] }>(
    "/api/admin/suggestion-questions",
    undefined,
    authHeaders()
  );
}

export interface SuggestionQuestionPayload {
  text: string;
  type: SuggestionQuestionType;
  options?: string[];
  required: boolean;
}

export function createSuggestionQuestion(payload: SuggestionQuestionPayload) {
  return apiPost<{ data: SuggestionQuestion }>(
    "/api/admin/suggestion-questions",
    payload,
    authHeaders()
  );
}

export function updateSuggestionQuestion(id: number, payload: SuggestionQuestionPayload) {
  return apiPut<{ data: SuggestionQuestion }>(
    `/api/admin/suggestion-questions/${id}`,
    payload,
    authHeaders()
  );
}

export function deleteSuggestionQuestion(id: number) {
  return apiDelete<{ message: string }>(`/api/admin/suggestion-questions/${id}`, authHeaders());
}
