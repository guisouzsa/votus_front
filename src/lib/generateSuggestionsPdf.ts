import jsPDF from 'jspdf';
import { getAdminSuggestions } from '@/services/adminService';
import type { AdminSuggestion, SuggestionQuestion } from '@/services/types';
import { answerDistribution, formatPercentage, CHART_PALETTE, OTHER_SLICE_COLOR } from '@/lib/suggestionStats';

const GREEN: [number, number, number] = [27, 98, 58];
const ORANGE: [number, number, number] = [255, 119, 0];
const DARK: [number, number, number] = [34, 32, 27];
const GRAY: [number, number, number] = [107, 98, 85];
const LINE: [number, number, number] = [214, 209, 200];

const PAGE_MARGIN = 16;
const MAX_SUGGESTION_PAGES = 40; // teto de segurança contra laço infinito se a API não parar de paginar

function hexParaRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const PALETA_RGB = CHART_PALETTE.map(hexParaRgb);
const COR_DEMAIS_RGB = hexParaRgb(OTHER_SLICE_COLOR);

// Ângulo 0 = topo, crescendo no sentido horário — mesma convenção do
// gráfico em tela (ver components/admin/AnswersDonut.tsx), pra a mesma
// pergunta ficar com a mesma cor na mesma posição nos dois lugares.
function pontoNoCirculo(cx: number, cy: number, raio: number, angulo: number): [number, number] {
  return [cx + raio * Math.sin(angulo), cy - raio * Math.cos(angulo)];
}

/**
 * Desenha uma "rosca" (gráfico de pizza com miolo vazado) — mesmo padrão
 * visual do gráfico em tela (AnswersDonut). jsPDF não tem um primitivo de
 * "fatia de pizza" pronto, então cada fatia é aproximada por um leque de
 * triângulos finos (passo de ~2°) saindo do centro até a borda externa;
 * o miolo (raioInterno) é coberto por um círculo branco por cima, que é o
 * que dá o efeito de rosca.
 */
function desenharGraficoPizza(
  pdf: jsPDF,
  {
    cx,
    cy,
    raioExterno,
    raioInterno,
    fatias,
  }: {
    cx: number;
    cy: number;
    raioExterno: number;
    raioInterno: number;
    fatias: { count: number; cor: [number, number, number] }[];
  }
) {
  const total = fatias.reduce((soma, f) => soma + f.count, 0);
  if (total <= 0) return;

  const PASSO = Math.PI / 90; // 2°
  let anguloAtual = 0;

  for (const fatia of fatias) {
    if (fatia.count <= 0) continue;

    const anguloFim = anguloAtual + (fatia.count / total) * Math.PI * 2;
    pdf.setFillColor(...fatia.cor);

    let a = anguloAtual;
    while (a < anguloFim) {
      const proximo = Math.min(a + PASSO, anguloFim);
      const [x1, y1] = pontoNoCirculo(cx, cy, raioExterno, a);
      const [x2, y2] = pontoNoCirculo(cx, cy, raioExterno, proximo);
      pdf.triangle(cx, cy, x1, y1, x2, y2, 'F');
      a = proximo;
    }

    anguloAtual = anguloFim;
  }

  // Miolo vazado (rosca) + contorno branco fino, igual ao da tela.
  pdf.setFillColor(255, 255, 255);
  pdf.circle(cx, cy, raioInterno, 'F');
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.circle(cx, cy, raioExterno, 'S');
}

function respostaLinhas(sugestao: AdminSuggestion): { label: string; valor: string }[] {
  if (sugestao.answers.length > 0) {
    return sugestao.answers.map((a) => ({ label: a.question?.text ?? 'Pergunta removida', valor: a.answer }));
  }

  if (sugestao.message) {
    return sugestao.message
      .split('\n')
      .map((linha) => {
        const separadorInterrogacao = linha.indexOf('? ');
        if (separadorInterrogacao !== -1) {
          return {
            label: linha.slice(0, separadorInterrogacao + 1).trim(),
            valor: linha.slice(separadorInterrogacao + 2).trim(),
          };
        }

        const separadorDoisPontos = linha.indexOf(': ');
        if (separadorDoisPontos !== -1) {
          return {
            label: linha.slice(0, separadorDoisPontos).trim(),
            valor: linha.slice(separadorDoisPontos + 2).trim(),
          };
        }

        return { label: '', valor: linha.trim() };
      })
      .filter((linha) => linha.valor !== '');
  }

  return [];
}

