import type { Metadata } from 'next';
import DeputadosEstaduaisPageClient from './DeputadosEstaduaisPageClient';
import { getAllStateDeputies } from '@/services/stateDeputiesService';

export const metadata: Metadata = {
  title: 'Deputados Estaduais',
  description:
    'Consulte os deputados estaduais do Ceará (Assembleia Legislativa do Ceará): partido, situação do mandato, votações, proposições e Efetividade Legislativa.',
  alternates: { canonical: '/DeputadosEstaduaisPage' },
};

// ISR: mesmo padrão de DeputadosPage/SenadoresPage — ver comentário lá.
export const revalidate = 60;

export default async function DeputadosEstaduaisPage() {
  // Busca o time inteiro (todas as páginas da API) — ver comentário em
  // getAllStateDeputies: são 52 deputados, mas a API pagina de 50 em 50.
  const initialData = await getAllStateDeputies().catch(() => undefined);

  return <DeputadosEstaduaisPageClient initialData={initialData} />;
}
