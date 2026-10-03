import jsPDF from 'jspdf';
import type { SantinhoCandidate } from '@/components/SantinhoPreview';

const GRID_BY_COUNT: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  // Lado a lado (não empilhado) — igual ao preview em tela, que já mostra 2
  // colunas a partir desse tamanho (ver GRID_CLASS_BY_COUNT em SantinhoExportModal).
  2: { cols: 2, rows: 1 },
  4: { cols: 2, rows: 2 },
  6: { cols: 2, rows: 3 },
};

const LOGO_ASPECT = 32 / 133; // altura / largura, conforme o viewBox de LogoVotus.svg
const ORANGE: [number, number, number] = [255, 119, 0];
const BORDER: [number, number, number] = [224, 214, 196];
const INK: [number, number, number] = [34, 32, 27]; // mesmo tom de --color-ink usado no nome, no preview em tela
const INK_SOFT: [number, number, number] = [107, 98, 85]; // --color-ink-soft, usado no endereço do Votus
const CARD_ASPECT = 5 / 3; // altura / largura do cartão, igual ao preview na tela
const LATERAL_WIDTH_RATIO = 0.26; // fração da largura do cartão ocupada pela arte lateral
const MM_TO_PT = 72 / 25.4;
// Largura máxima do cartão quando sobra espaço na folha (ex: só 1 por
// página) — sem isso o cartão esticava pra ocupar a página inteira, do jeito
// que acontecia antes. Com várias colas por página a célula disponível já é
// menor que isso, então esse teto não muda nada.
const CARD_WIDTH_MM = 95;

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

// Foto do candidato recortada em círculo (object-fit: cover, alinhada ao
// topo como no preview), com fundo transparente. jsPDF não sabe recortar
// imagem em círculo, então o recorte é feito aqui no canvas. crossOrigin é
// necessário pro canvas poder exportar a imagem do Supabase (o bucket
// responde Access-Control-Allow-Origin: *).
function loadCircularPhoto(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 240;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas indisponível.'));

      const lado = Math.min(img.naturalWidth || 1, img.naturalHeight || 1);
      const sx = ((img.naturalWidth || 1) - lado) / 2;

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, sx, 0, lado, lado, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`Não foi possível carregar ${src}.`));
    img.src = src;
  });
}

