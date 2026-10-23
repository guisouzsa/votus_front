import Link from "next/link";

type StepCard = {
  step: number;
  title: string;
  description: string;
  href: string;
  cta: string;
};

type ExploreItem = {
  title: string;
  description: string;
  href: string;
  cta: string;
  background: "bg-brasil-orange" | "bg-brasil-gold";
};

const STEP_CARDS: StepCard[] = [
  {
    step: 1,
    title: "Descubra quem concorre",
    description: "Partido, número, chapa e plano de governo dos candidatos.",
    href: "/CandidatosPage/presidente",
    cta: "Ver candidatos",
  },
  {
    step: 2,
    title: "Entenda cada cargo",
    description: "O que faz um deputado, um senador e um governador, de forma simples e com quiz.",
    href: "/ExplicacoesPage",
    cta: "Entender os cargos",
  },
  {
    step: 3,
    title: "Acompanhe as notícias",
    description: "Resumo dos assuntos do momento, com link para a fonte original.",
    href: "/PainelNoticiasPage",
    cta: "Ver notícias",
  },
];

const EXPLORE_ITEMS: ExploreItem[] = [
  {
    title: "Senadores e deputados",
    description: "Quem exerce mandato hoje pelo Ceará, com comissões, proposições e linha do tempo.",
    href: "/DeputadosPage",
    cta: "Ver parlamentares",
    background: "bg-brasil-orange",
  },
  {
    title: "Juventude em Pauta",
    description: "Vagas, concursos e cursos, e um espaço para propor e debater ideias.",
    href: "/JuventudePage",
    cta: "Ver oportunidades",
    background: "bg-brasil-gold",
  },
];

function SectionIntro({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 id={id} className="font-heading text-2xl font-bold leading-tight text-brasil-green sm:text-[28px]">
        {title}
      </h2>
      <p className="mt-1.5 text-sm text-ink-soft sm:text-base">{subtitle}</p>
    </div>
  );
}

function StepCardLink({ step, title, description, href, cta }: StepCard) {
  return (
    <Link
      href={href}
      className="group flex min-h-[260px] flex-col rounded-[22px] border border-line bg-[#f7f3eb] p-[26px] transition-[border-color,box-shadow] hover:border-brasil-red hover:shadow-[0_8px_24px_rgba(141,8,1,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-red"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brasil-red font-heading text-lg font-bold text-white">
        {step}
      </span>
      <h3 className="mt-5 text-left font-heading text-[23px] font-bold leading-tight text-brasil-red">{title}</h3>
      <p className="mt-2 text-left text-sm leading-relaxed text-ink-soft">{description}</p>
      <span className="mt-auto flex min-h-11 items-end justify-start gap-1.5 pt-6 text-sm font-bold text-brasil-red">
        {cta} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function ExploreRow({ title, description, href, cta, background }: ExploreItem) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[190px] flex-col rounded-[22px] border border-transparent p-[26px] text-white transition-[border-color,box-shadow] hover:border-white hover:shadow-[0_8px_24px_rgba(34,32,27,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-red ${background}`}
    >
      <h3 className="font-heading text-[22px] font-bold leading-tight text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/90">{description}</p>
      <span className="mt-auto flex min-h-11 items-end justify-start gap-1.5 pt-6 text-sm font-bold text-white">
        {cta} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export default function HighlightGrid() {
  return (
    <div className="mt-10 w-full">
      <section aria-labelledby="comece-por-aqui">
        <SectionIntro
          id="comece-por-aqui"
          title="Comece por aqui"
          subtitle="Três passos para chegar à urna sabendo em quem votar."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEP_CARDS.map((card) => (
            <StepCardLink key={card.href} {...card} />
          ))}
        </div>
      </section>

      <section aria-labelledby="mais-para-explorar" className="mt-[52px]">
        <SectionIntro
          id="mais-para-explorar"
          title="Mais para explorar"
          subtitle="Depois da eleição, o trabalho continua."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {EXPLORE_ITEMS.map((item) => (
            <ExploreRow key={item.href} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}
