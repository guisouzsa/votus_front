import Link from 'next/link';

type Lado = 'mandato' | 'candidatura';

const LADOS: Record<
  Lado,
  { titulo: string; resumo: string; links: { label: string; href: string }[] }
> = {
  mandato: {
    titulo: 'Em exercício hoje',
    resumo:
      'Quem ocupa o cargo agora: deputados federais e senadores do Ceará com mandato atual no Congresso, com votações, comissões e proposições.',
    links: [
      { label: 'Deputados', href: '/DeputadosPage' },
      { label: 'Senadores', href: '/SenadoresPage' },
    ],
  },
  candidatura: {
    titulo: 'Candidatos 2026',
    resumo:
      'Quem está concorrendo na eleição de outubro de 2026: candidatura registrada no TSE, com partido, número na urna e chapa. Pode incluir quem já tem mandato e busca reeleição.',
    links: [
      { label: 'Presidente', href: '/CandidatosPage/presidente' },
      { label: 'Governador', href: '/CandidatosPage/governador' },
      { label: 'Senador', href: '/CandidatosPage/senado' },
      { label: 'Dep. Federal', href: '/CandidatosPage/deputado-federal' },
      { label: 'Dep. Estadual', href: '/CandidatosPage/deputado-estadual' },
    ],
  },
};

/**
 * Deixa explícita a diferença entre as duas áreas do Votus que mostram
 * políticos com cara parecida: "Em exercício" (quem legisla agora — dados da
 * Câmara/Senado) e "Candidatos 2026" (quem concorre — dados do TSE). Aparece
 * nas duas, com a atual marcada, e leva de uma à outra.
 */
export default function MandatoVsCandidatura({ atual }: { atual: Lado }) {
  return (
    <nav aria-label="Em exercício ou candidatos 2026" className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      {(Object.keys(LADOS) as Lado[]).map((lado) => {
        const { titulo, resumo, links } = LADOS[lado];
        const ativo = lado === atual;

        return (
          <div
            key={lado}
            aria-current={ativo ? 'page' : undefined}
            className={`rounded-[10px] border p-4 ${
              ativo ? 'border-brasil-green bg-brasil-green/5' : 'border-line bg-cream'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${ativo ? 'bg-brasil-green' : 'bg-ink-soft/40'}`} aria-hidden="true" />
              <p className="text-sm font-black uppercase tracking-wide text-ink">{titulo}</p>
              {ativo && (
                <span className="rounded-full bg-brasil-green px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Você está aqui
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">{resumo}</p>
            {!ativo && (
              <div className="mt-3 flex flex-wrap gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-brasil-green/40 hover:text-brasil-green"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
