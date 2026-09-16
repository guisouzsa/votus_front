import type { Metadata } from 'next';
import DeputadosPageClient from './DeputadosPageClient';

export const metadata: Metadata = {
  title: 'Deputados',
  description:
    'Consulte os deputados federais do Ceará: partido, situação do mandato, votações, proposições e Efetividade Legislativa.',
  alternates: { canonical: '/DeputadosPage' },
};

export default function DeputadosPage() {
  return <DeputadosPageClient />;
}
