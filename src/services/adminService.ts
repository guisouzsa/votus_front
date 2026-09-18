import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./apiClient";
import { getAdminToken } from "@/lib/adminAuth";
import type {
  AdminDashboard,
  AdminExplanation,
  AdminNewsItem,
  AdminPaginated,
  AdminProposal,
  AdminSuggestion,
  AdminUser,
  ExplanationCategory,
  NewsCollectResult,
  PaginatedResponse,
  ProposalComment,
  SuggestionQuestion,
  SuggestionQuestionType,
  TrustedSource,
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

// Só drena o que já está na fila (sem coletar nada novo) — usado pro painel
// continuar processando sozinho enquanto houver pendente, sem precisar de
// vários cliques manuais nem depender só do cron externo.
export function drainNews() {
  return apiPost<NewsCollectResult & { pendentes: number }>("/api/admin/news/drain", {}, authHeaders());
}

export function getAdminNews(page = 1, search = "") {
  return apiGet<AdminPaginated<AdminNewsItem>>("/api/admin/news", { page, search }, authHeaders());
}

export function deleteAdminNews(id: number) {
  return apiDelete<{ message: string }>(`/api/admin/news/${id}`, authHeaders());
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

export function deleteAdminSuggestion(id: number) {
  return apiDelete<{ message: string }>(`/api/admin/suggestions/${id}`, authHeaders());
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

export function getAdminExplanations(page = 1, search = "") {
  return apiGet<AdminPaginated<AdminExplanation>>("/api/admin/explanations", { page, search }, authHeaders());
}

export function getAdminExplanation(id: number) {
  return apiGet<AdminExplanation>(`/api/admin/explanations/${id}`, undefined, authHeaders());
}

export interface CreateExplanationPayload {
  title: string;
  question_title: string;
  category: ExplanationCategory;
  source_urls: string[];
}

export function createAdminExplanation(payload: CreateExplanationPayload) {
  return apiPost<AdminExplanation>("/api/admin/explanations", payload, authHeaders());
}

export interface UpdateExplanationQuizQuestionPayload {
  id: number;
  question: string;
  explanation: string;
  correct_option_id: number;
  options: { id: number; text: string }[];
}

export interface UpdateExplanationPayload {
  title: string;
  question_title: string;
  category: ExplanationCategory;
  summary: string;
  what_is: string;
  purpose: string;
  practical_role: string;
  why_it_matters: string;
  citizen_impact: string;
  example: string;
  quiz: UpdateExplanationQuizQuestionPayload[];
}

export function updateAdminExplanation(id: number, payload: UpdateExplanationPayload) {
  return apiPut<AdminExplanation>(`/api/admin/explanations/${id}`, payload, authHeaders());
}

// Só drena o que já está na fila "explanations" (sem criar nada novo) — o
// painel chama isso repetidamente enquanto houver explicação "generating",
// igual ao drainNews(), porque a janela de 30s que o store() já tenta
// drenar sozinho pode não bastar (rate limit da Groq, fonte lenta etc.).
export function drainExplanations() {
  return apiPost<{ status: string; gerando: number }>("/api/admin/explanations/drain", {}, authHeaders());
}

export function publishAdminExplanation(id: number) {
  return apiPost<AdminExplanation>(`/api/admin/explanations/${id}/publish`, {}, authHeaders());
}

export function unpublishAdminExplanation(id: number) {
  return apiPatch<AdminExplanation>(`/api/admin/explanations/${id}/unpublish`, {}, authHeaders());
}

export function deleteAdminExplanation(id: number) {
  return apiDelete<{ message: string }>(`/api/admin/explanations/${id}`, authHeaders());
}

export function getAdminTrustedSources() {
  return apiGet<TrustedSource[]>("/api/admin/trusted-sources", undefined, authHeaders());
}

export interface TrustedSourcePayload {
  name: string;
  base_url: string;
}

export function createAdminTrustedSource(payload: TrustedSourcePayload) {
  return apiPost<TrustedSource>("/api/admin/trusted-sources", payload, authHeaders());
}

export interface UpdateTrustedSourcePayload {
  name: string;
  domain: string;
  is_active: boolean;
}

export function updateAdminTrustedSource(id: number, payload: UpdateTrustedSourcePayload) {
  return apiPut<TrustedSource>(`/api/admin/trusted-sources/${id}`, payload, authHeaders());
}

export function deleteAdminTrustedSource(id: number) {
  return apiDelete<{ message: string }>(`/api/admin/trusted-sources/${id}`, authHeaders());
}
