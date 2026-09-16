import type { Metadata } from 'next';
import ExplicacoesPageClient from './ExplicacoesPageClient';

export const metadata: Metadata = {
  title: 'Cargos',
  description:
    'Entenda os principais cargos políticos do Brasil, suas atribuições e como eles se relacionam entre si.',
  alternates: { canonical: '/ExplicacoesPage' },
};

export default function ExplicacoesPage() {
  return <ExplicacoesPageClient />;
}
