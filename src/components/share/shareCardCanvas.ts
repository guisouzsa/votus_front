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
  /** Uma cor = fundo sólido; duas = gradiente diagonal discreto. */
  colors: [string] | [string, string];
  text: string;
  muted: string;
  /** Fundo claro: usa a logo colorida; escuro: o nome em branco. */
  light: boolean;
}

// Cores da identidade do Votus (globals.css) e tons próximos.
export const SHARE_BACKGROUNDS: ShareBackground[] = [
  { id: 'creme', label: 'Creme', colors: ['#FDF8EE'], text: '#22201b', muted: '#6b6255', light: true },
  { id: 'branco', label: 'Branco', colors: ['#FFFFFF'], text: '#22201b', muted: '#6b6255', light: true },
  { id: 'verde', label: 'Verde', colors: ['#1B623A'], text: '#FFFFFF', muted: '#d4e6da', light: false },
  { id: 'vinho', label: 'Vinho', colors: ['#8D0801'], text: '#FFFFFF', muted: '#f3d6d4', light: false },
  { id: 'grad-floresta', label: 'Floresta', colors: ['#1B623A', '#0F3D22'], text: '#FFFFFF', muted: '#d4e6da', light: false },
  { id: 'grad-por-do-sol', label: 'Pôr do sol', colors: ['#B23A0A', '#8D0801'], text: '#FFFFFF', muted: '#f8ddd3', light: false },
  { id: 'grad-areia', label: 'Areia', colors: ['#FDF8EE', '#EDDBBA'], text: '#22201b', muted: '#6b5a3d', light: true },
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
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
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
    roundRect(ctx, x, y, w, h, Math.min(w, h) * 0.12);
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

/** Cargo + campos de identificação marcados (partido, estado, legislatura...). */
function subtitle(profile: ShareProfile, selected: Set<string>): string {
  return [profile.role, ...profile.fields.filter((f) => f.group === 'identificacao' && selected.has(f.id)).map((f) => f.value)].join(
    ' · ',
  );
}

/** Um dado: rótulo pequeno, valor em destaque e contexto. Devolve a altura. */
function metric(c: Ctx, f: ShareField, x: number, y: number, width: number, align: CanvasTextAlign, draw: boolean): number {
  let h = 0;
  font(c, 700, 26, 'body');
  h += textBlock(c, [f.label.toUpperCase()], x, y, 34 * c.s, align, c.accent, draw);
  h += 6 * c.s;
  font(c, 800, 54, 'heading');
  h += textBlock(c, wrap(c.ctx, f.value, width, 2), x, y + h, 64 * c.s, align, c.bg.text, draw);
  if (f.detail) {
    h += 4 * c.s;
    font(c, 500, 27, 'body');
    h += textBlock(c, wrap(c.ctx, f.detail, width, 2), x, y + h, 36 * c.s, align, c.bg.muted, draw);
  }
  return h;
}

function drawBackground(c: Ctx) {
  const { ctx, W, H, bg } = c;
  if (bg.colors.length === 2) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, bg.colors[0]);
    g.addColorStop(1, bg.colors[1]);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = bg.colors[0];
  }
  ctx.fillRect(0, 0, W, H);
}

/** Logo (fundo claro) ou o nome em branco (fundo escuro). Devolve a altura. */
function brand(c: Ctx, logo: HTMLImageElement | null, x: number, y: number, align: 'left' | 'center', draw: boolean): number {
  const h = 52 * c.s;
  if (!draw) return h;
  if (c.bg.light && logo) {
    const w = (logo.naturalWidth / logo.naturalHeight) * h;
    c.ctx.drawImage(logo, align === 'center' ? x - w / 2 : x, y, w, h);
  } else {
    font(c, 900, 50, 'heading');
    textBlock(c, ['VOTUS'], x, y, h, align, c.bg.text, true);
  }
  return h;
}

