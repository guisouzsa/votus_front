import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import CandidatoDetailClient from './CandidatoDetailClient';
import {
  CANDIDATE_OFFICES,
  getCandidate,
  isCandidateOfficeSlug,
  type CandidateOfficeSlug,
} from '@/services/candidatesService';

type Params = { office: string; id: string };

// Uma única busca por renderização, compartilhada entre generateMetadata e a
// página (cache do React) — e repassada ao client como initialData, pra ele
// não buscar o mesmo item de novo (ver useSsrDetail).
// revalidate: a página fica em cache na Vercel e é regenerada em segundo
// plano a cada 60s, em vez de esperar o backend a cada visita.
export const revalidate = 60;

// Lista vazia = nenhum perfil gerado no build; cada um é gerado na primeira
// visita e daí em diante servido do cache (ISR). Sem isso a rota ficava
// 100% dinâmica e todo acesso esperava o backend.
export async function generateStaticParams() {
  return [];
}

const carregar = cache((office: CandidateOfficeSlug, id: string) => getCandidate(office, id));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { office, id } = await params;

  if (!isCandidateOfficeSlug(office)) {
    return { title: 'Candidato' };
  }

  try {
    const candidato = await carregar(office, id);

    return {
      title: candidato.ballot_name,
      description: `Perfil de ${candidato.ballot_name}${candidato.party.acronym ? ` (${candidato.party.acronym})` : ''}, candidato(a) a ${CANDIDATE_OFFICES[office].label} nas eleições de 2026 ${CANDIDATE_OFFICES[office].regiao}.`,
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
  const { office, id } = await params;

  if (!isCandidateOfficeSlug(office)) {
    notFound();
  }

  const initialData = await carregar(office, id).catch(() => undefined);

  return <CandidatoDetailClient office={office} initialData={initialData} />;
}
