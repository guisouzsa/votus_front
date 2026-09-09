export interface Legislator {
  external_id: number;
  chamber: "lower_house" | "senate";
  parliamentary_name: string;
  photo_url: string | null;
  party: string | null;
  state: string | null;
  electoral_status: string | null;
  status: string | null;
  metrics: {
    effectiveness: {
      rate: number | null;
      wilson_lower: number | null;
      total_bills: number | null;
      advanced_bills: number | null;
      calculated_at: string | null;
    };
  };
}

export interface Committee {
  id: number;
  external_id: string;
  name: string;
  acronym: string;
  pivot: {
    role: string | null;
    start_date: string | null;
    end_date: string | null;
  };
}

export interface Topic {
  id: number;
  name: string;
}

export interface Bill {
  id: number;
  external_id: string;
  type: string;
  summary: string;
  presented_at: string | null;
  status_situacao: string | null;
  status_sigla: string | null;
  topics?: Topic[];
}

export interface Profession {
  id: number;
  normalized_name: string;
  pivot: {
    original_name: string | null;
    is_primary: boolean | null;
  };
}

export interface LegislatorDetail extends Legislator {
  civil_name: string | null;
  legislature: number | null;
  phone: string | null;
  email: string | null;
  official_website: string | null;
  effectiveness_total_bills: number | null;
  effectiveness_advanced_bills: number | null;
  effectiveness_rate: string | null;
  effectiveness_wilson_lower: string | null;
  committees: Committee[];
  bills: Bill[];
  professions: Profession[];
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}
