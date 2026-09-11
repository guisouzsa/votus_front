import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GRID_BY_COUNT: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  2: { cols: 1, rows: 2 },
  4: { cols: 2, rows: 2 },
  6: { cols: 2, rows: 3 },
};

export async function generateSantinhoPdf({
  element,
  quantidadePaginas,
  santinhosPorPagina,
  fileName = 'santinho-eleitoral.pdf',
}: {
  element: HTMLElement;
  quantidadePaginas: number;
  santinhosPorPagina: number;
  fileName?: string;
}): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: '#ffffff',
    useCORS: true,
  });

  const imageData = canvas.toDataURL('image/png');
  const imageAspectRatio = canvas.height / canvas.width;

  const grid = GRID_BY_COUNT[santinhosPorPagina] ?? GRID_BY_COUNT[1];

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 10;
  const gap = 6;

  const cellWidth = (pageWidth - margin * 2 - gap * (grid.cols - 1)) / grid.cols;
  const cellHeight = (pageHeight - margin * 2 - gap * (grid.rows - 1)) / grid.rows;

  // Fit the santinho image within each grid cell while preserving its aspect
  // ratio, so it never stretches or distorts regardless of the grid shape.
  let imgWidth = cellWidth;
  let imgHeight = imgWidth * imageAspectRatio;
  if (imgHeight > cellHeight) {
    imgHeight = cellHeight;
    imgWidth = imgHeight / imageAspectRatio;
  }

  for (let page = 0; page < quantidadePaginas; page += 1) {
    if (page > 0) pdf.addPage();

    for (let slot = 0; slot < santinhosPorPagina; slot += 1) {
      const col = slot % grid.cols;
      const row = Math.floor(slot / grid.cols);

      const cellX = margin + col * (cellWidth + gap);
      const cellY = margin + row * (cellHeight + gap);

      const x = cellX + (cellWidth - imgWidth) / 2;
      const y = cellY + (cellHeight - imgHeight) / 2;

      pdf.addImage(imageData, 'PNG', x, y, imgWidth, imgHeight);
    }
  }

  pdf.save(fileName);
}