// Busca todas as páginas (a tela só mostra 15 por vez) pra o PDF sair
// completo, não só com a página que o admin tinha aberta no momento.
//
// `total` vem direto do paginador (Suggestion::count() no backend — a mesma
// contagem exibida no card do dashboard) e é sempre o número real, mesmo se
// MAX_SUGGESTION_PAGES cortar a busca antes de trazer todas as linhas. Sem
// isso, o resumo do PDF usava `todas.length` — que, passando de 40*15=600
// sugestões, ficaria menor que o total de verdade, divergindo do dashboard
// sem nenhum aviso.
async function buscarTodasSugestoes(): Promise<{ sugestoes: AdminSuggestion[]; total: number }> {
  const primeira = await getAdminSuggestions(1, '');
  const todas = [...primeira.data];
  const ultimaPagina = Math.min(primeira.last_page, MAX_SUGGESTION_PAGES);

  for (let pagina = 2; pagina <= ultimaPagina; pagina += 1) {
    const resposta = await getAdminSuggestions(pagina, '');
    todas.push(...resposta.data);
  }

  return { sugestoes: todas, total: primeira.total };
}

export async function generateSuggestionsPdf({
  perguntas,
  fileName = 'sugestoes-votus.pdf',
}: {
  perguntas: SuggestionQuestion[];
  fileName?: string;
}): Promise<void> {
  const { sugestoes, total: totalSugestoes } = await buscarTodasSugestoes();
  // Só é diferente do total real se MAX_SUGGESTION_PAGES cortou a busca —
  // caso normal (poucas centenas de sugestões), os dois são iguais.
  const sugestoesTruncadas = sugestoes.length < totalSugestoes;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  let y = PAGE_MARGIN;

  function garantirEspaco(alturaNecessaria: number) {
    if (y + alturaNecessaria > pageHeight - PAGE_MARGIN) {
      pdf.addPage();
      y = PAGE_MARGIN;
    }
  }

  function linhaSeparadora() {
    pdf.setDrawColor(...LINE);
    pdf.setLineWidth(0.2);
    pdf.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
  }

  function texto(
    conteudo: string,
    {
      tamanho = 10,
      cor = DARK,
      negrito = false,
      espacoAntes = 0,
      espacoDepois = 4,
      largura = contentWidth,
    }: {
      tamanho?: number;
      cor?: [number, number, number];
      negrito?: boolean;
      espacoAntes?: number;
      espacoDepois?: number;
      largura?: number;
    } = {}
  ) {
    pdf.setFont('helvetica', negrito ? 'bold' : 'normal');
    pdf.setFontSize(tamanho);
    pdf.setTextColor(...cor);

    const linhas = pdf.splitTextToSize(conteudo, largura) as string[];
    const alturaLinha = tamanho * 0.42;

    y += espacoAntes;
    garantirEspaco(linhas.length * alturaLinha);

    linhas.forEach((linha) => {
      garantirEspaco(alturaLinha);
      pdf.text(linha, PAGE_MARGIN, y);
      y += alturaLinha;
    });

    y += espacoDepois;
  }

  // Cabeçalho
  pdf.setFillColor(...GREEN);
  pdf.rect(0, 0, pageWidth, 24, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text('Relatório de Sugestões — Votus', PAGE_MARGIN, 15);

  y = 32;
  const geradoEm = new Date().toLocaleString('pt-BR');
  texto(`Gerado em ${geradoEm}`, { tamanho: 9, cor: GRAY, espacoDepois: 6 });

  // Resumo — mesmo total exibido no card do dashboard (Suggestion::count()
  // no backend), nunca o tamanho da lista parcialmente carregada aqui.
  texto('Resumo', { tamanho: 13, negrito: true, cor: GREEN, espacoDepois: 3 });
  texto(`Sugestões recebidas: ${totalSugestoes}`, { tamanho: 10 });
  texto(`Perguntas ativas na pesquisa: ${perguntas.length}`, { tamanho: 10, espacoDepois: sugestoesTruncadas ? 1 : 6 });
  if (sugestoesTruncadas) {
    texto(
      `Os gráficos por pergunta abaixo já somam as ${totalSugestoes} sugestões inteiras. A listagem individual, mais adiante, detalha só as ${sugestoes.length} mais recentes.`,
      { tamanho: 8, cor: GRAY, espacoDepois: 6 }
    );
  }
  linhaSeparadora();
  y += 6;

  // Perguntas da pesquisa, com estatísticas de cada opção
  texto('Perguntas da pesquisa', { tamanho: 13, negrito: true, cor: GREEN, espacoDepois: 4 });

  perguntas.forEach((pergunta, index) => {
    garantirEspaco(14);
    texto(`${index + 1}. ${pergunta.text}`, { tamanho: 11, negrito: true, espacoDepois: 1 });
    texto(
      `${pergunta.type === 'choice' ? 'Múltipla escolha' : 'Texto livre'} · ${
        pergunta.required ? 'obrigatória' : 'opcional'
      }`,
      { tamanho: 8.5, cor: GRAY, espacoDepois: 2 }
    );

    // Mesma fonte de números da tela do admin (ver lib/suggestionStats) —
    // os mesmos dados, sem inventar nem arredondar diferente.
    const { total, fatias } = answerDistribution(pergunta);

    if (pergunta.type === 'choice' && total > 0) {
      // Mesmo agrupamento da tela: só as 6 primeiras opções ganham cor
      // própria; da 7ª em diante entram juntas na fatia "Demais opções"
      // (cor neutra) — a legenda continua listando cada uma com seu número.
      const fatiasComCor = fatias.map((f, i) => ({
        ...f,
        cor: i < PALETA_RGB.length ? PALETA_RGB[i] : COR_DEMAIS_RGB,
      }));

      const RAIO_EXTERNO = 15;
      const RAIO_INTERNO = 10;
      const linhasLegenda = fatiasComCor.length;
      const alturaLegenda = linhasLegenda * 5;
      const alturaBloco = Math.max(RAIO_EXTERNO * 2, alturaLegenda) + 4;

      // O gráfico não pode começar numa página e continuar na próxima —
      // garante o espaço do bloco inteiro antes de desenhar.
      garantirEspaco(alturaBloco);

      const cx = PAGE_MARGIN + 4 + RAIO_EXTERNO;
      const cy = y + RAIO_EXTERNO;

      desenharGraficoPizza(pdf, { cx, cy, raioExterno: RAIO_EXTERNO, raioInterno: RAIO_INTERNO, fatias: fatiasComCor });

      // Total de respostas no miolo da rosca, como na tela.
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...DARK);
      pdf.text(String(total), cx, cy - 0.5, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5.5);
      pdf.setTextColor(...GRAY);
      pdf.text(total === 1 ? 'resposta' : 'respostas', cx, cy + 3, { align: 'center' });

      // Legenda: swatch + opção + contagem + percentual, uma linha por opção.
      const legendaX = cx + RAIO_EXTERNO + 8;
      const legendaLargura = contentWidth - (legendaX - PAGE_MARGIN);
      let legendaY = cy - RAIO_EXTERNO + 3;

      fatiasComCor.forEach(({ label, count: contagem, share, orfa, cor }) => {
        const opcao = orfa ? `${label} (opção antiga)` : label;

        pdf.setFillColor(...cor);
        pdf.rect(legendaX, legendaY - 2.6, 3, 3, 'F');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(...DARK);
        pdf.text(opcao, legendaX + 5, legendaY, { maxWidth: legendaLargura - 28 });

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${contagem} (${formatPercentage(share)})`, legendaX + legendaLargura, legendaY, { align: 'right' });

        legendaY += 5;
      });

      y += alturaBloco;
    } else if (pergunta.type === 'choice') {
      texto('Nenhuma resposta recebida ainda para esta pergunta.', { tamanho: 8.5, cor: GRAY, espacoDepois: 2 });
    }

    y += 4;
  });

  linhaSeparadora();
  y += 6;

  // Sugestões recebidas, uma por bloco
  texto(
    sugestoesTruncadas
      ? `Sugestões recebidas (${sugestoes.length} de ${totalSugestoes} mais recentes)`
      : `Sugestões recebidas (${sugestoes.length})`,
    { tamanho: 13, negrito: true, cor: GREEN, espacoDepois: 4 }
  );

  if (sugestoes.length === 0) {
    texto('Nenhuma sugestão recebida ainda.', { tamanho: 10, cor: GRAY });
  }

  sugestoes.forEach((sugestao, index) => {
    garantirEspaco(16);

    const identificacao = `${sugestao.name ?? 'Anônimo'}${sugestao.email ? ` · ${sugestao.email}` : ''} · ${new Date(
      sugestao.created_at
    ).toLocaleString('pt-BR')}`;

    texto(`#${index + 1} — ${identificacao}`, { tamanho: 9, negrito: true, cor: ORANGE, espacoDepois: 2 });

    respostaLinhas(sugestao).forEach((linha) => {
      if (linha.label) {
        texto(linha.label, { tamanho: 9, negrito: true, cor: GREEN, espacoDepois: 0.5, largura: contentWidth - 4 });
      }
      texto(linha.valor, { tamanho: 9.5, cor: DARK, espacoDepois: 2, largura: contentWidth - 4 });
    });

    y += 3;
    linhaSeparadora();
    y += 5;
  });

  pdf.save(fileName);
}
