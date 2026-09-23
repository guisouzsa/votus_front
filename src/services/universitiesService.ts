import { apiGet } from './apiClient';
import type { CourseOffering, CourseOfferingFilterOptions, SimplePaginatedResponse } from './types';

export interface CourseOfferingFilters {
  state?: string;
  city_code?: string;
  course?: string;
  modality?: string;
  sector?: string;
  page?: number;
}

export type CourseOfferingListResponse = SimplePaginatedResponse<CourseOffering> & {
  filter_options: CourseOfferingFilterOptions;
};

export function getCourseOfferings(filters: CourseOfferingFilters = {}) {
  return apiGet<CourseOfferingListResponse>('/api/course-offerings', {
    state: filters.state,
    city_code: filters.city_code,
    course: filters.course,
    modality: filters.modality,
    sector: filters.sector,
    page: filters.page,
  });
}

export function getMunicipalities(state: string) {
  return apiGet<{ ibge_city_code: string; city: string }[]>('/api/course-offerings/options/municipalities', {
    state,
  });
}

export function getCourses(state: string, cityCode: string) {
  return apiGet<{ name: string; normalized_name: string }[]>('/api/course-offerings/options/courses', {
    state,
    city_code: cityCode,
  });
}
