// Configuração central do Gerador de Cola Eleitoral: quais cargos cada eleição
// tem, em que ordem aparecem na urna, quantos dígitos e quantas vagas. A tela, a
// prévia e o PDF só leem daqui. Pra adicionar uma eleição: inclua um item em
// ELECTIONS (ver "status" em ElectionValidation) e rode `npm test`.
//
// Só tipos e funções puras neste arquivo, pra rodar nos testes sem o Next.
import type { CandidateOfficeSlug } from "@/services/candidatesService";

export type ElectionType = "general" | "municipal" | "custom";
export type ElectionBase = "general" | "municipal";
export type Round = 1 | 2;

export type PositionId =
  | "vereador"
  | "prefeito"
  | "deputado-federal"
  | "deputado-estadual"
  | "senador"
  | "governador"
  | "presidente";

export interface PositionRule {
  id: PositionId;
  label: string;
  digits: number;
  base: ElectionBase;
  /** Só os proporcionais aceitam voto de legenda (Lei 9.504, art. 60). */
  system: "proporcional" | "majoritario";
  /** Se o cargo pode ter segundo turno. Não quer dizer que toda disputa terá. */
  hasRunoff: boolean;
  /** Listagem de candidatos no Votus. Sem isso, o preenchimento é só manual. */
  candidateOffice?: CandidateOfficeSlug;
}

export const POSITION_RULES: Record<PositionId, PositionRule> = {
  vereador: { id: "vereador", label: "Vereador", digits: 5, base: "municipal", system: "proporcional", hasRunoff: false },
  prefeito: { id: "prefeito", label: "Prefeito", digits: 2, base: "municipal", system: "majoritario", hasRunoff: true },
  "deputado-federal": {
    id: "deputado-federal",
    label: "Deputado Federal",
    digits: 4,
    base: "general",
    system: "proporcional",
    hasRunoff: false,
    candidateOffice: "deputado-federal",
  },
  "deputado-estadual": {
    id: "deputado-estadual",
    label: "Deputado Estadual",
    digits: 5,
    base: "general",
    system: "proporcional",
    hasRunoff: false,
    candidateOffice: "deputado-estadual",
  },
  senador: {
    id: "senador",
    label: "Senador",
    digits: 3,
    base: "general",
    system: "majoritario",
    hasRunoff: false,
    candidateOffice: "senado",
  },
  governador: {
    id: "governador",
    label: "Governador",
    digits: 2,
    base: "general",
    system: "majoritario",
    hasRunoff: true,
    candidateOffice: "governador",
  },
  presidente: {
    id: "presidente",
    label: "Presidente",
    digits: 2,
    base: "general",
    system: "majoritario",
    hasRunoff: true,
    candidateOffice: "presidente",
  },
};

/** Ordem dos cargos na urna em cada modelo. */
export const VOTING_ORDER: Record<ElectionBase, PositionId[]> = {
  general: ["deputado-federal", "deputado-estadual", "senador", "governador", "presidente"],
  municipal: ["vereador", "prefeito"],
};

/** Dígitos do número do partido, usados no voto de legenda. */
export const PARTY_DIGITS = 2;

export interface ElectionSource {
  label: string;
  url: string;
}

export interface ElectionValidation {
  /**
   * oficial: conferida com a publicação do TSE sobre aquela eleição.
   * prevista: aplica a legislação atual a um ciclo futuro; rever se a lei mudar.
   * personalizada: os cargos foram escolhidos pela própria pessoa.
   */
  status: "oficial" | "prevista" | "personalizada";
  note: string;
}

export interface ElectionPosition {
  position: PositionId;
  vacancies: number;
}

export interface ElectionConfig {
  id: string;
  year: number | null;
  type: ElectionType;
  base: ElectionBase;
  label: string;
  description: string;
  /** Na ordem da urna. */
  positions: ElectionPosition[];
  sources: ElectionSource[];
  validation: ElectionValidation;
  /** Onde o Votus tem candidatos desta eleição. Sem isso, nenhuma busca é feita. */
  candidateData?: { states: string[] };
}

