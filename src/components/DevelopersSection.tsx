'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TEAM_ADVISOR, TEAM_MEMBERS, type TeamMember } from '@/data/team';

const PAGE_SIZE = 4;

type DisplayMember = TeamMember & { isAdvisor?: boolean };

const ALL_TEAM_MEMBERS: DisplayMember[] = [
  { ...TEAM_ADVISOR, isAdvisor: true },
  ...TEAM_MEMBERS,
];

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

function MemberPhoto({ member }: { member: DisplayMember }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-cream shadow-[0_2px_8px_rgba(27,98,58,0.16)] sm:h-28 sm:w-28">
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

function MemberCard({ member, animationDelay = 0 }: { member: DisplayMember; animationDelay?: number }) {
  const role = member.isAdvisor ? 'Orientadora do projeto' : member.role;

  return (
    <article
      className="group flex min-h-[250px] flex-col items-center rounded-2xl border border-white/80 bg-white/35 px-4 py-6 text-center shadow-[0_2px_8px_rgba(27,98,58,0.06)] transition duration-300 hover:-translate-y-1 hover:bg-white/60 hover:shadow-[0_8px_20px_rgba(27,98,58,0.12)]"
      style={{ transitionDelay: `${animationDelay}ms` }}
    >
      <MemberPhoto member={member} />
      {member.isAdvisor && (
        <span className="mt-4 rounded-full bg-brasil-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brasil-green">
          Orientadora
        </span>
      )}
      <p className={`${member.isAdvisor ? 'mt-2' : 'mt-4'} max-w-[15rem] break-words text-sm font-bold leading-snug text-ink sm:text-base`}>
        {member.name}
      </p>
      <p className="mt-1 max-w-[15rem] break-words text-xs leading-snug text-ink-soft sm:text-sm">{role}</p>
    </article>
  );
}

function TeamCarousel({ members }: { members: DisplayMember[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(members.length / PAGE_SIZE);
  const visible = members.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const goPrev = () => setPage((current) => (current === 0 ? totalPages - 1 : current - 1));
  const goNext = () => setPage((current) => (current === totalPages - 1 ? 0 : current + 1));

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Integrantes anteriores"
          className="flex shrink-0 items-center justify-center rounded-full p-2 text-brasil-green transition hover:bg-brasil-green/10 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-green"
        >
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((member, index) => (
            <div
              key={member.name}
              className={`min-w-0 transition-all duration-700 ease-out ${
                inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: inView ? `${index * 90}ms` : '0ms' }}
            >
              <MemberCard member={member} animationDelay={index * 90} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Próximos integrantes"
          className="flex shrink-0 items-center justify-center rounded-full p-2 text-brasil-green transition hover:bg-brasil-green/10 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-green"
        >
          <ChevronRight size={26} strokeWidth={2.5} />
        </button>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2" aria-label="Paginação da equipe">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={`Ir para a página ${index + 1} da equipe`}
              aria-current={index === page ? 'true' : undefined}
              className={`h-2.5 w-2.5 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-green ${
                index === page ? 'bg-brasil-green' : 'bg-brasil-green/25 hover:bg-brasil-green/50'
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
    <section className="bg-white px-4 py-0 sm:px-6 lg:px-8">
      <div className="landing-container">
        <div className="overflow-hidden rounded-[28px] bg-[#F6F4DF] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-brick md:text-4xl">Conheça nossa equipe</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
              Pessoas que colaboram para transformar informação pública em uma experiência mais clara e acessível.
            </p>
          </header>

          <TeamCarousel members={ALL_TEAM_MEMBERS} />
        </div>
      </div>
    </section>
  );
}
