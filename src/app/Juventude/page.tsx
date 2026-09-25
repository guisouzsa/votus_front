import type { Metadata } from 'next';
import JuventudeClient from './JuventudeClient';
import { getOpportunities, getPublicOpportunities } from '@/services/opportunitiesService';

export const metadata: Metadata = {
  title: 'Juventude em Pauta',
  description:
    'Vagas de emprego e concursos públicos abertos, pensados para quem está entrando no mercado de trabalho.',
  alternates: { canonical: '/Juventude' },
};

// ISR de 60s — ver o comentário em DeputadosPage/page.tsx.
export const revalidate = 60;

export default async function JuventudePage() {
  // Busca a primeira página de cada lista já no servidor — ver o mesmo
  // comentário em DeputadosPage/page.tsx.
  const [initialOpportunities, initialPublicOpportunities] = await Promise.all([
    getOpportunities(1).catch(() => undefined),
    getPublicOpportunities(1).catch(() => undefined),
  ]);

  return (
    <JuventudeClient initialOpportunities={initialOpportunities} initialPublicOpportunities={initialPublicOpportunities} />
  );
}
