import jsPDF from 'jspdf';
import type { SantinhoCandidate } from '@/components/SantinhoPreview';

// Quantas "colas" (conjuntos completos dos 6 cargos) cabem lado a lado numa
// página — igual ao preview em tela (GRID_CLASS_BY_COUNT em
// SantinhoExportModal), que já mostra 2 colunas a partir de 2 por página.
const GRID_BY_COUNT: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  2: { cols: 2, rows: 1 },
  4: { cols: 2, rows: 2 },
  6: { cols: 2, rows: 3 },
};

const ORANGE: [number, number, number] = [255, 119, 0];
const BORDER: [number, number, number] = [224, 214, 196];
const INK: [number, number, number] = [34, 32, 27]; // mesmo tom de --color-ink usado no nome, no preview em tela
const INK_SOFT: [number, number, number] = [107, 98, 85]; // --color-ink-soft, usado no endereço do Votus
const LOGO_ASPECT = 32 / 133; // altura / largura, conforme o viewBox de LogoVotus.svg
const MM_TO_PT = 72 / 25.4;

// A Cola Eleitoral impressa NÃO é o santinho completo (sem foto, sem arte
// decorativa, sem moldura) — é um bloco compacto com os 6 cargos numa grade
// 2 colunas, pra caber várias "colas" numa folha A4 normal em vez de uma por
// página. A proporção (altura/largura) é derivada do próprio desenho abaixo
// (cabeçalho + grade de cargos + rodapé) a uma largura de referência — ver
// medirColaAspect().
const COLA_WIDTH_REF_MM = 95;
// Largura máxima de uma cola quando sobra espaço na folha (ex: só 1 por
// página) — sem isso a cola esticaria pra ocupar a página inteira, do jeito
// que o santinho antigo fazia.
const COLA_MAX_WIDTH_MM = 95;

// pdf.setFontSize() sempre espera pontos, mesmo com o documento configurado
// em mm (unit: 'mm') — sem essa conversão o texto fica desproporcional ao
// resto do desenho (que usa mm em tudo: x, y, largura, altura).
function setFontSizeMm(pdf: jsPDF, sizeMm: number) {
  pdf.setFontSize(sizeMm * MM_TO_PT);
}

// Carrega uma imagem (SVG ou não) e devolve um PNG em data URL, sem recortar.
// jsPDF não sabe embutir SVG diretamente, mas desenha PNG sem problema.
function loadImageAsPngDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 300;
      canvas.height = img.naturalHeight || 300;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas indisponível.'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`Não foi possível carregar ${src}.`));
    img.src = src;
  });
}

// Mede o texto de um nome e corta com reticências se não couber na largura
// disponível — nunca deixa o texto invadir a célula vizinha.
function truncarTexto(pdf: jsPDF, texto: string, larguraMaxima: number): string {
  if (pdf.getTextWidth(texto) <= larguraMaxima) return texto;

  let cortado = texto;
  while (cortado.length > 1 && pdf.getTextWidth(`${cortado}...`) > larguraMaxima) {
    cortado = cortado.slice(0, -1);
  }
  return `${cortado.trimEnd()}...`;
}

// Desenha uma "cola" compacta: cabeçalho + grade 2 colunas com um bloco por
// cargo (cargo → número em destaque → nome → partido) + rodapé com a marca
// Votus. Sem foto, sem moldura, sem arte decorativa — é a versão pra
// impressão, propositalmente diferente do santinho completo da tela.
function drawColaCompacta(
  pdf: jsPDF,
  {
    x,
    y,
    width,
    candidatos,
    logoImg,
  }: {
    x: number;
    y: number;
    width: number;
    candidatos: SantinhoCandidate[];
    logoImg: string;
  }
) {
  const pad = width * 0.045;
  const innerLeft = x + pad;
  const innerRight = x + width - pad;
  const innerWidth = innerRight - innerLeft;

  // Cabeçalho
  pdf.setFont('helvetica', 'bold');
  const titleSize = width * 0.058;
  setFontSizeMm(pdf, titleSize);
  pdf.setTextColor(...ORANGE);
  const titleY = y + pad + titleSize * 0.8;
  pdf.text('COLA ELEITORAL', innerLeft, titleY);

  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(width * 0.003);
  const headerLineY = titleY + width * 0.025;
  pdf.line(innerLeft, headerLineY, innerRight, headerLineY);

  // Grade de cargos — 2 colunas, uma célula por cargo.
  const cols = 2;
  const rows = Math.ceil(candidatos.length / cols);
  const colGap = width * 0.05;
  const rowGap = width * 0.03;
  const cellWidth = (innerWidth - colGap * (cols - 1)) / cols;
  // Altura de cada linha de célula: cargo + respiro + número + respiro + nome
  // + partido — soma fixa em função de "width", igual ao resto do desenho.
  const cellHeight = width * 0.2;
  const gridTop = headerLineY + width * 0.04;

  candidatos.forEach((candidato, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const cellX = innerLeft + col * (cellWidth + colGap);
    const cellTop = gridTop + row * (cellHeight + rowGap);

    // 1. Cargo — rótulo pequeno, contextual.
    pdf.setFont('helvetica', 'bold');
    setFontSizeMm(pdf, width * 0.021);
    pdf.setTextColor(...ORANGE);
    pdf.text(candidato.cargo.toUpperCase(), cellX, cellTop + width * 0.02);

    // 2. Número — o elemento de maior destaque do bloco, com espaço próprio.
    const numeroY = cellTop + width * 0.075;
    pdf.setFont('helvetica', 'bold');
    let numeroSize = width * 0.05;
    setFontSizeMm(pdf, numeroSize);
    pdf.setTextColor(...INK);
    // Espaço fino entre dígitos (letter-spacing manual) pra dar presença sem
    // precisar de caixinhas — menos "card dentro de card".
    const numeroTexto = candidato.numero.replace(/\s/g, '').split('').join(' ');
    while (numeroSize > width * 0.03 && pdf.getTextWidth(numeroTexto) > cellWidth) {
      numeroSize -= width * 0.003;
      setFontSizeMm(pdf, numeroSize);
    }
    pdf.text(numeroTexto, cellX, numeroY);

    // 3. Nome — destaque próprio, logo abaixo do número com respiro maior.
    let proximaY = numeroY + width * 0.034;
    if (candidato.nome) {
      pdf.setFont('helvetica', 'bold');
      setFontSizeMm(pdf, width * 0.028);
      pdf.setTextColor(...INK);
      pdf.text(truncarTexto(pdf, candidato.nome, cellWidth), cellX, proximaY);
      proximaY += width * 0.026;
    }

    // 4. Partido — subordinado ao cargo, próximo dele, sem disputar atenção.
    if (candidato.partido) {
      pdf.setFont('helvetica', 'normal');
      setFontSizeMm(pdf, width * 0.02);
      pdf.setTextColor(...INK_SOFT);
      pdf.text(candidato.partido, cellX, proximaY);
    }
  });

  // Rodapé: logo Votus + domínio, discreto.
  const gridBottom = gridTop + rows * cellHeight + (rows - 1) * rowGap;
  const logoWidth = width * 0.24;
  const logoHeight = logoWidth * LOGO_ASPECT;
  const footerY = gridBottom + width * 0.045;
  pdf.addImage(logoImg, 'PNG', innerLeft, footerY, logoWidth, logoHeight);
  pdf.setFont('helvetica', 'normal');
  setFontSizeMm(pdf, width * 0.022);
  pdf.setTextColor(...INK_SOFT);
  pdf.text('www.votus.site', innerRight, footerY + logoHeight * 0.75, { align: 'right' });
}