function footer(c: Ctx, profile: ShareProfile, siteHost: string, align: CanvasTextAlign, draw: boolean): number {
  const date = new Date().toLocaleDateString('pt-BR');
  const x = align === 'center' ? c.W / 2 : c.pad;
  const width = c.W - c.pad * 2;
  font(c, 500, 24, 'body');
  const lines = wrap(c.ctx, `Fonte: ${profile.source}, via Votus · gerado em ${date}`, width, 2);
  const h = lines.length * 32 * c.s + 8 * c.s + 32 * c.s;
  if (draw) {
    const y = c.H - c.pad - h;
    textBlock(c, lines, x, y, 32 * c.s, align, c.bg.muted, true);
    font(c, 700, 24, 'body');
    textBlock(c, [siteHost], x, y + lines.length * 32 * c.s + 8 * c.s, 32 * c.s, align, c.bg.text, true);
  }
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
): number {
  const { pad, W, s } = c;
  const width = W - pad * 2;
  const photo = design.showPhoto ? assets.photo : null;
  const centered = design.template === 'centro';
  let y = pad;

  y += brand(c, assets.logo, centered ? W / 2 : pad, y, centered ? 'center' : 'left', draw) + 56 * s;

  if (centered) {
    if (photo) {
      const size = 280 * s;
      if (draw) drawPhoto(c.ctx, photo, W / 2 - size / 2, y, size, size, true);
      y += size + 40 * s;
    }
    font(c, 800, 68, 'heading');
    y += textBlock(c, wrap(c.ctx, profile.name, width, 2), W / 2, y, 78 * s, 'center', c.bg.text, draw) + 12 * s;
    font(c, 600, 32, 'body');
    y += textBlock(c, wrap(c.ctx, subtitle(profile, selected), width, 2), W / 2, y, 42 * s, 'center', c.bg.muted, draw);
  } else {
    const size = photo ? 230 * s : 0;
    const textX = photo ? pad + size + 40 * s : pad;
    const textW = width - (photo ? size + 40 * s : 0);
    font(c, 800, 64, 'heading');
    const nameLines = wrap(c.ctx, profile.name, textW, 3);
    font(c, 600, 30, 'body');
    const subLines = wrap(c.ctx, subtitle(profile, selected), textW, 3);
    const textH = nameLines.length * 74 * s + 12 * s + subLines.length * 40 * s;
    const blockH = Math.max(size, textH);
    const textY = y + (blockH - textH) / 2;

    if (photo && draw) drawPhoto(c.ctx, photo, pad, y, size, size, false);
    font(c, 800, 64, 'heading');
    textBlock(c, nameLines, textX, textY, 74 * s, 'left', c.bg.text, draw);
    font(c, 600, 30, 'body');
    textBlock(c, subLines, textX, textY + nameLines.length * 74 * s + 12 * s, 40 * s, 'left', c.bg.muted, draw);
    y += blockH;
  }

  if (metrics.length === 0) return y;

  // Separador curto na cor de destaque entre identificação e dados.
  y += 56 * s;
  if (draw) {
    c.ctx.fillStyle = c.accent;
    const lineW = 96 * s;
    c.ctx.fillRect(centered ? W / 2 - lineW / 2 : pad, y, lineW, 6 * s);
  }
  y += 6 * s + 48 * s;

  // Centralizado com 3+ dados: duas colunas; senão, uma lista.
  const twoCols = centered && metrics.length >= 3;
  if (twoCols) {
    const gap = 56 * s;
    const colW = (width - gap) / 2;
    for (let i = 0; i < metrics.length; i += 2) {
      const pair = metrics.slice(i, i + 2);
      const heights = pair.map((m, k) =>
        metric(c, m, pad + k * (colW + gap) + colW / 2, y, colW, 'center', draw),
      );
      y += Math.max(...heights) + 48 * s;
    }
    return y - 48 * s;
  }

  metrics.forEach((m, i) => {
    if (i > 0) {
      if (draw) {
        c.ctx.fillStyle = c.bg.muted;
        c.ctx.globalAlpha = 0.35;
        c.ctx.fillRect(centered ? W / 2 - width / 4 : pad, y, centered ? width / 2 : width, 2 * s);
        c.ctx.globalAlpha = 1;
      }
      y += 2 * s + 36 * s;
    }
    y += metric(c, m, centered ? W / 2 : pad, y, width, centered ? 'center' : 'left', draw);
    y += 36 * s;
  });

  return y - 36 * s;
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
  const allMetrics = profile.fields.filter(
    (f) => selected.has(f.id) && f.group !== 'identificacao',
  );
  const bg = backgroundOf(design);
  const base: Omit<Ctx, 's'> = { ctx, W, H, pad: 88, bg, accent: effectiveAccent(design), fonts: assets.fonts };

  let chosen = { s: 1, metrics: allMetrics };
  search: for (let count = allMetrics.length; count >= 0; count--) {
    for (const s of [1, 0.92, 0.85]) {
      const c = { ...base, s };
      const metrics = allMetrics.slice(0, count);
      const used = compose(c, profile, metrics, selected, design, assets, false);
      const foot = footer(c, profile, siteHost, 'left', false);
      if (used + 48 * s <= H - c.pad - foot) {
        chosen = { s, metrics };
        break search;
      }
    }
    chosen = { s: 0.85, metrics: allMetrics.slice(0, Math.max(0, count - 1)) };
  }

  const c = { ...base, s: chosen.s };
  drawBackground(c);
  compose(c, profile, chosen.metrics, selected, design, assets, true);
  footer(c, profile, siteHost, design.template === 'centro' ? 'center' : 'left', true);

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
  await Promise.all(['500', '600', '700', '900'].map((w) => document.fonts.load(`${w} 40px ${fonts.body}`).catch(() => [])));

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
