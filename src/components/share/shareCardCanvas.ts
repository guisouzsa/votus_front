import type { ShareField, ShareProfile } from './shareCardData';

// Desenho do card de compartilhamento num <canvas>. A prévia do editor é o
// próprio canvas na resolução final (só reduzido por CSS), então o arquivo
// baixado é exatamente o que o usuário vê — e nenhum controle do editor entra
// na imagem.

export type ShareFormat = 'story' | 'feed' | 'square';
export type ShareTemplate = 'lista' | 'centro';

export const SHARE_FORMATS: Record<ShareFormat, { label: string; hint: string; width: number; height: number }> = {
  story: { label: 'Stories e Status', hint: '9:16', width: 1080, height: 1920 },
  feed: { label: 'Feed vertical', hint: '4:5', width: 1080, height: 1350 },
  square: { label: 'Quadrado', hint: '1:1', width: 1080, height: 1080 },
};

export const SHARE_TEMPLATES: Record<ShareTemplate, string> = {
  lista: 'Clássico',
  centro: 'Centralizado',
};

export interface ShareBackground {
  id: string;
  label: string;
  /** Uma cor = fundo sólido; duas ou mais = gradiente diagonal. */
  colors: string[];
  text: string;
  muted: string;
  light: boolean;
}

// Cores da identidade do Votus (globals.css) e tons próximos. Cada fundo foi
// conferido para manter texto e texto secundário legíveis em todas as cores
// do gradiente (ver contraste em effectiveAccent e no teste do card).
export const SHARE_BACKGROUNDS: ShareBackground[] = [
  // Sólidos
  { id: 'creme', label: 'Creme', colors: ['#FDF8EE'], text: '#22201b', muted: '#5f5649', light: true },
  { id: 'branco', label: 'Branco', colors: ['#FFFFFF'], text: '#22201b', muted: '#5f5649', light: true },
  { id: 'verde', label: 'Verde', colors: ['#1B623A'], text: '#FFFFFF', muted: '#d4e6da', light: false },
  { id: 'vinho', label: 'Vinho', colors: ['#8D0801'], text: '#FFFFFF', muted: '#f6dcda', light: false },
  // Gradientes escuros
  { id: 'grad-floresta', label: 'Floresta', colors: ['#1B623A', '#0B3320'], text: '#FFFFFF', muted: '#d4e6da', light: false },
  { id: 'grad-esmeralda', label: 'Esmeralda', colors: ['#064E3B', '#0B6A4C'], text: '#FFFFFF', muted: '#dcefe3', light: false },
  { id: 'grad-campo', label: 'Campo', colors: ['#1B623A', '#3F6212'], text: '#FFFFFF', muted: '#e2edcf', light: false },
  { id: 'grad-oceano', label: 'Oceano', colors: ['#0B4F5C', '#0A3550'], text: '#FFFFFF', muted: '#d6e8ee', light: false },
  { id: 'grad-ameixa', label: 'Ameixa', colors: ['#6B1438', '#3A0A24'], text: '#FFFFFF', muted: '#f3dbe5', light: false },
  { id: 'grad-vinho', label: 'Vinho profundo', colors: ['#8D0801', '#4A0400'], text: '#FFFFFF', muted: '#f6dcda', light: false },
  { id: 'grad-por-do-sol', label: 'Pôr do sol', colors: ['#B23A0A', '#8D0801'], text: '#FFFFFF', muted: '#f8ddd3', light: false },
  { id: 'grad-noite', label: 'Noite', colors: ['#22201b', '#16341F'], text: '#FFFFFF', muted: '#d9d4c8', light: false },
  // Gradientes claros
  { id: 'grad-areia', label: 'Areia', colors: ['#FDF8EE', '#EDDBBA'], text: '#22201b', muted: '#5a4a30', light: true },
  { id: 'grad-menta', label: 'Menta', colors: ['#F1FAF4', '#CFEBD9'], text: '#16341F', muted: '#3f5a48', light: true },
  { id: 'grad-pessego', label: 'Pêssego', colors: ['#FFF4EA', '#FFD9B8'], text: '#3a1a05', muted: '#6b4426', light: true },
  { id: 'grad-sol', label: 'Sol', colors: ['#FFFBEA', '#FCE7A1'], text: '#2b2106', muted: '#5f4c12', light: true },
];

