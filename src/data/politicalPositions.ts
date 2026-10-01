export type Branch = 'executivo' | 'legislativo';
export type Level = 'federal' | 'estadual' | 'municipal';

export interface PoliticalPosition {
  id: string;
  name: string;
  branch: Branch;
  level: Level;
  levelLabel: string;
  description: string;
  termLength: string;
  election: string;
  mainFunction: string;
}

export const POSITIONS: PoliticalPosition[] = [
  {
    id: 'presidente',
    name: 'Presidente da República',
    branch: 'executivo',
    level: 'federal',
    levelLabel: 'Federal',
    description: 'Chefia o governo federal e representa o Brasil no país e no exterior.',
    termLength: '4 anos',
    election: 'Majoritária (2 turnos)',
    mainFunction: 'Governar o país e sancionar leis federais',
  },
  {
    id: 'governador',
    name: 'Governador',
    branch: 'executivo',
    level: 'estadual',
    levelLabel: 'Estadual',
    description: 'Chefia o governo do estado e executa políticas estaduais como saúde e segurança pública.',
    termLength: '4 anos',
    election: 'Majoritária (2 turnos)',
    mainFunction: 'Governar o estado e sancionar leis estaduais',
  },
  {
    id: 'senador',
    name: 'Senador',
    branch: 'legislativo',
    level: 'federal',
    levelLabel: 'Federal',
    description: 'Representa o estado no Senado Federal e vota as leis de interesse nacional.',
    termLength: '8 anos',
    election: 'Majoritária',
    mainFunction: 'Votar leis federais e aprovar indicações do Presidente',
  },
  {
    id: 'deputado-federal',
    name: 'Deputado Federal',
    branch: 'legislativo',
    level: 'federal',
    levelLabel: 'Federal',
    description: 'Representa o estado na Câmara dos Deputados e fiscaliza o governo federal.',
    termLength: '4 anos',
    election: 'Proporcional',
    mainFunction: 'Propor, votar e fiscalizar leis federais',
  },
  {
    id: 'deputado-estadual',
    name: 'Deputado Estadual',
    branch: 'legislativo',
    level: 'estadual',
    levelLabel: 'Estadual',
    description: 'Propõe e vota as leis do estado e fiscaliza as ações do governador.',
    termLength: '4 anos',
    election: 'Proporcional',
    mainFunction: 'Propor, votar e fiscalizar leis estaduais',
  },
];

export function getPositionById(id: string): PoliticalPosition {
  return POSITIONS.find((position) => position.id === id) ?? POSITIONS.find((position) => position.id === 'senador')!;
}

export const LEVELS: { id: Level; label: string }[] = [
  { id: 'federal', label: 'Federal' },
  { id: 'estadual', label: 'Estadual' },
];

export interface PositionAction {
  verbo: string;
  explicacao: string;
}

export const ACTIONS_BY_BRANCH: Record<Branch, PositionAction[]> = {
  legislativo: [
    { verbo: 'Propor', explicacao: 'Apresenta projetos de lei sobre temas que afetam a população.' },
    { verbo: 'Debater', explicacao: 'Discute os projetos em comissões e no plenário antes da votação.' },
    { verbo: 'Votar', explicacao: 'Vota a favor ou contra os projetos de lei em análise.' },
    { verbo: 'Fiscalizar', explicacao: 'Acompanha e questiona as ações do governo, incluindo gastos públicos.' },
  ],
  executivo: [
    { verbo: 'Planejar', explicacao: 'Define prioridades e programas de governo para a população.' },
    { verbo: 'Decidir', explicacao: 'Sanciona ou veta leis e assina decisões de governo.' },
    { verbo: 'Executar', explicacao: 'Coloca em prática serviços públicos, obras e políticas.' },
    { verbo: 'Prestar contas', explicacao: 'Presta contas à população e aos órgãos de controle sobre o que foi feito.' },
  ],
};

export interface ComparisonPair {
  id: string;
  cargoAId: string;
  cargoBId: string;
}

export const COMPARISONS: ComparisonPair[] = [
  { id: 'senador-deputado-federal', cargoAId: 'senador', cargoBId: 'deputado-federal' },
  { id: 'presidente-governador', cargoAId: 'presidente', cargoBId: 'governador' },
  { id: 'deputado-federal-deputado-estadual', cargoAId: 'deputado-federal', cargoBId: 'deputado-estadual' },
];

// Cada cargo aponta para a comparação mais relevante pra ele, usada como aba
// padrão quando o usuário chega na seção de comparação vindo de outra seção.
export const DEFAULT_COMPARISON_BY_POSITION: Record<string, string> = {
  senador: 'senador-deputado-federal',
  'deputado-federal': 'senador-deputado-federal',
  presidente: 'presidente-governador',
  governador: 'presidente-governador',
  'deputado-estadual': 'deputado-federal-deputado-estadual',
};

export interface BranchRelation {
  executivo: string;
  legislativo: string;
}

export const BRANCH_RELATIONS: BranchRelation[] = [
  { executivo: 'Propõe leis', legislativo: 'Aprova leis' },
  { executivo: 'Indica autoridades', legislativo: 'Aprova indicações' },
  { executivo: 'Executa o orçamento', legislativo: 'Fiscaliza o orçamento' },
];

export const VOTE_TO_OFFICE_TRAIL: string[] = [
  'Você',
  'Voto',
  'Eleição',
  'Eleito(a)',
  'Cargo',
  'Mandato',
  'Atuação',
  'Acompanhamento',
];
