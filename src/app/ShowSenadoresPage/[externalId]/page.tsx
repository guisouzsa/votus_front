import type { Metadata } from 'next';
import { cache } from 'react';
import { getSenador } from '@/services/senadoresService';
import ShowSenadoresPageClient from './ShowSenadoresPageClient';

type Params = { externalId: string };

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

const carregar = cache((externalId: string) => getSenador(externalId));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { externalId } = await params;

  try {
    const senador = await carregar(externalId);

    return {
      title: senador.parliamentary_name,
      description: `Perfil de ${senador.parliamentary_name}${senador.party ? ` (${senador.party})` : ''}: mandato, comissões, proposições e Efetividade Legislativa no Senado Federal.`,
      alternates: { canonical: `/ShowSenadoresPage/${externalId}` },
    };
  } catch {
    return {
      title: 'Senador',
      alternates: { canonical: `/ShowSenadoresPage/${externalId}` },
    };
  }
}

export default async function ShowSenadoresPage({ params }: { params: Promise<Params> }) {
  const { externalId } = await params;
  const initialData = await carregar(externalId).catch(() => undefined);

  return <ShowSenadoresPageClient initialData={initialData} />;
}
