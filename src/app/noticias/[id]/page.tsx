import type { Metadata } from "next";
import { cache } from "react";
import { getNewsItem } from "@/services/newsService";
import NoticiaPageClient from "./NoticiaPageClient";

type Params = { id: string };

// Uma única busca por renderização, compartilhada entre generateMetadata e a
// página (cache do React) — e repassada ao client como initialData, pra ele
// não buscar o mesmo item de novo (ver useSsrDetail).
// revalidate: a página fica em cache na Vercel e é regenerada em segundo
// plano a cada 60s, em vez de esperar o backend a cada visita.
export const revalidate = 60;

// Lista vazia = nenhum perfil gerado no build; cada um é gerado na primeira
// visita e daí em diante servido do cache (ISR). Sem isso a rota ficava
// 100% dinâmica e todo acesso esperava o backend.
export async function generateStaticParams() {
  return [];
}

const carregar = cache((id: string) => getNewsItem(id));

function truncar(texto: string, limite: number): string {
  return texto.length > limite ? `${texto.slice(0, limite - 1).trimEnd()}…` : texto;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const noticia = await carregar(id);
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

export default async function NoticiaPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const initialData = await carregar(id).catch(() => undefined);

  return <NoticiaPageClient initialData={initialData} />;
}
