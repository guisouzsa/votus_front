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
    productivity: {
      bills_per_year: number | null;
    };
    thematic_focus: {
      index: number | null;
      total_bills: number;
      top_topic: {
        id: number;
        name: string;
        share: number;
      } | null;
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
  productivity_bills_per_year: string | null;
  thematic_focus_index: string | null;
  thematic_focus_total_bills: number | null;
  thematic_focus_top_topic_share: string | null;
  thematic_focus_top_topic: Topic | null;
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

// Formato do Laravel simplePaginate() — sem last_page/total, porque não faz
// a query de COUNT (mais barato). Usado só onde o dado sempre cabe numa
// única página (deputados/senadores, ~20-30 registros), então não faz
// sentido pagar o custo de contar o total a cada requisição.
export interface SimplePaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    current_page_url: string;
    from: number | null;
    per_page: number;
    to: number | null;
    path: string;
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

export interface NewsListResponse {
  current_page: number;
  data: NewsArticleApi[];
  last_page: number;
  per_page: number;
  total: number;
  // Notícia principal escolhida no backend (só na página 1). Opcional: um
  // backend ainda sem esse campo simplesmente não manda.
  destaque?: NewsArticleApi | null;
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
  image_url: string | null;
  status_resumo: string | null;
  erro_resumo: string | null;
  tentativas_resumo: number;
  imported_at: string | null;
}

export interface AdminDashboard {
  noticias: {
    total: number;
    publicadas: number;
    pendentes: number;
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

export type ExplanationCategory = "Órgãos e instituições" | "Cargos políticos" | "Eleições e voto";

export type ExplanationStatus = "generating" | "review" | "published" | "failed";

export interface ExplanationSourceApi {
  id: number;
  name: string;
  url: string;
  domain: string;
}

export interface QuizOptionApi {
  id: number;
  text: string;
  is_correct: boolean;
  position: number;
}

export interface QuizQuestionApi {
  id: number;
  question: string;
  explanation: string | null;
  position: number;
  options: QuizOptionApi[];
}

// Formato público (ExplanationResource) — usado em /explicacao.
export interface ExplanationApi {
  id: number;
  title: string;
  slug: string;
  question_title: string;
  category: string;
  summary: string | null;
  what_is: string | null;
  purpose: string | null;
  practical_role: string | null;
  why_it_matters: string | null;
  citizen_impact: string | null;
  example: string | null;
  published_at: string | null;
  sources?: ExplanationSourceApi[];
  quiz_questions?: QuizQuestionApi[];
}

export interface ExplanationListResponse {
  data: ExplanationApi[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Formato do admin (model puro do Laravel) — inclui campos internos que o
// público nunca vê (status, generation_error, content_version).
export interface AdminExplanation {
  id: number;
  title: string;
  slug: string;
  question_title: string;
  category: string;
  summary: string | null;
  what_is: string | null;
  purpose: string | null;
  practical_role: string | null;
  why_it_matters: string | null;
  citizen_impact: string | null;
  example: string | null;
  status: ExplanationStatus;
  content_version: number;
  generation_error: string | null;
  published_at: string | null;
  created_at: string;
  sources_count?: number;
  quiz_questions_count?: number;
  sources?: { id: number; source_name: string; source_url: string; source_domain: string }[];
  quiz_questions?: {
    id: number;
    question: string;
    explanation: string | null;
    position: number;
    options: { id: number; option_text: string; is_correct: boolean; position: number }[];
  }[];
}

export interface TrustedSource {
  id: number;
  name: string;
  domain: string;
  base_url: string | null;
  is_active: boolean;
}

// Vaga privada, importada da Adzuna. Vários campos vêm nulos com frequência
// (contract_type, salary_min/max) — a própria fonte não preenche sempre.
export interface Opportunity {
  external_id: string;
  opportunity_type: string;
  title: string;
  company: string | null;
  description: string | null;
  location: string | null;
  category: string | null;
  contract_type: string | null;
  contract_time: string | null;
  salary_min: string | null;
  salary_max: string | null;
  external_url: string | null;
  published_at: string | null;
}

export type PublicOpportunityStatus = 'aberto' | 'em_breve' | 'encerrado' | 'indefinido';

// Concurso público / processo seletivo, extraído de diário oficial por IA.
export interface PublicOpportunity {
  source_key: string;
  type: string;
  title: string;
  notice_number: string | null;
  agency: string | null;
  municipality: string | null;
  state: string | null;
  positions: string[];
  education_levels: string[];
  vacancies: number | null;
  salary_min: string | null;
  salary_max: string | null;
  registration_start: string | null;
  registration_end: string | null;
  exam_date: string | null;
  fee_min: string | null;
  fee_max: string | null;
  registration_url: string | null;
  summary: string | null;
  status: PublicOpportunityStatus;
}

export interface AdmissionMethod {
  type: string | null;
  name: string;
  description: string | null;
  official_url: string | null;
  verified_at: string | null;
}

export interface University {
  mec_code: string;
  name: string;
  acronym: string | null;
  administrative_category: string | null;
  academic_organization: string | null;
  sector: 'public' | 'private' | string;
  website: string | null;
  admission_methods?: AdmissionMethod[];
  campuses?: Campus[];
}

export interface Campus {
  name: string;
  city: string;
  ibge_city_code: string;
  state: string;
  region: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  university?: University;
  course_offerings?: CourseOffering[];
}

export interface CourseOffering {
  id: number;
  mec_course_code: number | string | null;
  name: string;
  degree: string | null;
  area: string | null;
  modality: string | null;
  status: string | null;
  authorized_vacancies: number | null;
  workload_hours: number | null;
  source_name: string | null;
  source_updated_at: string | null;
  campus?: Campus;
}

export interface CourseOfferingFilterOptions {
  states: string[];
  modalities: string[];
  municipalities: { ibge_city_code: string; city: string }[];
  courses: { name: string; normalized_name: string }[];
}

export interface CandidateParty {
  acronym: string | null;
  name: string | null;
}

// Mandato anterior do candidato como parlamentar (cruzado por CPF) — reaproveita
// só os campos de identificação, sem as métricas de efetividade/produtividade.
export interface CandidatePreviousMandate {
  id: number;
  chamber: "lower_house" | "senate";
  parliamentary_name: string;
  party: string | null;
  state: string | null;
  status: string | null;
}

export interface Candidate {
  id: number;
  ballot_number: string | null;
  round: number | null;
  state: string | null;
  office: string;
  civil_name: string;
  ballot_name: string;
  party: CandidateParty;
  education_level: string | null;
  occupation: string | null;
  race_color: string | null;
  photo_url: string | null;
  proposal_document_url: string | null;
  election_year: number;
  // Só vêm preenchidos no perfil (/candidates/{id}) — a listagem não carrega
  // essas relações de propósito, pra não misturar vice/suplente com titular.
  running_mates?: Candidate[];
  previous_mandates?: CandidatePreviousMandate[];
}
