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

export interface NewsArticleApi {
  id: number;
  title: string;
  original_summary: string | null;
  ai_summary: string | null;
  url: string | null;
  source: string | null;
  category: string | null;
  published_at: string | null;
  imported_at: string | null;
  relevance_score: number | null;
  keywords: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  site_logo_url: string | null;
}

export type ProposalVoteType = "legal" | "not_support";

export interface Proposal {
  id: number;
  title: string;
  content: string;
  categories: string[];
  author: string | null;
  created_at: string;
  votes: {
    legal: number;
    not_support: number;
  };
  viewer_vote: ProposalVoteType | null;
  comments_count: number;
}

export interface ProposalComment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
  can_delete: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface NewsListResponse {
  current_page: number;
  data: NewsArticleApi[];
  last_page: number;
  per_page: number;
  total: number;
}

// Formato padrão do paginator do Laravel (LengthAwarePaginator::toJson), usado
// pelos endpoints /api/admin/* que devolvem o model puro em vez de um Resource
// — por isso é uma forma "achatada", diferente de PaginatedResponse<T> acima.
export interface AdminPaginated<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

export interface AdminNewsSummary {
  id: number;
  title: string;
  topicos: string[];
  published: boolean;
  status_resumo: string | null;
  erro_resumo: string | null;
  adicionada_em: string | null;
}

export interface AdminNewsItem {
  id: number;
  title: string;
  category: string | null;
  published: boolean;
  status_resumo: string | null;
  erro_resumo: string | null;
  tentativas_resumo: number;
  imported_at: string | null;
}

export interface AdminDashboard {
  noticias: {
    total: number;
    ultima_atualizacao_em: string | null;
    adicionadas_na_ultima_execucao: number;
    status: "ok" | "com_falhas";
    fontes_com_falha: number;
    ultimas: AdminNewsSummary[];
  };
  dados_politicos: {
    deputados: number;
    senadores: number;
  };
  participacao: {
    santinhos_gerados: number;
    acessos_registrados: number;
  };
  moderacao: {
    propostas_publicadas: number;
    propostas_removidas: number;
  };
  sugestoes: {
    total: number;
  };
}

export interface AdminProposal {
  id: number;
  title: string;
  content: string;
  author: string | null;
  categories: string[];
  status: "published" | "draft" | "removed";
  created_at: string;
}

export interface AdminSuggestionAnswer {
  id: number;
  answer: string;
  question: { id: number; text: string } | null;
}

export interface AdminSuggestion {
  id: number;
  name: string | null;
  email: string | null;
  message: string | null;
  answers: AdminSuggestionAnswer[];
  created_at: string;
}

export type SuggestionQuestionType = "choice" | "text";

export interface SuggestionQuestion {
  id: number;
  text: string;
  type: SuggestionQuestionType;
  options: string[] | null;
  required: boolean;
  order_index: number;
  // Só presente na listagem do admin: contagem de respostas por opção,
  // ex: { "Sim, gostei": 3, "Não gostei": 1 } — undefined em perguntas de texto livre.
  stats?: Record<string, number>;
}

export interface NewsCollectResult {
  status: string;
  coleta?: string;
  fila?: string;
  message?: string;
}
