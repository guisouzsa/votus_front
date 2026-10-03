import type { Metadata } from 'next';
import SantinhoPageClient from './SantinhoPageClient';

export const metadata: Metadata = {
  title: 'Gerador de Cola Eleitoral',
  description:
    'Crie sua cola eleitoral digital com o número dos seus candidatos e baixe o modelo para imprimir.',
  alternates: { canonical: '/SantinhoPage' },
};

export default function SantinhoPage() {
  return <SantinhoPageClient />;
}