// Mede o texto de um nome e corta com reticências se não couber na largura
// disponível — nunca deixa o texto invadir a arte lateral.
function truncarTexto(pdf: jsPDF, texto: string, larguraMaxima: number): string {
  if (pdf.getTextWidth(texto) <= larguraMaxima) return texto;

  let cortado = texto;
  while (cortado.length > 1 && pdf.getTextWidth(`${cortado}...`) > larguraMaxima) {
    cortado = cortado.slice(0, -1);
  }
  return `${cortado.trimEnd()}...`;
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
    fotos,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    candidatos: SantinhoCandidate[];
    lateralImg: string;
    logoImg: string;
    fotos: Map<string, string>;
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

  // Título — duas linhas sempre, igual ao preview em tela ("Cola<br/>Eleitoral"
  // — ver SantinhoPreview.tsx), em vez de uma linha grande que só quebrava
  // (e colidia com a primeira linha de candidato) quando o cartão era menor.
  pdf.setFont('helvetica', 'bold');
  const titleFontSize = width * 0.055;
  setFontSizeMm(pdf, titleFontSize);
  pdf.setTextColor(...ORANGE);

  const titleY = y + padding + width * 0.05;
  pdf.text('COLA', contentLeft, titleY);
  pdf.text('ELEITORAL', contentLeft, titleY + titleFontSize * 1.25);

  const logoWidth = width * 0.26;
  const logoHeight = logoWidth * LOGO_ASPECT;

  // listTop/listBottom enxutos o bastante pra sobrar o mesmo respiro entre
  // candidatos que o preview em tela usa (ver rowGap abaixo).
  const listTop = y + padding + width * 0.16;
  const listBottom = y + height - padding - logoHeight - width * 0.02;

  // Mesmas proporções do preview em tela (SantinhoPreview.tsx): respiro
  // entre cada candidato = gap-[3cqw], ou seja 3% da largura do cartão.
  const rowGap = width * 0.03;
  const rowHeight = (listBottom - listTop - rowGap * (candidatos.length - 1)) / candidatos.length;

  candidatos.forEach((candidato, index) => {
    const rowTop = listTop + (rowHeight + rowGap) * index;

    // Foto alinhada com a linha do número (não mais com o nome) — pareia
    // "quem é" com "qual número", igual ao preview em tela.
    const foto = candidato.fotoUrl ? fotos.get(candidato.fotoUrl) : undefined;
    const fotoSize = width * 0.13;
    const rowLeft = foto ? contentLeft + fotoSize + width * 0.026 : contentLeft;

    // 1. NÚMERO — primeiro e com mais destaque (hierarquia: número > nome >
    // cargo > partido), em vez de pequeno e por último como antes. Tamanho
    // igual ao preview em tela (w-[8.6cqw]).
    const boxGap = width * 0.013;
    const boxAvailable = contentRight - rowLeft - boxGap * (candidato.digitos - 1);
    const boxSize = Math.min(width * 0.086, boxAvailable / candidato.digitos);
    const boxY = rowTop;

    pdf.setDrawColor(...ORANGE);
    pdf.setLineWidth(width * 0.003);

    for (let digitIndex = 0; digitIndex < candidato.digitos; digitIndex += 1) {
      const boxX = rowLeft + digitIndex * (boxSize + boxGap);
      pdf.roundedRect(boxX, boxY, boxSize, boxSize, width * 0.007, width * 0.007, 'D');

      const digit = candidato.numero[digitIndex];
      if (digit && digit !== ' ') {
        pdf.setFont('helvetica', 'bold');
        setFontSizeMm(pdf, boxSize * 0.56);
        pdf.setTextColor(...ORANGE);
        pdf.text(digit, boxX + boxSize / 2, boxY + boxSize / 2 + width * 0.016, { align: 'center' });
      }
    }

    if (foto) {
      const centroX = contentLeft + fotoSize / 2;
      const centroY = boxY + boxSize / 2;

      // Foto ligeiramente menor que o círculo laranja, com o fundo branco da
      // página aparecendo no vão — mesmo anel fino do preview em tela, em
      // vez da foto encostar direto na borda.
      const fotoInterna = fotoSize * 0.88;
      pdf.addImage(foto, 'PNG', centroX - fotoInterna / 2, centroY - fotoInterna / 2, fotoInterna, fotoInterna);
      pdf.setLineWidth(width * 0.0035);
      pdf.circle(centroX, centroY, fotoSize / 2, 'S');
    }

    // 2. NOME — respiro maior em relação ao número (mt-[1.9cqw] no preview),
    // pra marcar a troca de nível hierárquico.
    let proximaY = boxY + boxSize + width * 0.019 + width * 0.027;
    if (candidato.nome) {
      const nomeFontSize = width * 0.028;
      pdf.setFont('helvetica', 'bold');
      setFontSizeMm(pdf, nomeFontSize);
      pdf.setTextColor(...INK);
      pdf.text(truncarTexto(pdf, candidato.nome, contentRight - rowLeft), rowLeft, proximaY);
    }

    // 3-4. CARGO + PARTIDO — informação complementar, menores e mais
    // próximas entre si do que do nome acima (mesmo mt-[1.1cqw] e
    // gap-[0.3cqw] do preview).
    proximaY += width * 0.011 + width * 0.019;
    pdf.setFont('helvetica', 'bold');
    setFontSizeMm(pdf, width * 0.019);
    pdf.setTextColor(...ORANGE);
    pdf.text(candidato.cargo, rowLeft, proximaY);

    if (candidato.partido) {
      proximaY += width * 0.003 + width * 0.015;
      pdf.setFont('helvetica', 'normal');
      setFontSizeMm(pdf, width * 0.015);
      pdf.setTextColor(...INK_SOFT);
      pdf.text(candidato.partido, rowLeft, proximaY);
    }
  });

  // Logo Votus, canto inferior esquerdo — nunca recortada (object-contain),
  // senao a palavra "VOTUS" ficaria cortada.
  const logoY = y + height - padding - logoHeight;
  pdf.addImage(logoImg, 'PNG', contentLeft, logoY, logoWidth, logoHeight);

  // Endereço do Votus, discreto, logo abaixo da logo — mesmo texto do
  // preview em tela.
  pdf.setFont('helvetica', 'normal');
  setFontSizeMm(pdf, width * 0.024);
  pdf.setTextColor(...INK_SOFT);
  pdf.text('www.votus.site', contentLeft, logoY + logoHeight + width * 0.028);
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
  // A caixa da arte lateral tem largura = LATERAL_WIDTH_RATIO do cartao e
  // altura = altura total do cartao (CARD_ASPECT vezes a largura).
  const lateralBoxAspect = LATERAL_WIDTH_RATIO / CARD_ASPECT;

  const urlsFotos = [...new Set(candidatos.map((c) => c.fotoUrl).filter((u): u is string => Boolean(u)))];

  const [lateralImg, logoImg, fotosCarregadas] = await Promise.all([
    loadImageCoveringAspect('/SantinhoElementos/lateral.svg', lateralBoxAspect),
    loadImageAsPngDataUrl('/SantinhoElementos/LogoVotus.svg'),
    // Foto que falhar ao carregar só fica de fora (linha sem foto) — nunca
    // impede a geração do PDF.
    Promise.all(urlsFotos.map((url) => loadCircularPhoto(url).then((png) => [url, png] as const).catch(() => null))),
  ]);

  const fotos = new Map(fotosCarregadas.filter((f): f is readonly [string, string] => f !== null));

  const grid = GRID_BY_COUNT[santinhosPorPagina] ?? GRID_BY_COUNT[1];

  // Sempre folha A4 normal — o cartão tem largura máxima própria
  // (CARD_WIDTH_MM) e só encolhe além disso quando a grade pede mais colunas
  // ou linhas do que cabe. Com 1 por página isso já evita esticar o cartão
  // pra ocupar a página inteira (era o que acontecia antes).
  const margin = 10;
  const gap = 8;
  const pageWidth = 210;
  const pageHeight = 297;

  const cellWidth = (pageWidth - margin * 2 - gap * (grid.cols - 1)) / grid.cols;
  const cellHeight = (pageHeight - margin * 2 - gap * (grid.rows - 1)) / grid.rows;

  // O cartão é sempre desenhado na proporção 3:5 (largura:altura), igual ao
  // preview na tela — nunca deforma, só encolhe pra caber no teto de largura
  // ou na célula, o que for menor.
  let cardWidth = Math.min(CARD_WIDTH_MM, cellWidth);
  let cardHeight = cardWidth * CARD_ASPECT;
  if (cardHeight > cellHeight) {
    cardHeight = cellHeight;
    cardWidth = cardHeight / CARD_ASPECT;
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let page = 0; page < quantidadePaginas; page += 1) {
    if (page > 0) pdf.addPage();

    for (let slot = 0; slot < santinhosPorPagina; slot += 1) {
      const col = slot % grid.cols;
      const row = Math.floor(slot / grid.cols);

      const cellX = margin + col * (cellWidth + gap);
      const cellY = margin + row * (cellHeight + gap);

      const x = cellX + (cellWidth - cardWidth) / 2;
      const y = cellY + (cellHeight - cardHeight) / 2;

      drawSantinho(pdf, { x, y, width: cardWidth, height: cardHeight, candidatos, lateralImg, logoImg, fotos });
    }
  }

  pdf.save(fileName);
}
