// Cores do Radar do Brasil — tokens usados pelo mapa, gráficos e painéis.
//
// Paleta dos estados: ESCOLHA DE DESIGN do Votus, inspirada nas bandeiras
// estaduais como aparecem na publicação do IBGE "A Bandeira do Brasil e
// outros símbolos nacionais" (seção "Bandeiras dos Estados e do Distrito
// Federal", https://www.ibge.gov.br/biblioteca/visualizacao/livros/liv101632.pdf).
// As bandeiras não definem uma "cor oficial" única por estado: para cada UF
// foi escolhida uma das cores da própria bandeira (campo `flag`), evitando
// repetir a mesma cor em estados vizinhos. Os tons foram ajustados para o
// mapa (contraste com o texto); não são especificações oficiais.
//
// Cor no mapa só identifica o estado: não representa número, desempenho nem
// preferência.

export interface StateColor {
  /** Tom usado no estado selecionado (e, clareado, nos demais). */
  color: string;
  /** Texto legível sobre `color` (sigla no estado selecionado). */
  onColor: '#ffffff' | '#22201b';
  /** De qual elemento da bandeira a cor foi tirada. */
  flag: string;
}

const LIGHT_TEXT = '#ffffff' as const;
const DARK_TEXT = '#22201b' as const;

export const STATE_COLORS: Record<string, StateColor> = {
  AC: { color: '#11804A', onColor: LIGHT_TEXT, flag: 'verde do triângulo inferior' },
  AL: { color: '#D93A1F', onColor: LIGHT_TEXT, flag: 'faixa vermelha' },
  AM: { color: '#D63A22', onColor: LIGHT_TEXT, flag: 'faixa vermelha' },
  AP: { color: '#0E8F4E', onColor: LIGHT_TEXT, flag: 'faixa verde' },
  BA: { color: '#4C93DE', onColor: DARK_TEXT, flag: 'triângulo azul' },
  CE: { color: '#16884A', onColor: LIGHT_TEXT, flag: 'fundo verde' },
  DF: { color: '#0E7F43', onColor: LIGHT_TEXT, flag: 'quadrado verde' },
  ES: { color: '#D9577F', onColor: LIGHT_TEXT, flag: 'faixa rosa' },
  GO: { color: '#F2C200', onColor: DARK_TEXT, flag: 'listras amarelas' },
  MA: { color: '#D9361E', onColor: LIGHT_TEXT, flag: 'listras vermelhas' },
  MG: { color: '#E0442A', onColor: LIGHT_TEXT, flag: 'triângulo vermelho' },
  MS: { color: '#4F8FD1', onColor: DARK_TEXT, flag: 'campo azul' },
  MT: { color: '#12904F', onColor: LIGHT_TEXT, flag: 'círculo verde' },
  PA: { color: '#2B5FB0', onColor: LIGHT_TEXT, flag: 'estrela azul' },
  PB: { color: '#D23B22', onColor: LIGHT_TEXT, flag: 'campo vermelho' },
  PE: { color: '#2E3A87', onColor: LIGHT_TEXT, flag: 'campo azul' },
  PI: { color: '#F0B400', onColor: DARK_TEXT, flag: 'listras amarelas' },
  PR: { color: '#0F8C4C', onColor: LIGHT_TEXT, flag: 'faixas verdes' },
  RJ: { color: '#1C9AD6', onColor: DARK_TEXT, flag: 'quadrantes azul-celeste' },
  RN: { color: '#E3A800', onColor: DARK_TEXT, flag: 'escudo amarelo' },
  RO: { color: '#F5C800', onColor: DARK_TEXT, flag: 'campo amarelo' },
  RR: { color: '#F2A900', onColor: DARK_TEXT, flag: 'estrela amarela' },
  RS: { color: '#F2C100', onColor: DARK_TEXT, flag: 'faixa amarela' },
  SC: { color: '#D93B2B', onColor: LIGHT_TEXT, flag: 'faixas vermelhas' },
  SE: { color: '#0F8F48', onColor: LIGHT_TEXT, flag: 'listras verdes' },
  SP: { color: '#2A3C7E', onColor: LIGHT_TEXT, flag: 'mapa azul do brasão' },
  TO: { color: '#EE8122', onColor: DARK_TEXT, flag: 'campo laranja' },
};

const FALLBACK: StateColor = { color: '#1B623A', onColor: LIGHT_TEXT, flag: '' };

export function stateColor(uf: string): StateColor {
  return STATE_COLORS[uf] ?? FALLBACK;
}

/** Mistura a cor com branco (0 = branco, 1 = cor pura). */
export function tint(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(255 - (255 - c) * amount);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);

  return `rgb(${r} ${g} ${b})`;
}

// Fontes de dados: cada instituição tem uma cor fixa nos gráficos, para o
// leitor reconhecer de onde vem cada número.
export const SOURCE_COLORS = {
  camara: '#1B623A', // verde Votus (brasil-green)
  senado: '#2B4C9B',
  ibge: '#B4530A',
} as const;

export const INK = '#22201b';
