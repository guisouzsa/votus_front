import type { Metadata } from 'next';
import SenadoresPageClient from './SenadoresPageClient';

export const metadata: Metadata = {
  title: 'Senadores',
  description:
    'Consulte os senadores do Ceará: partido, situação do mandato, votações, proposições e Efetividade Legislativa.',
  alternates: { canonical: '/SenadoresPage' },
};

export default function SenadoresPage() {
  return <SenadoresPageClient />;
}
