import type { Metadata } from 'next';
import { cache } from 'react';
import { getDeputadoEstadual } from '@/services/deputadosEstaduaisService';
import ShowDeputadosEstaduaisPageClient from './ShowDeputadosEstaduaisPageClient';

type Params = { slug: string };

export const revalidate = 60;

// Lista vazia = nenhum perfil gerado no build; cada um é gerado na primeira
// visita e daí em diante servido do cache (ISR) — mesmo padrão de
// ShowDeputadosPage.
export async function generateStaticParams() {
  return [];
}

const carregar = cache((slug: string) => getDeputadoEstadual(slug));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const deputado = await carregar(slug);

    return {
      title: deputado.parliamentary_name,
      description: `Perfil de ${deputado.parliamentary_name}${deputado.party ? ` (${deputado.party})` : ''}: mandato, comissões, proposições e Efetividade Legislativa na Assembleia Legislativa do Ceará.`,
      alternates: { canonical: `/ShowDeputadosEstaduaisPage/${slug}` },
    };
  } catch {
    return {
      title: 'Deputado Estadual',
      alternates: { canonical: `/ShowDeputadosEstaduaisPage/${slug}` },
    };
  }
}

export default async function ShowDeputadosEstaduaisPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const initialData = await carregar(slug).catch(() => undefined);

  return <ShowDeputadosEstaduaisPageClient initialData={initialData} />;
}
