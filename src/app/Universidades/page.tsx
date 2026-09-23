import type { Metadata } from 'next';
import UniversidadesClient from './UniversidadesClient';
import { getCourseOfferings } from '@/services/universitiesService';

export const metadata: Metadata = {
  title: 'Universidades',
  description: 'Encontre universidades e cursos pelo Ceará: estado, município, curso e modalidade.',
  alternates: { canonical: '/Universidades' },
};

// Sem isso, o Next.js gera essa página como estática no build — ver o mesmo
// comentário em DeputadosPage/page.tsx.
export const dynamic = 'force-dynamic';

const ESTADO_PADRAO = 'CE';

export default async function UniversidadesPage() {
  // Busca a primeira página já filtrada pro Ceará no servidor — ver o mesmo
  // comentário em DeputadosPage/page.tsx. Sem filtro de estado, a busca
  // varreria ofertas de curso do Brasil inteiro.
  const initialData = await getCourseOfferings({ state: ESTADO_PADRAO, page: 1 }).catch(() => undefined);

  return <UniversidadesClient initialData={initialData} estadoPadrao={ESTADO_PADRAO} />;
}
