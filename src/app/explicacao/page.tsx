import type { Metadata } from 'next';
import ExplicacaoPageClient from './ExplicacaoPageClient';

export const metadata: Metadata = {
  title: 'Você sabe?',
  description:
    'Entenda conceitos importantes de política e cidadania de forma simples, e teste o que aprendeu com um quiz.',
  alternates: { canonical: '/explicacao' },
};

export default function ExplicacaoPage() {
  return <ExplicacaoPageClient />;
}
