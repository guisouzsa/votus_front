import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CandidatosListClient from './CandidatosListClient';
import { CANDIDATE_OFFICES, getCandidates, isCandidateOfficeSlug } from '@/services/candidatesService';

type Params = { office: string };

// ISR de 60s — ver o comentário em DeputadosPage/page.tsx.
export const revalidate = 60;

export async function generateStaticParams() {
  return Object.keys(CANDIDATE_OFFICES).map((office) => ({ office }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { office } = await params;

  if (!isCandidateOfficeSlug(office)) {
    return { title: 'Candidatos 2026' };
  }

  const { label, regiao } = CANDIDATE_OFFICES[office];

  return {
    title: `Candidatos 2026 a ${label}`,
    description: `Conheça os candidatos a ${label} nas eleições de 2026 ${regiao}.`,
    alternates: { canonical: `/CandidatosPage/${office}` },
  };
}

export default async function CandidatosPageRoute({ params }: { params: Promise<Params> }) {
  const { office } = await params;

  if (!isCandidateOfficeSlug(office)) {
    notFound();
  }

  // Busca a primeira página já no servidor — ver o mesmo comentário em
  // DeputadosPage/page.tsx. Só Presidente é eleição nacional (UF "BR"); os
  // demais cargos ficam restritos ao Ceará nesta branch — a navegação por
  // região/estado do país inteiro ainda está em teste noutra branch.
  const initialData = await getCandidates(office, 1, office === 'presidente' ? {} : { state: 'CE' }).catch(
    () => undefined
  );

  return <CandidatosListClient office={office} initialData={initialData} />;
}
