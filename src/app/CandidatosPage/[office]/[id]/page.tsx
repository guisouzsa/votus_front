import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CandidatoDetailClient from './CandidatoDetailClient';
import { CANDIDATE_OFFICES, getCandidate, isCandidateOfficeSlug } from '@/services/candidatesService';

type Params = { office: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { office, id } = await params;

  if (!isCandidateOfficeSlug(office)) {
    return { title: 'Candidato' };
  }

  try {
    const candidato = await getCandidate(office, id);

    return {
      title: candidato.ballot_name,
      description: `Perfil de ${candidato.ballot_name}${candidato.party.acronym ? ` (${candidato.party.acronym})` : ''}, candidato(a) a ${CANDIDATE_OFFICES[office].label} nas eleições de 2026 no Ceará.`,
      alternates: { canonical: `/CandidatosPage/${office}/${id}` },
    };
  } catch {
    return {
      title: 'Candidato',
      alternates: { canonical: `/CandidatosPage/${office}/${id}` },
    };
  }
}

export default async function CandidatoPage({ params }: { params: Promise<Params> }) {
  const { office } = await params;

  if (!isCandidateOfficeSlug(office)) {
    notFound();
  }

  return <CandidatoDetailClient office={office} />;
}
