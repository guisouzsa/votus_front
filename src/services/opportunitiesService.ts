import { apiGet } from './apiClient';
import type { Opportunity, PublicOpportunity, PaginatedResponse } from './types';

export function getOpportunities(page = 1) {
  return apiGet<PaginatedResponse<Opportunity>>('/api/opportunities', { page });
}

export function getPublicOpportunities(page = 1) {
  return apiGet<PaginatedResponse<PublicOpportunity>>('/api/public-opportunities', { page });
}