export const SHARE_ACCENTS = [
  { id: 'verde', label: 'Verde', color: '#1B623A' },
  { id: 'vermelho', label: 'Vermelho', color: '#8D0801' },
  { id: 'laranja', label: 'Laranja', color: '#FF7700' },
  { id: 'dourado', label: 'Dourado', color: '#FCC100' },
] as const;

export type ShareAccentId = (typeof SHARE_ACCENTS)[number]['id'];

export interface ShareDesign {
  format: ShareFormat;
  template: ShareTemplate;
  backgroundId: string;
  accentId: ShareAccentId;
  showPhoto: boolean;
}

export const DEFAULT_DESIGN: ShareDesign = {
  format: 'feed',
  template: 'lista',
  backgroundId: 'creme',
  accentId: 'verde',
  showPhoto: true,
};

export interface ShareAssets {
  photo: HTMLImageElement | null;
  logo: HTMLImageElement | null;
  fonts: { heading: string; body: string };
}

export interface ShareRenderResult {
  /** Campos que não couberam no formato, mesmo com o texto reduzido. */
  omitted: string[];
  /** Fator aplicado aos textos (1 = tamanho normal). */
  scale: number;
}

// Faixa do topo: as quatro cores da marca Votus, na ordem da logo.
const BRAND_STRIPE = ['#FF7700', '#1B623A', '#FCC100', '#8D0801'];

// ---------------------------------------------------------------------------
// Utilidades de cor e texto

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** A cor de destaque escolhida, ou a cor do texto se ela sumir no fundo. */
/** Pior contraste de uma cor contra todas as cores do fundo. */
export function worstContrast(color: string, bg: ShareBackground): number {
  return Math.min(...bg.colors.map((c) => contrast(color, c)));
}

export function effectiveAccent(design: ShareDesign): string {
  const bg = backgroundOf(design);
  const accent = SHARE_ACCENTS.find((a) => a.id === design.accentId)?.color ?? bg.text;
  const worst = Math.min(...bg.colors.map((c) => contrast(accent, c)));

  return worst >= 3 ? accent : bg.text;
}

export function backgroundOf(design: ShareDesign): ShareBackground {
  return SHARE_BACKGROUNDS.find((b) => b.id === design.backgroundId) ?? SHARE_BACKGROUNDS[0];
}

/** Quebra o texto em linhas que cabem na largura; reticências se passar do limite. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }

  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Foto no recorte (object-fit: cover, alinhada ao topo como no perfil). */
function drawPhoto(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, round: boolean) {
  ctx.save();
  if (round) {
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    ctx.closePath();
  } else {
    roundRect(ctx, x, y, w, h, Math.min(w, h) * 0.14);
  }
  ctx.clip();
  const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / ratio;
  const sh = h / ratio;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, 0, sw, sh, x, y, w, h);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Composição

interface Ctx {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  s: number;
  /** Multiplica só os espaços verticais (o quadrado é mais compacto); fontes não mudam. */
  gap: number;
  pad: number;
  bg: ShareBackground;
  accent: string;
  fonts: ShareAssets['fonts'];
}

function font(c: Ctx, weight: number, size: number, family: 'heading' | 'body') {
  c.ctx.font = `${weight} ${Math.round(size * c.s)}px ${c.fonts[family]}`;
}

/** Desenha (ou só mede, com draw=false) uma lista de linhas; devolve a altura. */
function textBlock(
  c: Ctx,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  align: CanvasTextAlign,
  color: string,
  draw: boolean,
): number {
  if (draw) {
    c.ctx.fillStyle = color;
    c.ctx.textAlign = align;
    c.ctx.textBaseline = 'top';
    lines.forEach((l, i) => c.ctx.fillText(l, x, y + i * lineHeight));
  }
  return lines.length * lineHeight;
}

function drawBackground(c: Ctx) {
  const { ctx, W, H, bg } = c;
  if (bg.colors.length > 1) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    bg.colors.forEach((color, i) => g.addColorStop(i / (bg.colors.length - 1), color));
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = bg.colors[0];
  }
  ctx.fillRect(0, 0, W, H);

  // Faixa com as cores da marca no topo: identidade do Votus de relance. Cor
  // que some no fundo (verde no fundo verde) fica de fora.
  const stripe = BRAND_STRIPE.filter((color) => Math.min(...bg.colors.map((b) => contrast(color, b))) >= 1.6);
  const seg = W / stripe.length;
  stripe.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(i * seg, 0, seg + 1, 18);
  });
}

