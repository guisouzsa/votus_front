export type Poder = 'executivo' | 'legislativo';
export type Nivel = 'federal' | 'estadual' | 'municipal';

export interface CargoPolitico {
  id: string;
  nome: string;
  poder: Poder;
  nivel: Nivel;
  nivelLabel: string;
  descricao: string;
  mandato: string;
  eleicao: string;
  funcaoPrincipal: string;
  rotaVotus?: string;
}

export const CARGOS: CargoPolitico[] = [
  {
    id: 'presidente',
    nome: 'Presidente da República',
    poder: 'executivo',
    nivel: 'federal',
    nivelLabel: 'Federal',
    descricao: 'Chefia o governo federal e representa o Brasil no país e no exterior.',
    mandato: '4 anos',
    eleicao: 'Majoritária (2 turnos)',
    funcaoPrincipal: 'Governar o país e sancionar leis federais',
  },
  {
    id: 'governador',
    nome: 'Governador',
    poder: 'executivo',
    nivel: 'estadual',
    nivelLabel: 'Estadual',
    descricao: 'Chefia o governo do estado e executa políticas estaduais como saúde e segurança pública.',
    mandato: '4 anos',
    eleicao: 'Majoritária (2 turnos)',
    funcaoPrincipal: 'Governar o estado e sancionar leis estaduais',
  },
  {
    id: 'prefeito',
    nome: 'Prefeito',
    poder: 'executivo',
    nivel: 'municipal',
    nivelLabel: 'Municipal',
    descricao: 'Chefia o governo do município, cuidando de áreas como transporte, saúde básica e educação infantil.',
    mandato: '4 anos',
    eleicao: 'Majoritária',
    funcaoPrincipal: 'Governar o município e sancionar leis municipais',
  },
  {
    id: 'senador',
    nome: 'Senador',
    poder: 'legislativo',
    nivel: 'federal',
    nivelLabel: 'Federal',
    descricao: 'Representa o estado no Senado Federal e vota as leis de interesse nacional.',
    mandato: '8 anos',
    eleicao: 'Majoritária',
    funcaoPrincipal: 'Votar leis federais e aprovar indicações do Presidente',
    rotaVotus: '/SenadoresPage',
  },
  {
    id: 'deputado-federal',
    nome: 'Deputado Federal',
    poder: 'legislativo',
    nivel: 'federal',
    nivelLabel: 'Federal',
    descricao: 'Representa o estado na Câmara dos Deputados e fiscaliza o governo federal.',
    mandato: '4 anos',
    eleicao: 'Proporcional',
    funcaoPrincipal: 'Propor, votar e fiscalizar leis federais',
    rotaVotus: '/DeputadosPage',
  },
  {
    id: 'deputado-estadual',
    nome: 'Deputado Estadual',
    poder: 'legislativo',
    nivel: 'estadual',
    nivelLabel: 'Estadual',
    descricao: 'Propõe e vota as leis do estado e fiscaliza as ações do governador.',
    mandato: '4 anos',
    eleicao: 'Proporcional',
    funcaoPrincipal: 'Propor, votar e fiscalizar leis estaduais',
  },
  {
    id: 'vereador',
    nome: 'Vereador',
    poder: 'legislativo',
    nivel: 'municipal',
    nivelLabel: 'Municipal',
    descricao: 'Propõe e vota as leis do município e fiscaliza as ações do prefeito.',
    mandato: '4 anos',
    eleicao: 'Proporcional',
    funcaoPrincipal: 'Propor, votar e fiscalizar leis municipais',
  },
];

export function getCargoPorId(id: string): CargoPolitico {
  return CARGOS.find((cargo) => cargo.id === id) ?? CARGOS[3];
}

export const NIVEIS: { id: Nivel; label: string }[] = [
  { id: 'federal', label: 'Federal' },
  { id: 'estadual', label: 'Estadual' },
  { id: 'municipal', label: 'Municipal' },
];

export interface AcaoCargo {
  verbo: string;
  explicacao: string;
}

export const ACOES_POR_PODER: Record<Poder, AcaoCargo[]> = {
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

export interface ComparacaoPar {
  id: string;
  cargoAId: string;
  cargoBId: string;
}

export const COMPARACOES: ComparacaoPar[] = [
  { id: 'senador-deputado-federal', cargoAId: 'senador', cargoBId: 'deputado-federal' },
  { id: 'presidente-governador', cargoAId: 'presidente', cargoBId: 'governador' },
  { id: 'deputado-federal-deputado-estadual', cargoAId: 'deputado-federal', cargoBId: 'deputado-estadual' },
  { id: 'governador-prefeito', cargoAId: 'governador', cargoBId: 'prefeito' },
];

// Cada cargo aponta para a comparação mais relevante pra ele, usada como aba
// padrão quando o usuário chega na seção de comparação vindo de outra seção.
export const COMPARACAO_PADRAO_POR_CARGO: Record<string, string> = {
  senador: 'senador-deputado-federal',
  'deputado-federal': 'senador-deputado-federal',
  presidente: 'presidente-governador',
  governador: 'presidente-governador',
  'deputado-estadual': 'deputado-federal-deputado-estadual',
  prefeito: 'governador-prefeito',
  vereador: 'deputado-federal-deputado-estadual',
};

export interface RelacaoPoderes {
  executivo: string;
  legislativo: string;
}

export const RELACOES_ENTRE_PODERES: RelacaoPoderes[] = [
  { executivo: 'Propõe leis', legislativo: 'Aprova leis' },
  { executivo: 'Indica autoridades', legislativo: 'Aprova indicações' },
  { executivo: 'Executa o orçamento', legislativo: 'Fiscaliza o orçamento' },
];

export const TRILHA_VOTO_AO_CARGO: string[] = [
  'Você',
  'Voto',
  'Eleição',
  'Eleito(a)',
  'Cargo',
  'Mandato',
  'Atuação',
  'Acompanhamento',
];
