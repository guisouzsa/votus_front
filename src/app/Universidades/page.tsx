import type { Metadata } from 'next';
import UniversidadesClient from './UniversidadesClient';

export const metadata: Metadata = {
  title: 'Universidades',
  description: 'Conheça oportunidades e informações sobre universidades voltadas para a juventude.',
  alternates: { canonical: '/Universidades' },
};

export default function UniversidadesPage() {
  return <UniversidadesClient />;
}
