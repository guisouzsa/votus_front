import { normalize } from './coverage';

// Identificação visual de cada candidato na comparação. É a regra que o
// comparador já usava (tokens brasil-green / brasil-red do globals.css); o
// Votus não tem cadastro de cores por partido, então nada é deduzido além
// disso: quem não está aqui fica neutro. Cor só identifica — não indica
// avaliação nem preferência.
export interface CandidateColors {
  texto: string;
  barra: string;
  borda: string;
}

const NEUTRO: CandidateColors = { texto: 'text-ink-soft', barra: 'bg-ink-soft', borda: 'border-t-ink-soft' };

export function candidateColors(name: string): CandidateColors {
  const nome = normalize(name);
  if (nome.includes('bolsonaro')) return { texto: 'text-brasil-green', barra: 'bg-brasil-green', borda: 'border-t-brasil-green' };
  if (nome.includes('lula')) return { texto: 'text-brasil-red', barra: 'bg-brasil-red', borda: 'border-t-brasil-red' };

  return NEUTRO;
}
