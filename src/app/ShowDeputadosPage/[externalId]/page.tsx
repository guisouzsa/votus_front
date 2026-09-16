import type { Metadata } from 'next';
import { getDeputado } from '@/services/deputadosService';
import ShowDeputadosPageClient from './ShowDeputadosPageClient';

type Params = { externalId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { externalId } = await params;

  try {
    const deputado = await getDeputado(externalId);

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

export default function ShowDeputadosPage() {
  return <ShowDeputadosPageClient />;
}
