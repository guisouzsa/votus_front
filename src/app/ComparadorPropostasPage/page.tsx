import type { Metadata } from 'next';
import ComparadorPropostasClient from './ComparadorPropostasClient';
import { getProposalThemes } from '@/services/proposalComparisonService';

export const metadata: Metadata = {
  title: 'Comparar propostas para Presidente',
  description:
    'Compare, tema a tema, as propostas dos planos de governo dos candidatos à Presidência em 2026, com o trecho e o link da fonte oficial.',
  alternates: { canonical: '/ComparadorPropostasPage' },
};

// ISR de 60s — ver o comentário em DeputadosPage/page.tsx.
export const revalidate = 60;

export default async function ComparadorPropostasPage() {
  const initialThemes = await getProposalThemes()
    .then((response) => response.data)
    .catch(() => undefined);

  return <ComparadorPropostasClient initialThemes={initialThemes} />;
}
