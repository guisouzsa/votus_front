import type { Metadata } from 'next';
import { getSenador } from '@/services/senadoresService';
import ShowSenadoresPageClient from './ShowSenadoresPageClient';

type Params = { externalId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { externalId } = await params;

  try {
    const senador = await getSenador(externalId);

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

export default function ShowSenadoresPage() {
  return <ShowSenadoresPageClient />;
}
