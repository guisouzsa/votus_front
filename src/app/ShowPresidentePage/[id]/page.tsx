import type { Metadata } from 'next';
import { cache } from 'react';
import { getPresidente } from '@/services/executivesService';
import ShowPresidentePageClient from './ShowPresidentePageClient';

type Params = { id: string };

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

const carregar = cache((id: string) => getPresidente(id));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const executivo = await carregar(id);

    return {
      title: executivo.display_name,
      description: `Perfil de ${executivo.display_name}: mandato e ações registradas.`,
      alternates: { canonical: `/ShowPresidentePage/${id}` },
    };
  } catch {
    return { title: 'Presidência', alternates: { canonical: `/ShowPresidentePage/${id}` } };
  }
}

export default async function ShowPresidentePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const initialData = await carregar(id).catch(() => undefined);

  return <ShowPresidentePageClient initialData={initialData} />;
}
