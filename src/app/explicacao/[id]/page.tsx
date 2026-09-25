import type { Metadata } from "next";
import { cache } from "react";
import { getExplanation } from "@/services/explanationService";
import ExplicacaoDetailClient from "./ExplicacaoDetailClient";

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

const carregar = cache((id: string) => getExplanation(id));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const explicacao = await carregar(id);

    return {
      title: explicacao.question_title,
      description: explicacao.summary ?? `Entenda: ${explicacao.title}`,
      alternates: { canonical: `/explicacao/${id}` },
    };
  } catch {
    return {
      title: "Você Sabia?",
      alternates: { canonical: `/explicacao/${id}` },
    };
  }
}

export default async function ExplicacaoDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const initialData = await carregar(id).catch(() => undefined);

  return <ExplicacaoDetailClient initialData={initialData} />;
}
