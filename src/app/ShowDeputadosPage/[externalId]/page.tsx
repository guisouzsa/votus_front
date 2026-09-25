import type { Metadata } from 'next';
import { cache } from 'react';
import { getDeputado } from '@/services/deputadosService';
import ShowDeputadosPageClient from './ShowDeputadosPageClient';

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

const carregar = cache((externalId: string) => getDeputado(externalId));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { externalId } = await params;

  try {
    const deputado = await carregar(externalId);

    return {
      title: deputado.parliamentary_name,
      description: `Perfil de ${deputado.parliamentary_name}${deputado.party ? ` (${deputado.party})` : ''}: mandato, comissões, proposições e Efetividade Legislativa na Câmara dos Deputados.`,
      alternates: { canonical: `/ShowDeputadosPage/${externalId}` },
    };
  } catch {
    return {
      title: 'Deputado',
      alternates: { canonical: `/ShowDeputadosPage/${externalId}` },
    };
  }
}

export default async function ShowDeputadosPage({ params }: { params: Promise<Params> }) {
  const { externalId } = await params;
  const initialData = await carregar(externalId).catch(() => undefined);

  return <ShowDeputadosPageClient initialData={initialData} />;
}