/**
 * Etiquetas (partido, estado, legislatura): pílulas na cor de destaque,
 * quebrando linha quando não cabem. Devolve a altura ocupada.
 */
function chips(c: Ctx, labels: string[], x: number, y: number, width: number, align: 'left' | 'center', draw: boolean): number {
  if (labels.length === 0) return 0;
  font(c, 700, 28, 'body');
  const h = 54 * c.s;
  const padX = 24 * c.s;
  const gap = 12 * c.s;
  const rows: { label: string; w: number }[][] = [[]];
  let rowW = 0;

  for (const label of labels) {
    const w = c.ctx.measureText(label).width + padX * 2;
    if (rowW > 0 && rowW + gap + w > width) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push({ label, w });
    rowW += (rowW > 0 ? gap : 0) + w;
  }

  if (draw) {
    rows.forEach((row, r) => {
      const total = row.reduce((a, p) => a + p.w, 0) + gap * (row.length - 1);
      let cx = align === 'center' ? x - total / 2 : x;
      const cy = y + r * (h + gap);
      for (const { label, w } of row) {
        c.ctx.globalAlpha = 0.14;
        c.ctx.fillStyle = c.accent;
        roundRect(c.ctx, cx, cy, w, h, h / 2);
        c.ctx.fill();
        c.ctx.globalAlpha = 1;
        font(c, 700, 28, 'body');
        c.ctx.fillStyle = c.accent;
        c.ctx.textAlign = 'center';
        c.ctx.textBaseline = 'middle';
        c.ctx.fillText(label, cx + w / 2, cy + h / 2 + 1);
        cx += w + gap;
      }
    });
  }

  return rows.length * h + (rows.length - 1) * gap;
}

/**
 * Um dado: rótulo curto, valor em destaque e contexto. Número ou termo curto
 * vai grande; texto longo (ex.: escolaridade) vai menor e em até 3 linhas,
 * em vez de ser cortado.
 */
function metric(
  c: Ctx,
  f: ShareField,
  x: number,
  y: number,
  width: number,
  align: CanvasTextAlign,
  draw: boolean,
  detailLines = 1,
): number {
  let h = 0;
  font(c, 700, 24, 'body');
  h += textBlock(c, [f.label.toUpperCase()], x, y, 32 * c.s, align, c.accent, draw);
  h += 4 * c.s;
  const long = f.value.length > 26;
  font(c, 800, long ? 40 : 60, 'heading');
  h += textBlock(c, wrap(c.ctx, f.value, width, long ? 3 : 2), x, y + h, (long ? 50 : 70) * c.s, align, c.bg.text, draw);
  if (f.detail) {
    h += 10 * c.s;
    font(c, 500, 26, 'body');
    h += textBlock(c, wrap(c.ctx, f.detail, width, detailLines), x, y + h, 34 * c.s, align, c.bg.muted, draw);
  }
  return h;
}

/**
 * Rodapé: linha da fonte e, embaixo, o selo "Compartilhado via VOTUS" — uma
 * pílula branca com a logo colorida, que funciona em qualquer fundo e deixa
 * claro que o card foi produzido pelo Votus. Devolve a altura.
 */
/** Logo colorida (ou o nome em verde, se a imagem faltar). Devolve a largura. */
function drawLogo(c: Ctx, logo: HTMLImageElement | null, x: number, midY: number, height: number): number {
  if (logo) {
    const w = (logo.naturalWidth / logo.naturalHeight) * height;
    c.ctx.drawImage(logo, x, midY - height / 2, w, height);
    return w;
  }
  c.ctx.font = `900 ${Math.round(height * 0.9)}px ${c.fonts.heading}`;
  c.ctx.fillStyle = '#1B623A';
  c.ctx.textAlign = 'left';
  c.ctx.textBaseline = 'middle';
  c.ctx.fillText('VOTUS', x, midY + 1);
  return c.ctx.measureText('VOTUS').width;
}

function logoWidth(logo: HTMLImageElement | null, height: number, c: Ctx): number {
  if (logo) return (logo.naturalWidth / logo.naturalHeight) * height;
  c.ctx.font = `900 ${Math.round(height * 0.9)}px ${c.fonts.heading}`;
  return c.ctx.measureText('VOTUS').width;
}

