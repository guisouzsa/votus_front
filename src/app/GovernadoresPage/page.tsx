import type { Metadata } from 'next';
import GovernadoresPageClient from './GovernadoresPageClient';
import { getGovernors } from '@/services/executivesService';

export const metadata: Metadata = {
  title: 'Governo do Ceará',
  description: 'Consulte o governador e vice-governador do Ceará em exercício: mandato e ações registradas.',
  alternates: { canonical: '/GovernadoresPage' },
};

export const revalidate = 60;

export default async function GovernadoresPage() {
  const initialData = await getGovernors().catch(() => undefined);

  return <GovernadoresPageClient initialData={initialData} />;
}
