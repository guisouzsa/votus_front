import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Chamada discreta no fim de uma seção apontando pra área relacionada
 * (ex: Candidatos ↔ Juventude em Pauta), pra navegação entre elas não
 * depender só da sidebar. Mesmo visual dos módulos da tela inicial.
 */
export default function CrossLinkBanner({
  titulo,
  descricao,
  links,
}: {
  titulo: string;
  descricao: string;
  links: { label: string; href: string }[];
}) {
  return (
    <aside className="mt-10 overflow-hidden rounded-xl border border-line bg-cream">
      <div className="h-2 w-full bg-[url('/sidebar.svg')] bg-[length:auto_100%] bg-repeat-x" aria-hidden="true" />
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-heading text-base font-bold text-ink">{titulo}</p>
          <p className="mt-1 text-sm text-ink-soft">{descricao}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-brasil-green px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#164f30]"
            >
              {link.label}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
