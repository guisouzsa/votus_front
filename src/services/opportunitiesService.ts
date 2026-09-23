import { apiGet } from './apiClient';
import type { Opportunity, PublicOpportunity, SimplePaginatedResponse } from './types';

export function getOpportunities(page = 1) {
  return apiGet<SimplePaginatedResponse<Opportunity>>('/api/opportunities', { page });
}

export function getPublicOpportunities(page = 1) {
  return apiGet<SimplePaginatedResponse<PublicOpportunity>>('/api/public-opportunities', { page });
}
