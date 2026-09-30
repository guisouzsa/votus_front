import type { Metadata } from 'next';
import { cache } from 'react';
import { getGovernador } from '@/services/executivesService';
import ShowGovernadoresPageClient from './ShowGovernadoresPageClient';

type Params = { id: string };

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

const carregar = cache((id: string) => getGovernador(id));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const executivo = await carregar(id);

    return {
      title: executivo.display_name,
      description: `Perfil de ${executivo.display_name}: mandato e ações registradas.`,
      alternates: { canonical: `/ShowGovernadoresPage/${id}` },
    };
  } catch {
    return { title: 'Governo do Estado', alternates: { canonical: `/ShowGovernadoresPage/${id}` } };
  }
}

export default async function ShowGovernadoresPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const initialData = await carregar(id).catch(() => undefined);

  return <ShowGovernadoresPageClient initialData={initialData} />;
}
