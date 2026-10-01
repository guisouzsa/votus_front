import type { SuggestionQuestion } from '@/services/types';

// Cores da família Votus (amarelo, verde, azul, magenta, violeta, vermelho)
// ajustadas pra ficarem distinguíveis entre si — inclusive pra daltonismo
// protan/deutan — em QUALQUER par vizinho da rosca, incluindo o fechamento
// última↔primeira fatia pra perguntas de 2 a 6 opções (ΔE >= 9,9, validado
// com o script de paleta). A ordem é fixa: a cor segue a opção, nunca o
// ranking. Não reordenar sem revalidar. Compartilhada entre o gráfico da
// tela (AnswersDonut) e o do PDF (generateSuggestionsPdf) — os dois usam
// exatamente as mesmas cores pra mesma opção.
export const CHART_PALETTE = ['#C99400', '#1F8A4C', '#2A78D6', '#B8327A', '#5B4AB0', '#C4302B'];
// Da 7ª opção em diante o gráfico agrupa numa fatia neutra ("Demais
// opções"); a legenda continua listando cada uma com o próprio número.
export const OTHER_SLICE_COLOR = '#8A8378';

export type AnswerSlice = {
  label: string;
  count: number;
  // Proporção exata (0–1), sem arredondar — o arredondamento é só na exibição.
  share: number;
  // Resposta gravada que não bate com nenhuma opção atual (ex: a opção foi
  // renomeada depois). Antes sumia da tela mas continuava somando no total,
  // então as porcentagens exibidas não fechavam 100%.
  orfa: boolean;
};

/**
 * Distribuição das respostas de uma pergunta de múltipla escolha, a partir
 * de `stats` (contagem real por resposta, vinda do backend). Fonte única
 * usada tanto pela tela de Sugestões do admin quanto pelo PDF, pra os dois
 * mostrarem exatamente os mesmos números.
 *
 * Ordem: as opções como estão cadastradas (inclusive as com 0 respostas),
 * depois qualquer resposta órfã. Nenhum valor é inventado ou omitido — a
 * soma de `count` é sempre igual a `total`.
 */
export function answerDistribution(pergunta: SuggestionQuestion): { total: number; fatias: AnswerSlice[] } {
  const stats = pergunta.stats ?? {};
  const opcoes = pergunta.options ?? [];
  const total = Object.values(stats).reduce((acc, n) => acc + Number(n), 0);

  const orfas = Object.keys(stats).filter((resposta) => !opcoes.includes(resposta));

  const fatias = [
    ...opcoes.map((label) => ({ label, count: Number(stats[label] ?? 0), orfa: false })),
    ...orfas.map((label) => ({ label, count: Number(stats[label]), orfa: true })),
  ].map((fatia) => ({ ...fatia, share: total > 0 ? fatia.count / total : 0 }));

  return { total, fatias };
}

// Uma casa decimal: arredondar pra inteiro fazia, por exemplo, 5/1/1 virar
// 71% + 14% + 14% = 99%. Com uma casa: 71,4% + 14,3% + 14,3%.
export function formatPercentage(share: number): string {
  return `${(share * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}
