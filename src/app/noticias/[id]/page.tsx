import type { Metadata } from "next";
import { getNewsItem } from "@/services/newsService";
import NoticiaPageClient from "./NoticiaPageClient";

type Params = { id: string };

function truncar(texto: string, limite: number): string {
  return texto.length > limite ? `${texto.slice(0, limite - 1).trimEnd()}…` : texto;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const noticia = await getNewsItem(id);
    const resumo = noticia.ai_summary || noticia.original_summary || "";
    const description = resumo ? truncar(resumo, 160) : `Notícia publicada em ${noticia.source ?? "Votus"}.`;

    return {
      title: noticia.title,
      description,
      alternates: { canonical: `/noticias/${id}` },
      openGraph: noticia.image_url ? { images: [noticia.image_url] } : undefined,
    };
  } catch {
    return {
      title: "Notícia",
      alternates: { canonical: `/noticias/${id}` },
    };
  }
}

export default function NoticiaPage() {
  return <NoticiaPageClient />;
}
