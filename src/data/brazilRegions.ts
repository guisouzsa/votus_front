export interface BrazilRegion {
  id: string;
  name: string;
  states: string[];
}

// Agrupamento oficial do IBGE (Grandes Regiões) — dado estático, não muda,
// não precisa de chamada à API. Mesmo padrão de src/data/politicalPositions.ts.
export const BRAZIL_REGIONS: BrazilRegion[] = [
  { id: 'norte', name: 'Norte', states: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'] },
  { id: 'nordeste', name: 'Nordeste', states: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'] },
  { id: 'centro-oeste', name: 'Centro-Oeste', states: ['DF', 'GO', 'MT', 'MS'] },
  { id: 'sudeste', name: 'Sudeste', states: ['ES', 'MG', 'RJ', 'SP'] },
  { id: 'sul', name: 'Sul', states: ['PR', 'RS', 'SC'] },
];

export const STATE_NAMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

export function findRegionByState(uf: string): BrazilRegion | undefined {
  return BRAZIL_REGIONS.find((region) => region.states.includes(uf));
}
