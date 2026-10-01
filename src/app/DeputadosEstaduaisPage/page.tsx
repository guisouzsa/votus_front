import type { Metadata } from 'next';
import DeputadosEstaduaisPageClient from './DeputadosEstaduaisPageClient';
import { getStateDeputies } from '@/services/stateDeputiesService';

export const metadata: Metadata = {
  title: 'Deputados Estaduais',
  description:
    'Consulte os deputados estaduais do Ceará (Assembleia Legislativa do Ceará): partido, situação do mandato, votações, proposições e Efetividade Legislativa.',
  alternates: { canonical: '/DeputadosEstaduaisPage' },
};

// ISR: mesmo padrão de DeputadosPage/SenadoresPage — ver comentário lá.
export const revalidate = 60;

export default async function DeputadosEstaduaisPage() {
  const initialData = await getStateDeputies({ page: 1 }).catch(() => undefined);

  return <DeputadosEstaduaisPageClient initialData={initialData} />;
}
