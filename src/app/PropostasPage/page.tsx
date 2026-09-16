import type { Metadata } from 'next';
import PropostasPageClient from './PropostasPageClient';

export const metadata: Metadata = {
  title: 'Propostas',
  description:
    'Cadastre uma proposta legislativa e acompanhe propostas de outras pessoas, com votos e comentários da comunidade.',
  alternates: { canonical: '/PropostasPage' },
};

export default function PropostasPage() {
  return <PropostasPageClient />;
}
