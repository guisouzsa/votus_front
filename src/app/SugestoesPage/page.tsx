import type { Metadata } from 'next';
import SugestoesPageClient from './SugestoesPageClient';

export const metadata: Metadata = {
  title: 'Sugestões',
  description: 'Envie sugestões e feedback anônimos para ajudar a melhorar o Votus.',
  alternates: { canonical: '/SugestoesPage' },
};

export default function SugestoesPage() {
  return <SugestoesPageClient />;
}
