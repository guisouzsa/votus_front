import { apiGet, apiPost } from "./apiClient";
import { getVisitorId } from "@/lib/visitorId";
import type { PaginatedResponse, Proposal, ProposalVoteType } from "./types";

export interface GetProposalsParams {
  page?: number;
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

export function voteOnProposal(id: number | string, vote: ProposalVoteType) {
  return apiPost<{ data: Proposal }>(`/api/proposals/${id}/vote`, { vote }, visitorHeaders());
}
