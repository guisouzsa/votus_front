import jsPDF from 'jspdf';
import type { SantinhoCandidato } from '@/components/SantinhoPreview';

const GRID_BY_COUNT: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  2: { cols: 1, rows: 2 },
  4: { cols: 2, rows: 2 },
  6: { cols: 2, rows: 3 },
};

const LOGO_ASPECT = 32 / 133; // altura / largura, conforme o viewBox de LogoVotus.svg
const ORANGE: [number, number, number] = [255, 119, 0];
const BORDER: [number, number, number] = [224, 214, 196];
const CARD_ASPECT = 5 / 3; // altura / largura do santinho, igual ao preview na tela
const LATERAL_WIDTH_RATIO = 0.26; // fração da largura do cartão ocupada pela arte lateral
const MM_TO_PT = 72 / 25.4;

// pdf.setFontSize() sempre espera pontos, mesmo com o documento configurado
// em mm (unit: 'mm') — sem essa conversão o texto fica desproporcional ao
// resto do desenho (que usa mm em tudo: x, y, largura, altura).
function setFontSizeMm(pdf: jsPDF, sizeMm: number) {
  pdf.setFontSize(sizeMm * MM_TO_PT);
}

// Carrega uma imagem (SVG ou não) e devolve um PNG em data URL, sem recortar.
// jsPDF não sabe embutir SVG diretamente, mas desenha PNG sem problema — e
// isso evita totalmente o html2canvas, que não entende cores oklch()/
// aspect-ratio do Tailwind v4 e distorcia o resultado inteiro.
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

// Igual acima, mas recorta a imagem pra cobrir exatamente a proporção alvo
// (como object-fit: cover em CSS) antes de exportar — assim o addImage do
// jsPDF nunca precisa esticar a imagem pra bater com a caixa de destino.
function loadImageCoveringAspect(src: string, targetAspect: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const naturalWidth = img.naturalWidth || 1;
      const naturalHeight = img.naturalHeight || 1;
      const naturalAspect = naturalWidth / naturalHeight;

      let sx = 0;
      let sy = 0;
      let sw = naturalWidth;
      let sh = naturalHeight;

      if (naturalAspect > targetAspect) {
        sw = naturalHeight * targetAspect;
        sx = (naturalWidth - sw) / 2;
      } else {
        sh = naturalWidth / targetAspect;
        sy = (naturalHeight - sh) / 2;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sw));
      canvas.height = Math.max(1, Math.round(sh));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas indisponível.'));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`Não foi possível carregar ${src}.`));
    img.src = src;
  });
}

