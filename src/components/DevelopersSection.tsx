'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 5;

interface TeamMember {
  name: string;
  role: string;
  image?: string;
}

const teamMembers: TeamMember[] = [
  // DS3
  { name: 'Marianne Moreira Lima', role: 'Líder da Logística e do Diário de Bordo e Designer', image: '/marianne_moreira_votus.jpg' },
  { name: 'Eva Lohane Costa Cordeiro', role: 'Líder da Logística, do Protótipo e do Pré-projeto', image: '/Eva_lohane_votus.jpg' },
  { name: 'Emanuel Rodrigues Cordeiro Sousa', role: 'Líder do Desenvolvimento e Desenvolvedor Full Stack', image: '/emanuel_sousa_votus.jpg' },
  { name: 'Larissa Felix de Lima', role: 'Desenvolvedora Full Stack', image: '/larissa_felix_votus.jpg' },
  { name: 'Guilherme Rodrigues de Souza', role: 'Desenvolvedor Full Stack', image: '/guilhermejpeg.jpeg' },
  { name: 'Pedro Henrique de Oliveira Costa', role: 'Desenvolvedor Backend', image: '/pedro_oliveira_votus.jpg' },
  // Infor2 + demais integrantes
  { name: 'Ivens de Araújo Silva', role: 'Designer', image: '/ivens_araujo_votus.jpeg' },
  { name: 'Dafny Vitória Sabino Almeida', role: 'Desenvolvedora Full Stack e Designer', image: '/dafny_almeida_votus.jpg' },
  { name: 'Maria Eduarda Andrade Araújo', role: 'Desenvolvedora Frontend', image: '/maria_eduarda_votus.jpg' },
  { name: 'Gustavo Coutinho', role: 'Desenvolvedor e Pré-projeto', image: '/coutinho.jpeg' },
  { name: 'Kerllon Sousa', role: 'Desenvolvedor Frontend e Designer', image: '/kerllon_sousa_votus.jpg' },
  { name: 'Arielly Vitória', role: 'Pré-projeto e Diário de Bordo', image: '/arielly.jpeg' },
  { name: 'Anna Julia', role: 'Pré-projeto e Diário de Bordo', image: '/julia.jpeg' },
];

const advisor: TeamMember = { name: 'Israely', role: 'Orientadora do projeto', image: '/israely.jpeg' };

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

function MemberPhoto({ member, size = 'md' }: { member: TeamMember; size?: 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false);
  const dimensions = size === 'lg' ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-24 w-24 sm:h-28 sm:w-28';

  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-brasil-green bg-sand shadow-md`}
    >
      {member.image && !failed ? (
        <Image
          src={member.image}
          alt={member.name}
          width={160}
          height={160}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="px-2 text-center text-[10px] font-semibold uppercase leading-tight text-brasil-green/60 sm:text-xs">
          Foto em breve
        </span>
      )}
    </div>
  );
}

function MemberCard({ member, size }: { member: TeamMember; size?: 'md' | 'lg' }) {
  return (
    <div className="flex flex-col items-center text-center">
      <MemberPhoto member={member} size={size} />
      <p className="mt-3 text-sm font-bold leading-snug text-ink sm:text-base">{member.name}</p>
      <p className="mt-1 max-w-[9rem] text-xs leading-snug text-ink-soft sm:max-w-[10rem] sm:text-sm">{member.role}</p>
    </div>
  );
}

function TeamCarousel({ members }: { members: TeamMember[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(members.length / PAGE_SIZE);

  const visible = members.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const goPrev = () => setPage((current) => (current === 0 ? totalPages - 1 : current - 1));
  const goNext = () => setPage((current) => (current === totalPages - 1 ? 0 : current + 1));

  return (
    <div ref={ref}>
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Integrantes anteriores"
          className="flex shrink-0 items-center justify-center bg-transparent p-1 text-brasil-green transition-transform hover:scale-125"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>

        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 md:gap-x-6">
          {visible.map((member, index) => (
            <div
              key={member.name}
              className={`transition-all duration-700 ease-out ${
                inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: inView ? `${index * 90}ms` : '0ms' }}
            >
              <MemberCard member={member} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Próximos integrantes"
          className="flex shrink-0 items-center justify-center bg-transparent p-1 text-brasil-green transition-transform hover:scale-125"
        >
          <ChevronRight size={28} strokeWidth={2.5} />
        </button>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={`Ir para página ${index + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === page ? 'bg-brasil-green' : 'bg-brasil-green/25'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DevelopersSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brick mb-4 uppercase">
            Equipe Votus
          </h2>
        </div>

        {/* Orientadora - no topo, separada visualmente, mas na mesma seção */}
        <div className="mb-12 flex flex-col items-center border-b border-line pb-10">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-brasil-green/70">
            Orientadora
          </p>
          <MemberCard member={advisor} size="lg" />
        </div>

        <TeamCarousel members={teamMembers} />
      </div>
    </section>
  );
}