/** Pílula branca com borda (nos fundos claros) — o "papel" do selo Votus. */
function whitePill(c: Ctx, x: number, y: number, w: number, h: number) {
  c.ctx.fillStyle = '#FFFFFF';
  roundRect(c.ctx, x, y, w, h, h / 2);
  c.ctx.fill();
  if (c.bg.light) {
    c.ctx.strokeStyle = '#d9cdb5';
    c.ctx.lineWidth = 2 * c.s;
    c.ctx.stroke();
  }
}

/**
 * Rodapé: fonte, data e site numa linha e, embaixo, o selo grande "Gerado e
 * compartilhado via VOTUS" — pílula branca com a logo colorida, legível em
 * qualquer fundo, deixando claro que o card foi produzido pelo Votus.
 */
function footer(c: Ctx, profile: ShareProfile, logo: HTMLImageElement | null, siteHost: string, align: CanvasTextAlign, draw: boolean): number {
  const width = c.W - c.pad * 2;
  const badgeH = 124 * c.s;
  const date = new Date().toLocaleDateString('pt-BR');
  font(c, 500, 24, 'body');
  const sourceLines = wrap(c.ctx, `Fonte: ${profile.source} · ${date} · ${siteHost}`, width, 2);
  const sourceH = sourceLines.length * 32 * c.s;
  const h = sourceH + 22 * c.s + badgeH;
  if (!draw) return h;

  const top = c.H - c.pad - h;
  textBlock(c, sourceLines, align === 'center' ? c.W / 2 : c.pad, top, 32 * c.s, align, c.bg.muted, true);

  const by = top + sourceH + 22 * c.s;
  whitePill(c, c.pad, by, width, badgeH);

  // Texto + logo centralizados na pílula; frase menor se não couber.
  const logoH = 60 * c.s;
  const lw = logoWidth(logo, logoH, c);
  const gap = 18 * c.s;
  font(c, 800, 32, 'body');
  let label = 'Gerado e compartilhado via';
  if (c.ctx.measureText(label).width + gap + lw > width - 80 * c.s) label = 'Gerado via';
  const labelW = c.ctx.measureText(label).width;
  const startX = c.W / 2 - (labelW + gap + lw) / 2;
  const mid = by + badgeH / 2;

  c.ctx.fillStyle = '#22201b';
  c.ctx.textAlign = 'left';
  c.ctx.textBaseline = 'middle';
  c.ctx.fillText(label, startX, mid + 1);
  drawLogo(c, logo, startX + labelW + gap, mid, logoH);

  return h;
}

/**
 * Monta o card inteiro. Com draw=false só mede e devolve a altura usada pelo
 * conteúdo (sem o rodapé), para decidir escala e cortes antes de desenhar.
 */
