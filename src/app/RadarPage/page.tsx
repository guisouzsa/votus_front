import type { Metadata } from 'next';
import RadarPageClient from './RadarPageClient';
import { getRadarOverview } from '@/services/radarService';

export const metadata: Metadata = {
  title: 'Radar do Brasil',
  description:
    'Mapa das 27 unidades federativas com indicadores do IBGE e os temas mais frequentes nas proposições dos parlamentares de cada estado, com dados oficiais da Câmara e do Senado.',
  alternates: { canonical: '/RadarPage' },
};

// ISR de 60s — ver o comentário em DeputadosPage/page.tsx.
export const revalidate = 60;

export default async function RadarPage() {
  const initialData = await getRadarOverview().catch(() => undefined);

  return <RadarPageClient initialData={initialData} />;
}
