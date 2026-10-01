import type { Metadata } from 'next';
import PresidentePageClient from './PresidentePageClient';
import { getPresidents } from '@/services/executivesService';

export const metadata: Metadata = {
  title: 'Presidência da República',
  description: 'Consulte o presidente e vice-presidente da República em exercício: mandato e ações registradas.',
  alternates: { canonical: '/PresidentePage' },
};

export const revalidate = 60;

export default async function PresidentePage() {
  const initialData = await getPresidents().catch(() => undefined);

  return <PresidentePageClient initialData={initialData} />;
}
