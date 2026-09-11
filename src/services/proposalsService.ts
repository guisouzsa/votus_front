import { apiDelete, apiGet, apiPost } from "./apiClient";
import { getVisitorId } from "@/lib/visitorId";
import type { PaginatedResponse, Proposal, ProposalComment, ProposalVoteType } from "./types";

export interface GetProposalsParams {
  page?: number;
}

export interface CreateProposalPayload {
  title: string;
  content: string;
  categories?: string[];
  author: string;
}

export interface CreateCommentPayload {
  content: string;
  author_name?: string;
}

function visitorHeaders(): Record<string, string> {
  return { "X-Visitor-Id": getVisitorId() };
}

export function getProposals(params: GetProposalsParams = {}) {
  return apiGet<PaginatedResponse<Proposal>>(
    "/api/proposals",
    { page: params.page },
    visitorHeaders()
  );
}

export function getProposal(id: number | string) {
  return apiGet<{ data: Proposal }>(`/api/proposals/${id}`, undefined, visitorHeaders());
}

export function createProposal(payload: CreateProposalPayload) {
  return apiPost<{ data: Proposal }>("/api/proposals", payload, visitorHeaders());
}

export function voteOnProposal(id: number | string, vote: ProposalVoteType) {
  return apiPost<{ data: Proposal }>(`/api/proposals/${id}/vote`, { vote }, visitorHeaders());
}

export function deleteVote(id: number | string) {
  return apiDelete<{ data: Proposal }>(`/api/proposals/${id}/vote`, visitorHeaders());
}

export function getProposalComments(id: number | string) {
  return apiGet<PaginatedResponse<ProposalComment>>(
    `/api/proposals/${id}/comments`,
    undefined,
    visitorHeaders()
  );
}

export function createComment(id: number | string, payload: CreateCommentPayload) {
  return apiPost<{ data: ProposalComment }>(
    `/api/proposals/${id}/comments`,
    payload,
    visitorHeaders()
  );
}

export function deleteComment(proposalId: number | string, commentId: number | string) {
  return apiDelete<{ message: string }>(
    `/api/proposals/${proposalId}/comments/${commentId}`,
    visitorHeaders()
  );
}
