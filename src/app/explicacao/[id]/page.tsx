import type { Metadata } from "next";
import { getExplanation } from "@/services/explanationService";
import ExplicacaoDetailClient from "./ExplicacaoDetailClient";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const explicacao = await getExplanation(id);

    return {
      title: explicacao.question_title,
      description: explicacao.summary ?? `Entenda: ${explicacao.title}`,
      alternates: { canonical: `/explicacao/${id}` },
    };
  } catch {
    return {
      title: "Você sabe?",
      alternates: { canonical: `/explicacao/${id}` },
    };
  }
}

export default function ExplicacaoDetailPage() {
  return <ExplicacaoDetailClient />;
}
