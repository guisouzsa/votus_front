import { notFound } from 'next/navigation';
import { CANDIDATE_OFFICES, getCandidates } from '@/services/candidatesService';
import CandidatosListClient from '@/app/CandidatosPage/[office]/CandidatosListClient';

export default async function EmbedCandidatosPage() {
  const office = 'deputado-federal' as const;
  if (!CANDIDATE_OFFICES[office]) notFound();

  const initialData = await getCandidates(office, 1, { state: 'CE' }).catch(() => undefined);
  return <CandidatosListClient office={office} initialData={initialData} embedded />;
}
