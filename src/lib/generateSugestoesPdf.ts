import jsPDF from 'jspdf';
import { getAdminSuggestions } from '@/services/adminService';
import type { AdminSuggestion, SuggestionQuestion } from '@/services/types';
import { distribuicaoRespostas, formatarPercentual } from '@/lib/suggestionStats';

const GREEN: [number, number, number] = [27, 98, 58];
const ORANGE: [number, number, number] = [255, 119, 0];
const DARK: [number, number, number] = [34, 32, 27];
const GRAY: [number, number, number] = [107, 98, 85];
const LINE: [number, number, number] = [214, 209, 200];

const PAGE_MARGIN = 16;
const MAX_SUGGESTION_PAGES = 40; // teto de segurança contra laço infinito se a API não parar de paginar

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
async function buscarTodasSugestoes(): Promise<AdminSuggestion[]> {
  const primeira = await getAdminSuggestions(1, '');
  const todas = [...primeira.data];
  const ultimaPagina = Math.min(primeira.last_page, MAX_SUGGESTION_PAGES);

  for (let pagina = 2; pagina <= ultimaPagina; pagina += 1) {
    const resposta = await getAdminSuggestions(pagina, '');
    todas.push(...resposta.data);
  }

  return todas;
}

export async function generateSugestoesPdf({
  perguntas,
  fileName = 'sugestoes-votus.pdf',
}: {
  perguntas: SuggestionQuestion[];
  fileName?: string;
}): Promise<void> {
  const sugestoes = await buscarTodasSugestoes();

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

  // Resumo
  texto('Resumo', { tamanho: 13, negrito: true, cor: GREEN, espacoDepois: 3 });
  texto(`Sugestões recebidas: ${sugestoes.length}`, { tamanho: 10 });
  texto(`Perguntas ativas na pesquisa: ${perguntas.length}`, { tamanho: 10, espacoDepois: 6 });
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

    // Mesma fonte de números da tela do admin (ver lib/suggestionStats).
    const { total, fatias } = distribuicaoRespostas(pergunta);

    if (pergunta.type === 'choice' && total > 0) {
      fatias.forEach(({ label, count: contagem, share, orfa }) => {
        const opcao = orfa ? `${label} (opção antiga)` : label;
        const barraLargura = 60;
        const barraPreenchida = share * barraLargura;

        garantirEspaco(6);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(...DARK);
        pdf.text(opcao, PAGE_MARGIN + 3, y, { maxWidth: 70 });

        const barraX = PAGE_MARGIN + 78;
        pdf.setFillColor(240, 236, 226);
        pdf.rect(barraX, y - 3, barraLargura, 3.2, 'F');
        pdf.setFillColor(...GREEN);
        pdf.rect(barraX, y - 3, barraPreenchida, 3.2, 'F');

        pdf.setTextColor(...DARK);
        pdf.text(`${contagem} (${formatarPercentual(share)})`, barraX + barraLargura + 4, y);

        y += 6;
      });
    }

    y += 4;
  });

  linhaSeparadora();
  y += 6;

  // Sugestões recebidas, uma por bloco
  texto(`Sugestões recebidas (${sugestoes.length})`, { tamanho: 13, negrito: true, cor: GREEN, espacoDepois: 4 });

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
