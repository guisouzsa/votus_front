import type { Metadata } from 'next';
import ComparadorPropostasClient from './ComparadorPropostasClient';
import { getProposalIndex } from '@/services/proposalComparisonService';

export const metadata: Metadata = {
  title: 'Compare as propostas para Presidente',
  description:
    'Compare, tema a tema, as propostas dos planos de governo dos candidatos à Presidência em 2026, com o trecho original e o link da fonte oficial.',
  alternates: { canonical: '/ComparadorPropostasPage' },
};

// ISR de 60s — ver o comentário em DeputadosPage/page.tsx.
export const revalidate = 60;

export default async function ComparadorPropostasPage() {
  // Busca o índice já no servidor: a página chega com as propostas em vez de
  // só o esqueleto de carregamento.
  const initialIndex = await getProposalIndex().catch(() => undefined);

  return <ComparadorPropostasClient initialIndex={initialIndex} />;
}
