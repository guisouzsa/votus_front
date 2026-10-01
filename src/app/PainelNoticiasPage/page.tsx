import type { Metadata } from 'next';
import PainelNoticiasClient from './PainelNoticiasClient';

export const metadata: Metadata = {
  title: 'Notícias',
  description:
    'Últimas notícias de política resumidas por IA, organizadas por categoria e relevância, com fontes como a Agência Brasil.',
  alternates: { canonical: '/PainelNoticiasPage' },
};

export default function PainelNoticiasPage() {
  return <PainelNoticiasClient />;
}
