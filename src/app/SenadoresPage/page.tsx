import type { Metadata } from 'next';
import SenadoresPageClient from './SenadoresPageClient';
import { getSenadores } from '@/services/senadoresService';

export const metadata: Metadata = {
  title: 'Senadores',
  description:
    'Consulte os senadores do Ceará: partido, situação do mandato, votações, proposições e Efetividade Legislativa.',
  alternates: { canonical: '/SenadoresPage' },
};

// Sem isso, o Next.js gera essa página como estática no build — ver o
// mesmo comentário em DeputadosPage/page.tsx.
export const dynamic = 'force-dynamic';

export default async function SenadoresPage() {
  // Busca a primeira página já no servidor — ver o mesmo comentário em
  // DeputadosPage/page.tsx.
  const initialData = await getSenadores({ page: 1 }).catch(() => undefined);

  return <SenadoresPageClient initialData={initialData} />;
}
