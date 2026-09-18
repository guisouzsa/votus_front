import type { Metadata } from 'next';
import DeputadosPageClient from './DeputadosPageClient';
import { getDeputados } from '@/services/deputadosService';

export const metadata: Metadata = {
  title: 'Deputados',
  description:
    'Consulte os deputados federais do Ceará: partido, situação do mandato, votações, proposições e Efetividade Legislativa.',
  alternates: { canonical: '/DeputadosPage' },
};

// Sem isso, o Next.js gera essa página como estática no build — os dados
// buscados abaixo ficariam congelados no HTML até o próximo deploy, em vez
// de refletir o banco a cada visita.
export const dynamic = 'force-dynamic';

export default async function DeputadosPage() {
  // Busca a primeira página já no servidor — sem isso, a tela chegava vazia
  // no navegador e só então disparava a chamada à API, deixando a demora
  // do backend totalmente visível pro usuário. Se falhar aqui, sem
  // problema: o client faz o fetch normal do jeito que já fazia.
  const initialData = await getDeputados({ page: 1 }).catch(() => undefined);

  return <DeputadosPageClient initialData={initialData} />;
}
