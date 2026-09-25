import type { Metadata } from 'next';
import DeputadosPageClient from './DeputadosPageClient';
import { getDeputados } from '@/services/deputadosService';

export const metadata: Metadata = {
  title: 'Deputados',
  description:
    'Consulte os deputados federais do Ceará: partido, situação do mandato, votações, proposições e Efetividade Legislativa.',
  alternates: { canonical: '/DeputadosPage' },
};

// ISR: a página fica em cache na Vercel e é regenerada em segundo plano no
// máximo a cada 60s. Antes era force-dynamic (fetch sempre no-store), então
// TODA visita esperava o backend responder antes de receber qualquer HTML —
// a demora do Render/Supabase ficava inteira na frente do usuário. Os dados
// continuam atualizados (no máximo 60s de defasagem), sem ficarem
// congelados até o próximo deploy como no modo estático puro.
export const revalidate = 60;

export default async function DeputadosPage() {
  // Busca a primeira página já no servidor — sem isso, a tela chegava vazia
  // no navegador e só então disparava a chamada à API, deixando a demora
  // do backend totalmente visível pro usuário. Se falhar aqui, sem
  // problema: o client faz o fetch normal do jeito que já fazia.
  const initialData = await getDeputados({ page: 1 }).catch(() => undefined);

  return <DeputadosPageClient initialData={initialData} />;
}