// Altura natural (em mm) que drawColaCompacta ocupa pra uma largura de
// referência — usado pra saber a proporção da cola antes de desenhar de
// verdade, e então encaixar na página/grade mantendo essa proporção.
function medirColaAltura(width: number, quantidadeCargos: number): number {
  const pad = width * 0.045;
  const titleSize = width * 0.058;
  const titleY = pad + titleSize * 0.8;
  const headerLineY = titleY + width * 0.025;
  const gridTop = headerLineY + width * 0.04;
  const rows = Math.ceil(quantidadeCargos / 2);
  const cellHeight = width * 0.2;
  const rowGap = width * 0.03;
  const gridBottom = gridTop + rows * cellHeight + (rows - 1) * rowGap;
  const logoWidth = width * 0.24;
  const logoHeight = logoWidth * LOGO_ASPECT;
  const footerY = gridBottom + width * 0.045;
  return footerY + logoHeight + pad;
}

export async function generateSantinhoPdf({
  candidatos,
  quantidadePaginas,
  santinhosPorPagina,
  fileName = 'cola-eleitoral.pdf',
}: {
  candidatos: SantinhoCandidate[];
  quantidadePaginas: number;
  santinhosPorPagina: number;
  fileName?: string;
}): Promise<void> {
  const logoImg = await loadImageAsPngDataUrl('/SantinhoElementos/LogoVotus.svg');

  const grid = GRID_BY_COUNT[santinhosPorPagina] ?? GRID_BY_COUNT[1];
  const colaAspect = medirColaAltura(COLA_WIDTH_REF_MM, candidatos.length) / COLA_WIDTH_REF_MM;

  // Sempre papel A4 normal — a cola é compacta por desenho (sem foto, sem
  // decoração), então mesmo "1 por página" já sai pequena numa folha de
  // verdade, em vez de precisar encolher a página inteira pra do tamanho dela.
  const margin = 10;
  const gap = 8;
  const pageWidth = 210;
  const pageHeight = 297;

  const cellWidth = (pageWidth - margin * 2 - gap * (grid.cols - 1)) / grid.cols;
  const cellHeight = (pageHeight - margin * 2 - gap * (grid.rows - 1)) / grid.rows;

  // Largura da cola: a menor entre "largura máxima de referência" (pra não
  // esticar quando sobra espaço, ex: só 1 por página) e a célula disponível
  // (pra encolher quando são várias, ex: 6 por página) — sempre respeitando
  // a proporção natural do desenho.
  let colaWidth = Math.min(COLA_MAX_WIDTH_MM, cellWidth);
  let colaHeight = colaWidth * colaAspect;
  if (colaHeight > cellHeight) {
    colaHeight = cellHeight;
    colaWidth = colaHeight / colaAspect;
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let page = 0; page < quantidadePaginas; page += 1) {
    if (page > 0) pdf.addPage();

    for (let slot = 0; slot < santinhosPorPagina; slot += 1) {
      const col = slot % grid.cols;
      const row = Math.floor(slot / grid.cols);

      const cellX = margin + col * (cellWidth + gap);
      const cellY = margin + row * (cellHeight + gap);

      const x = cellX + (cellWidth - colaWidth) / 2;
      const y = cellY + (cellHeight - colaHeight) / 2;

      drawColaCompacta(pdf, { x, y, width: colaWidth, candidatos, logoImg });
    }
  }

  pdf.save(fileName);
}
