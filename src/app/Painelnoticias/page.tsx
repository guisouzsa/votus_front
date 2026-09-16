import type { Metadata } from 'next';
import PainelnoticiasClient from './PainelnoticiasClient';

export const metadata: Metadata = {
  title: 'Notícias',
  description:
    'Últimas notícias de política resumidas por IA, organizadas por categoria e relevância, com fontes como a Agência Brasil.',
  alternates: { canonical: '/Painelnoticias' },
};

export default function PainelnoticiasPage() {
  return <PainelnoticiasClient />;
}