function drawSantinho(
  pdf: jsPDF,
  {
    x,
    y,
    width,
    height,
    candidatos,
    lateralImg,
    logoImg,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    candidatos: SantinhoCandidato[];
    lateralImg: string;
    logoImg: string;
  }
) {
  // Cartão branco com cantos arredondados
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(width * 0.004);
  pdf.roundedRect(x, y, width, height, width * 0.035, width * 0.035, 'FD');

  const padding = width * 0.07;
  const lateralWidth = width * LATERAL_WIDTH_RATIO;

  // A imagem ja foi pre-recortada (loadImageCoveringAspect) pra ter
  // exatamente essa proporcao, entao desenhar nesse tamanho nunca distorce.
  pdf.addImage(lateralImg, 'PNG', x + width - lateralWidth, y, lateralWidth, height);

  const contentRight = x + width - lateralWidth - padding * 0.4;
  const contentLeft = x + padding;
  const availableWidth = contentRight - contentLeft;

  // Título — pdf.text() nunca quebra linha ou respeita limite de largura
  // sozinho; sem medir o texto ele simplesmente desenhava por cima da arte
  // lateral quando não cabia. Mede com getTextWidth() e quebra em duas
  // linhas quando necessário, do mesmo jeito que o preview em tela.
  pdf.setFont('helvetica', 'bold');
  const titleFontSize = width * 0.085;
  setFontSizeMm(pdf, titleFontSize);
  pdf.setTextColor(...ORANGE);

  const titleY = y + padding + width * 0.05;
  if (pdf.getTextWidth('SANTINHO ELEITORAL') <= availableWidth) {
    pdf.text('SANTINHO ELEITORAL', contentLeft, titleY);
  } else {
    pdf.text('SANTINHO', contentLeft, titleY);
    pdf.text('ELEITORAL', contentLeft, titleY + titleFontSize * 1.25);
  }

  const logoWidth = width * 0.32;
  const logoHeight = logoWidth * LOGO_ASPECT;

  // Margem generosa o bastante pra sempre limpar o título mesmo quando ele
  // quebrou em duas linhas (pior caso), independente de ter quebrado ou não.
  const listTop = y + padding + width * 0.26;
  const listBottom = y + height - padding - logoHeight - width * 0.04;
  const rowHeight = (listBottom - listTop) / candidatos.length;

  candidatos.forEach((candidato, index) => {
    const rowY = listTop + rowHeight * index;

    pdf.setFont('helvetica', 'bold');
    setFontSizeMm(pdf, width * 0.052);
    pdf.setTextColor(...ORANGE);
    pdf.text(candidato.cargo, contentLeft, rowY);

    const boxGap = width * 0.012;
    const availableWidth = contentRight - contentLeft - boxGap * (candidato.digitos - 1);
    const boxSize = Math.min(width * 0.078, availableWidth / candidato.digitos);
    const boxY = rowY + width * 0.02;

    pdf.setDrawColor(...ORANGE);
    pdf.setLineWidth(width * 0.0025);

    for (let digitIndex = 0; digitIndex < candidato.digitos; digitIndex += 1) {
      const boxX = contentLeft + digitIndex * (boxSize + boxGap);
      pdf.roundedRect(boxX, boxY, boxSize, boxSize, width * 0.006, width * 0.006, 'D');

      const digit = candidato.numero[digitIndex];
      if (digit && digit !== ' ') {
        pdf.setFont('helvetica', 'bold');
        setFontSizeMm(pdf, boxSize * 0.55);
        pdf.setTextColor(...ORANGE);
        pdf.text(digit, boxX + boxSize / 2, boxY + boxSize / 2 + width * 0.018, { align: 'center' });
      }
    }
  });

  // Logo Votus, canto inferior esquerdo — nunca recortada (object-contain),
  // senao a palavra "VOTUS" ficaria cortada.
  pdf.addImage(logoImg, 'PNG', contentLeft, y + height - padding - logoHeight, logoWidth, logoHeight);
}

export async function generateSantinhoPdf({
  candidatos,
  quantidadePaginas,
  santinhosPorPagina,
  fileName = 'santinho-eleitoral.pdf',
}: {
  candidatos: SantinhoCandidato[];
  quantidadePaginas: number;
  santinhosPorPagina: number;
  fileName?: string;
}): Promise<void> {
  // A caixa da arte lateral tem largura = LATERAL_WIDTH_RATIO do cartao e
  // altura = altura total do cartao (CARD_ASPECT vezes a largura).
  const lateralBoxAspect = LATERAL_WIDTH_RATIO / CARD_ASPECT;

  const [lateralImg, logoImg] = await Promise.all([
    loadImageCoveringAspect('/SantinhoElementos/lateral.svg', lateralBoxAspect),
    loadImageAsPngDataUrl('/SantinhoElementos/LogoVotus.svg'),
  ]);

  const grid = GRID_BY_COUNT[santinhosPorPagina] ?? GRID_BY_COUNT[1];

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 10;
  const gap = 8;

  const cellWidth = (pageWidth - margin * 2 - gap * (grid.cols - 1)) / grid.cols;
  const cellHeight = (pageHeight - margin * 2 - gap * (grid.rows - 1)) / grid.rows;

  // O santinho é sempre desenhado na proporção 3:5 (largura:altura), igual
  // ao preview na tela — nunca deforma, só encolhe pra caber na célula.
  let cardWidth = cellWidth;
  let cardHeight = cardWidth * CARD_ASPECT;
  if (cardHeight > cellHeight) {
    cardHeight = cellHeight;
    cardWidth = cardHeight / CARD_ASPECT;
  }

  for (let page = 0; page < quantidadePaginas; page += 1) {
    if (page > 0) pdf.addPage();

    for (let slot = 0; slot < santinhosPorPagina; slot += 1) {
      const col = slot % grid.cols;
      const row = Math.floor(slot / grid.cols);

      const cellX = margin + col * (cellWidth + gap);
      const cellY = margin + row * (cellHeight + gap);

      const x = cellX + (cellWidth - cardWidth) / 2;
      const y = cellY + (cellHeight - cardHeight) / 2;

      drawSantinho(pdf, { x, y, width: cardWidth, height: cardHeight, candidatos, lateralImg, logoImg });
    }
  }

  pdf.save(fileName);
}
