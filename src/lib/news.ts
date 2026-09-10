import type { NewsArticleApi } from "@/services/types";

export type NewsSource = {
  name: string;
  logoUrl?: string;
};

export type NewsArticle = {
  id: string;
  category?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  source?: NewsSource;
  publishedAt?: string;
  content?: string;
  url?: string;
};

const CATEGORY_GRADIENTS = [
  "bg-linear-to-br from-brasil-blue to-blue-400",
  "bg-linear-to-br from-brasil-green to-emerald-400",
  "bg-linear-to-br from-brasil-gold to-amber-400",
  "bg-linear-to-br from-rose-300 to-brick",
  "bg-linear-to-br from-stone-300 to-stone-500",
  "bg-linear-to-br from-brasil-green-deep to-brasil-green",
  "bg-linear-to-br from-amber-200 to-brasil-gold",
  "bg-linear-to-br from-blue-300 to-brasil-blue",
];

export function categoryGradient(category?: string | null): string {
  if (!category) return CATEGORY_GRADIENTS[0];

  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }

  return CATEGORY_GRADIENTS[hash % CATEGORY_GRADIENTS.length];
}

function formatPublishedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

// As notícias vêm raspadas/geradas por IA e às vezes trazem lixo de formatação:
// espaços não separáveis, asteriscos soltos (marcações de markdown ou notas de
// rodapé do tipo "*Com informações de...") e linhas em branco repetidas.
function sanitizeArticleText(text: string): string {
  return text
    .replace(/ /g, " ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|\s)\*(\S(?:.*?\S)?)\*(?=\s|$)/g, "$1$2")
    .replace(/^\s*\*\s*/gm, "")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface ArticleParagraph {
  text: string;
  isQuote: boolean;
}

// A raspagem traz uma linha por sentença/citação. Ler assim fica truncado e
// cheio de quebras — aqui juntamos as linhas narrativas em parágrafos
// corridos e mantemos só as falas entre aspas como blocos de citação.
export function formatArticleParagraphs(content: string): ArticleParagraph[] {
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const paragraphs: ArticleParagraph[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let current: string[] = [];

    const flush = () => {
      if (current.length > 0) {
        paragraphs.push({ text: current.join(" "), isQuote: false });
        current = [];
      }
    };

    for (const line of lines) {
      if (/^[“"]/.test(line)) {
        flush();
        paragraphs.push({ text: line, isQuote: true });
      } else {
        current.push(line);
      }
    }

    flush();
  }

  return paragraphs;
}

export function mapApiNewsToArticle(item: NewsArticleApi): NewsArticle {
  const description = item.ai_summary ?? item.original_summary ?? undefined;
  const content = item.original_summary ?? item.ai_summary ?? undefined;

  return {
    id: String(item.id),
    category: item.category ?? undefined,
    title: item.title,
    description: description ? sanitizeArticleText(description) : undefined,
    imageUrl: item.image_url ?? undefined,
    source: item.source ? { name: item.source, logoUrl: item.site_logo_url ?? undefined } : undefined,
    publishedAt: item.published_at ? formatPublishedDate(item.published_at) : undefined,
    content: content ? sanitizeArticleText(content) : undefined,
    url: item.url ?? undefined,
  };
}
