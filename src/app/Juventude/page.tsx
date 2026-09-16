import type { Metadata } from 'next';
import JuventudeClient from './JuventudeClient';

export const metadata: Metadata = {
  title: 'Juventude em Pauta',
  description:
    'Conteúdo político voltado para jovens: pautas, oportunidades e informações sobre participação na vida pública.',
  alternates: { canonical: '/Juventude' },
};

export default function JuventudePage() {
  return <JuventudeClient />;
}
