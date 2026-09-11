'use client';

import SantinhoPreview, { type SantinhoCandidato } from '@/components/SantinhoPreview';

const CANDIDATOS_EXEMPLO: SantinhoCandidato[] = [
  { cargo: 'Deputado Federal', numero: '1234' },
  { cargo: 'Deputado Federal', numero: '5678' },
  { cargo: 'Deputado Federal', numero: '9012' },
  { cargo: 'Deputado Federal', numero: '3456' },
  { cargo: 'Deputado Federal', numero: '7890' },
  { cargo: 'Deputado Federal', numero: '2468' },
];

export default function SantinhoPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f3ede2] p-6">
      <SantinhoPreview candidatos={CANDIDATOS_EXEMPLO} />
    </main>
  );
}