function compose(
  c: Ctx,
  profile: ShareProfile,
  metrics: ShareField[],
  selected: Set<string>,
  design: ShareDesign,
  assets: ShareAssets,
  draw: boolean,
  offsetY = 0,
): number {
  const { pad, W, s } = c;
  const width = W - pad * 2;
  const photo = design.showPhoto ? assets.photo : null;
  const centered = design.template === 'centro';
  const tags = profile.fields.filter((f) => f.group === 'identificacao' && selected.has(f.id)).map((f) => f.value);
  // Espaço vertical entre blocos (menor no formato quadrado).
  const v = s * c.gap;
  let y = pad + 18 + offsetY;

  // Linha do topo: etiqueta à esquerda (ou no centro) e, no canto direito, a
  // pílula com a logo do Votus — a marca aparece em cima e embaixo do card.
  const topH = 64 * s;
  if (draw) {
    const logoH = 34 * s;
    const pillW = logoWidth(assets.logo, logoH, c) + 44 * s;
    whitePill(c, W - pad - pillW, y, pillW, topH);
    drawLogo(c, assets.logo, W - pad - pillW + 22 * s, y + topH / 2, logoH);
  }
  font(c, 800, 24, 'body');
  textBlock(c, ['PERFIL PÚBLICO'], centered ? W / 2 : pad, y + topH / 2 - 16 * s, 32 * s, centered ? 'center' : 'left', c.accent, draw);
  y += topH + 40 * v;

  if (centered) {
    if (photo) {
      const size = (c.gap < 1 ? 190 : 300) * s;
      const ring = 8 * s;
      if (draw) {
        c.ctx.fillStyle = c.accent;
        c.ctx.beginPath();
        c.ctx.arc(W / 2, y + size / 2, size / 2 + ring, 0, Math.PI * 2);
        c.ctx.fill();
        drawPhoto(c.ctx, photo, W / 2 - size / 2, y, size, size, true);
      }
      y += size + ring + 44 * v;
    }
    font(c, 800, 70, 'heading');
    y += textBlock(c, wrap(c.ctx, profile.name, width, 2), W / 2, y, 80 * s, 'center', c.bg.text, draw) + 10 * s;
    font(c, 600, 32, 'body');
    y += textBlock(c, [profile.role], W / 2, y, 42 * s, 'center', c.bg.muted, draw);
    if (tags.length) y += 24 * s + chips(c, tags, W / 2, y + 24 * s, width, 'center', draw);
  } else {
    const size = photo ? (c.gap < 1 ? 200 : 250) * s : 0;
    const gap = photo ? 44 * s : 0;
    const textX = pad + size + gap;
    const textW = width - size - gap;
    font(c, 800, 66, 'heading');
    const nameLines = wrap(c.ctx, profile.name, textW, 3);
    font(c, 600, 30, 'body');
    const roleLines = wrap(c.ctx, profile.role, textW, 2);
    const chipsH = chips(c, tags, textX, 0, textW, 'left', false);
    const textH = nameLines.length * 76 * s + 8 * s + roleLines.length * 40 * s + (tags.length ? 22 * s + chipsH : 0);
    const blockH = Math.max(size, textH);
    const ty = y + (blockH - textH) / 2;

    if (photo && draw) {
      const ring = 8 * s;
      c.ctx.fillStyle = c.accent;
      roundRect(c.ctx, pad - ring, y + (blockH - size) / 2 - ring, size + ring * 2, size + ring * 2, (size + ring * 2) * 0.16);
      c.ctx.fill();
      drawPhoto(c.ctx, photo, pad, y + (blockH - size) / 2, size, size, false);
    }
    font(c, 800, 66, 'heading');
    let ly = ty + textBlock(c, nameLines, textX, ty, 76 * s, 'left', c.bg.text, draw) + 8 * s;
    font(c, 600, 30, 'body');
    ly += textBlock(c, roleLines, textX, ly, 40 * s, 'left', c.bg.muted, draw);
    if (tags.length) chips(c, tags, textX, ly + 22 * s, textW, 'left', draw);
    y += blockH;
  }

  if (metrics.length === 0) return y;
  y += 64 * v;

  // Centralizado com 3+ dados (ou 2+ no quadrado, que tem pouca altura): duas
  // colunas; senão, uma lista.
  const twoCols = centered && (metrics.length >= 3 || (c.gap < 1 && metrics.length >= 2));
  if (twoCols) {
    const gap = 56 * s;
    const colW = (width - gap) / 2;
    for (let i = 0; i < metrics.length; i += 2) {
      const pair = metrics.slice(i, i + 2);
      if (i > 0 && draw) {
        c.ctx.fillStyle = c.bg.muted;
        c.ctx.globalAlpha = 0.3;
        c.ctx.fillRect(pad, y - 28 * v, width, 2 * s);
        c.ctx.globalAlpha = 1;
      }
      // Último dado sozinho na linha: centralizado, não preso à coluna da esquerda.
      const heights =
        pair.length === 1
          ? [metric(c, pair[0], W / 2, y, colW * 1.4, 'center', draw, 2)]
          : pair.map((m, k) => metric(c, m, pad + k * (colW + gap) + colW / 2, y, colW, 'center', draw, 2));
      y += Math.max(...heights) + 56 * v;
    }
    return y - 56 * v;
  }

  metrics.forEach((m, i) => {
    if (i > 0) {
      if (draw) {
        c.ctx.fillStyle = c.bg.muted;
        c.ctx.globalAlpha = 0.3;
        c.ctx.fillRect(centered ? W / 2 - width / 4 : pad, y, centered ? width / 2 : width, 2 * s);
        c.ctx.globalAlpha = 1;
      }
      y += 2 * s + 32 * v;
    }
    y += metric(c, m, centered ? W / 2 : pad, y, width, centered ? 'center' : 'left', draw);
    y += 32 * v;
  });

  return y - 32 * v;
}

