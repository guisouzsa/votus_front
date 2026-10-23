// Grupos da comparação de propostas. São os mesmos grupos dos assuntos de
// src/data/planCoverage.json (análise dos planos registrados no TSE), para a
// visão geral e a cobertura usarem as mesmas categorias.
//
// Os temas das propostas são dados pela IA na importação (um por proposta) e
// mapeados aqui para um grupo. Tema novo que não estiver na lista aparece em
// "Outros temas" — nunca é escondido.

export interface ThemeGroup {
  key: string;
  label: string;
}

export const THEME_GROUPS: ThemeGroup[] = [
  { key: 'Educação', label: 'Educação' },
  { key: 'Saúde', label: 'Saúde' },
  { key: 'Segurança', label: 'Segurança pública' },
  { key: 'Economia', label: 'Economia, trabalho e renda' },
  { key: 'Cidades', label: 'Cidades, habitação e infraestrutura' },
  { key: 'Meio ambiente', label: 'Meio ambiente e campo' },
  { key: 'Ciência', label: 'Ciência e tecnologia' },
  { key: 'Direitos sociais', label: 'Direitos sociais' },
  { key: 'Instituições', label: 'Instituições e soberania' },
  { key: 'Cultura e esporte', label: 'Cultura e esporte' },
];

export const OTHER_GROUP: ThemeGroup = { key: 'Outros', label: 'Outros temas' };

const THEME_TO_GROUP: Record<string, string> = {
  educacao: 'Educação',
  saude: 'Saúde',
  seguranca: 'Segurança',
  'custo-de-vida': 'Economia',
  'trabalho-e-renda': 'Economia',
  financas: 'Economia',
  tributacao: 'Economia',
  industria: 'Economia',
  comercio: 'Economia',
  estatais: 'Economia',
  'cadeias-globais': 'Economia',
  turismo: 'Economia',
  energia: 'Economia',
  habitacao: 'Cidades',
  saneamento: 'Cidades',
  logistica: 'Cidades',
  'mobilidade-urbana': 'Cidades',
  'desenvolvimento-regional': 'Cidades',
  agricultura: 'Meio ambiente',
  bioeconomia: 'Meio ambiente',
  'licenciamento-ambiental': 'Meio ambiente',
  mineracao: 'Meio ambiente',
  tecnologia: 'Ciência',
  'cuidado-familiar': 'Direitos sociais',
  previdencia: 'Direitos sociais',
  'autonomia-indigena': 'Direitos sociais',
  soberania: 'Instituições',
  'reforma-administrativa': 'Instituições',
  'reforma-do-judiciario': 'Instituições',
  'reforma-politica': 'Instituições',
  transparencia: 'Instituições',
  censura: 'Instituições',
  descentralizacao: 'Instituições',
  cultura: 'Cultura e esporte',
};

export function groupOfTheme(slug: string): ThemeGroup {
  const key = THEME_TO_GROUP[slug];

  return THEME_GROUPS.find((group) => group.key === key) ?? OTHER_GROUP;
}