const SOURCES = {
  lei: { label: "Lei das Eleições (Lei 9.504/1997)", url: "https://www.planalto.gov.br/ccivil_03/leis/l9504.htm" },
  constituicao: { label: "Constituição Federal", url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" },
  tse2026: {
    label: "TSE: ordem de votação em 2026",
    url: "https://www.tse.jus.br/comunicacao/noticias/2026/Marco/eleicoes-2026-conheca-a-ordem-de-votacao-na-urna-eletronica",
  },
  tseMunicipal: {
    label: "TSE: ordem de votação nas eleições municipais",
    url: "https://www.tse.jus.br/comunicacao/noticias/2024/Abril/vereador-ou-prefeito-conheca-a-ordem-de-votacao-nas-eleicoes-2024",
  },
  simulador: { label: "TSE: simulador de votação", url: "https://www.tse.jus.br/hotsites/simulador-de-votacao/" },
} satisfies Record<string, ElectionSource>;

export const ELECTIONS: ElectionConfig[] = [
  {
    id: "eleicoes-gerais-2026",
    year: 2026,
    type: "general",
    base: "general",
    label: "Eleições Gerais de 2026",
    description: "Seis votos: duas vagas de senador por estado.",
    positions: [
      { position: "deputado-federal", vacancies: 1 },
      { position: "deputado-estadual", vacancies: 1 },
      { position: "senador", vacancies: 2 },
      { position: "governador", vacancies: 1 },
      { position: "presidente", vacancies: 1 },
    ],
    sources: [SOURCES.tse2026, SOURCES.simulador, SOURCES.lei],
    validation: { status: "oficial", note: "Ordem e dígitos conforme as publicações do TSE para 2026." },
    candidateData: { states: ["CE"] },
  },
  {
    id: "eleicoes-municipais-2028",
    year: 2028,
    type: "municipal",
    base: "municipal",
    label: "Eleições Municipais de 2028",
    description: "Dois votos: vereador e prefeito.",
    positions: [
      { position: "vereador", vacancies: 1 },
      { position: "prefeito", vacancies: 1 },
    ],
    sources: [SOURCES.tseMunicipal, SOURCES.lei, SOURCES.constituicao],
    validation: {
      status: "prevista",
      note: "Modelo previsto: segue as regras da última eleição municipal e pode mudar. Confira no TSE perto da eleição.",
    },
  },
  {
    id: "eleicoes-gerais-2030",
    year: 2030,
    type: "general",
    base: "general",
    label: "Eleições Gerais de 2030",
    description: "Cinco votos: uma vaga de senador por estado.",
    positions: [
      { position: "deputado-federal", vacancies: 1 },
      { position: "deputado-estadual", vacancies: 1 },
      { position: "senador", vacancies: 1 },
      { position: "governador", vacancies: 1 },
      { position: "presidente", vacancies: 1 },
    ],
    sources: [SOURCES.constituicao, SOURCES.lei],
    validation: {
      status: "prevista",
      note: "Modelo previsto: uma vaga de senador pela alternância de um e dois terços (Constituição, art. 46). Confira no TSE perto da eleição.",
    },
  },
];

export const DEFAULT_ELECTION_ID = "eleicoes-gerais-2026";
export const CUSTOM_ELECTION_ID = "personalizada";

export function getElection(id: string): ElectionConfig | undefined {
  return ELECTIONS.find((election) => election.id === id);
}

export interface CustomElectionInput {
  base: ElectionBase;
  positions: PositionId[];
  senateVacancies: 1 | 2;
}

/**
 * Eleição suplementar ou combinação específica: a pessoa escolhe os cargos, e a
 * ordem continua vindo de VOTING_ORDER. Cargos de outro modelo ficam de fora.
 */
export function buildCustomElection({ base, positions, senateVacancies }: CustomElectionInput): ElectionConfig {
  return {
    id: CUSTOM_ELECTION_ID,
    year: null,
    type: "custom",
    base,
    label: "Eleição suplementar",
    description: "Só os cargos que você escolher.",
    positions: VOTING_ORDER[base]
      .filter((position) => positions.includes(position))
      .map((position) => ({ position, vacancies: position === "senador" ? senateVacancies : 1 })),
    sources: [SOURCES.lei, SOURCES.simulador],
    validation: {
      status: "personalizada",
      note: "Você escolheu os cargos. Confira no site do TRE do seu estado o que está em disputa.",
    },
  };
}

/**
 * A mesma eleição sem os cargos que a pessoa tirou da colinha. Vale pra qualquer
 * eleição, e o resto (ordem, numeração, turnos) continua saindo da configuração.
 */
export function withoutPositions(election: ElectionConfig, hidden: PositionId[]): ElectionConfig {
  return { ...election, positions: election.positions.filter(({ position }) => !hidden.includes(position)) };
}

/** Cargos desta eleição que podem ter segundo turno. */
export function getRunoffPositions(election: ElectionConfig): PositionId[] {
  return election.positions.map(({ position }) => position).filter((position) => POSITION_RULES[position].hasRunoff);
}

export function getRounds(election: ElectionConfig): Round[] {
  return getRunoffPositions(election).length > 0 ? [1, 2] : [1];
}

export interface BallotSlot {
  /** Estável entre turnos: o número digitado continua se o cargo se repete. */
  id: string;
  order: number;
  position: PositionId;
  label: string;
  digits: number;
  vacancy: number;
  allowsPartyVote: boolean;
  candidateOffice?: CandidateOfficeSlug;
}

function positionLabel(position: PositionId, state: string | undefined) {
  if (position === "deputado-estadual" && state === "DF") return "Deputado Distrital";
  return POSITION_RULES[position].label;
}

function candidateOfficeFor(election: ElectionConfig, rule: PositionRule, state: string | undefined) {
  if (!election.candidateData) return undefined;
  // Presidente é nacional: os candidatos são os mesmos em qualquer estado.
  if (rule.id === "presidente" || (state && election.candidateData.states.includes(state))) return rule.candidateOffice;
  return undefined;
}

/**
 * A lista de votos da colinha, na ordem da urna. No segundo turno entram só os
 * cargos marcados em `runoffPositions` (que dependem do resultado do 1º turno).
 */
export function buildBallot(
  election: ElectionConfig,
  { round = 1, runoffPositions, state }: { round?: Round; runoffPositions?: PositionId[]; state?: string } = {}
): BallotSlot[] {
  const available = getRunoffPositions(election);
  const entries =
    round === 2
      ? election.positions
          .filter(({ position }) => available.includes(position) && (runoffPositions ?? available).includes(position))
          .map(({ position }) => ({ position, vacancies: 1 }))
      : election.positions;

  const slots: BallotSlot[] = [];
  for (const { position, vacancies } of entries) {
    const rule = POSITION_RULES[position];
    for (let vacancy = 1; vacancy <= vacancies; vacancy += 1) {
      const label = positionLabel(position, state);
      slots.push({
        id: `${election.id}:${position}:${vacancy}`,
        order: slots.length + 1,
        position,
        label: vacancies > 1 ? `${label} — ${vacancy}ª vaga` : label,
        digits: rule.digits,
        vacancy,
        allowsPartyVote: rule.system === "proporcional",
        candidateOffice: candidateOfficeFor(election, rule, state),
      });
    }
  }
  return slots;
}

export interface SlotValue {
  numero: string;
  /** Voto só no partido: vale apenas nos cargos proporcionais. */
  legenda?: boolean;
}

export function expectedDigits(slot: BallotSlot, value?: SlotValue) {
  return slot.allowsPartyVote && value?.legenda ? PARTY_DIGITS : slot.digits;
}

export function typedNumber(value?: SlotValue) {
  return (value?.numero ?? "").replace(/\s/g, "");
}

/**
 * Erros por voto. Campo vazio não é erro: a colinha sai com os quadrinhos em
 * branco, pra preencher à mão. Número pela metade e o mesmo número nas duas vagas
 * do cargo, sim.
 */
export function validateBallot(slots: BallotSlot[], values: Record<string, SlotValue>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const slot of slots) {
    const typed = typedNumber(values[slot.id]);
    const digits = expectedDigits(slot, values[slot.id]);
    if (typed.length > 0 && typed.length !== digits) errors[slot.id] = `Preencha os ${digits} dígitos.`;
  }

  for (const slot of slots) {
    const typed = typedNumber(values[slot.id]);
    if (!typed || errors[slot.id] || slot.vacancy === 1) continue;
    const repeated = slots.some(
      (other) => other.position === slot.position && other.vacancy < slot.vacancy && typedNumber(values[other.id]) === typed
    );
    if (repeated) errors[slot.id] = "Escolha um número diferente em cada vaga.";
  }

  return errors;
}

export const BRAZILIAN_STATES: { uf: string; name: string }[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

/** O Distrito Federal não se divide em municípios (Constituição, art. 32). */
export function getStatesFor(base: ElectionBase) {
  return base === "municipal" ? BRAZILIAN_STATES.filter(({ uf }) => uf !== "DF") : BRAZILIAN_STATES;
}

/** Linha de identificação que sai na colinha. */
export function describeBallot(
  election: ElectionConfig,
  { round, state, municipio }: { round: Round; state?: string; municipio?: string }
) {
  const parts = [election.year ? `Eleições ${election.year}` : election.label];
  if (getRounds(election).length > 1) parts.push(`${round}º turno`);
  const place = election.base === "municipal" && municipio?.trim() ? `${municipio.trim()}/${state}` : state;
  if (place) parts.push(place);
  return parts.join(" · ");
}