/**
 * Desenha o card no canvas (redimensionando-o para o formato). Tenta o
 * tamanho normal do texto; se não couber, reduz até 85%; se ainda não
 * couber, deixa de fora os últimos dados e informa quais (o editor sugere
 * removê-los) — nunca espreme o texto além disso.
 */
export function renderShareCard(
  canvas: HTMLCanvasElement,
  profile: ShareProfile,
  selectedIds: string[],
  design: ShareDesign,
  assets: ShareAssets,
  siteHost: string,
): ShareRenderResult {
  const { width: W, height: H } = SHARE_FORMATS[design.format];
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { omitted: [], scale: 1 };

  const selected = new Set(selectedIds);
  const allMetrics = profile.fields.filter((f) => selected.has(f.id) && f.group !== 'identificacao');
  const bg = backgroundOf(design);
  const base: Omit<Ctx, 's'> = {
    ctx,
    W,
    H,
    gap: design.format === 'square' ? 0.55 : 1,
    pad: design.format === 'square' ? 64 : 80,
    bg,
    accent: effectiveAccent(design),
    fonts: assets.fonts,
  };
  const align: CanvasTextAlign = design.template === 'centro' ? 'center' : 'left';

  let chosen = { s: 0.85, metrics: [] as ShareField[], free: 0 };
  search: for (let count = allMetrics.length; count >= 0; count--) {
    for (const s of [1, 0.92, 0.85]) {
      const c = { ...base, s };
      const metrics = allMetrics.slice(0, count);
      const used = compose(c, profile, metrics, selected, design, assets, false);
      const foot = footer(c, profile, assets.logo, siteHost, align, false);
      const free = H - c.pad - foot - 56 * s - used;
      if (free >= 0) {
        chosen = { s, metrics, free };
        break search;
      }
    }
  }

  // Sobra de altura (comum em Stories): o conteúdo fica centralizado entre o
  // topo e o rodapé, em vez de deixar um vazio grande no meio.
  const c = { ...base, s: chosen.s };
  drawBackground(c);
  compose(c, profile, chosen.metrics, selected, design, assets, true, chosen.free / 2);
  footer(c, profile, assets.logo, siteHost, align, true);

  return {
    omitted: allMetrics.slice(chosen.metrics.length).map((f) => f.label),
    scale: chosen.s,
  };
}

// ---------------------------------------------------------------------------
// Recursos (foto, logo, fontes)

function loadImage(src: string, crossOrigin: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Não foi possível carregar ${src}`));
    img.src = src;
  });
}

/**
 * Foto que o canvas possa exportar. Primeiro direto (o bucket do Supabase
 * libera CORS); se a origem não liberar (Câmara, Senado, ALECE), pelo
 * otimizador de imagens do próprio Next — mesmo domínio, e as mesmas
 * origens já permitidas em next.config. Sem foto utilizável, devolve null.
 */
export async function loadSharePhoto(url: string | null): Promise<HTMLImageElement | null> {
  if (!url) return null;
  try {
    return await loadImage(url, true);
  } catch {
    if (!/^https?:\/\//.test(url)) return null;
    try {
      return await loadImage(`/_next/image?url=${encodeURIComponent(url)}&w=384&q=75`, false);
    } catch {
      return null;
    }
  }
}

export async function loadShareAssets(photoUrl: string | null): Promise<ShareAssets> {
  const root = getComputedStyle(document.documentElement);
  const fonts = {
    heading: root.getPropertyValue('--font-poppins').trim() || 'sans-serif',
    body: root.getPropertyValue('--font-montserrat').trim() || 'sans-serif',
  };
  // Garante as fontes carregadas antes de medir texto no canvas.
  await Promise.all(
    ['600', '700', '800'].map((w) => document.fonts.load(`${w} 40px ${fonts.heading}`).catch(() => [])),
  );
  await Promise.all(['500', '600', '700', '800', '900'].map((w) => document.fonts.load(`${w} 40px ${fonts.body}`).catch(() => [])));

  const [photo, logo] = await Promise.all([
    loadSharePhoto(photoUrl),
    loadImage('/votus_name.png', false).catch(() => null),
  ]);

  return { photo, logo, fonts };
}

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível gerar a imagem.'))), 'image/png');
  });
}
