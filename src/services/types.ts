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
