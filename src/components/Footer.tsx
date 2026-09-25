import Image from 'next/image';
import { SITE_DESCRIPTION } from '@/lib/siteConfig';

// lucide-react 1.x removeu os ícones de marcas (Github incluso) — importar
// `Github` de lá quebra o build. Mesmo desenho, inline.
function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { href: 'mailto:contato@votus.com.br', label: 'E-mail', icon: '/email.svg' },
  { href: '#', label: 'Instagram', icon: '/instagram.svg' },
  { href: '#', label: 'X (Twitter)', icon: '/x.svg' },
  { href: '#', label: 'WhatsApp', icon: '/whatsapp.svg' },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-[#FDF8EE]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 text-center sm:px-10">
        <div className="flex items-center gap-2">
          <Image src="/votus_name.png" alt="Votus" width={2076} height={489} className="h-7 w-auto sm:h-8" />
          <Image src="/ivy_votus.png" alt="" width={629} height={707} className="h-7 w-auto sm:h-8" />
        </div>

        <p className="max-w-md text-xs text-[#6b6255] sm:text-sm">{SITE_DESCRIPTION}</p>

        <div className="flex items-center gap-8 sm:gap-10">
          {SOCIAL_LINKS.map(({ href, label, icon }) => (
            <a key={label} href={href} aria-label={label} className="opacity-80 transition-opacity hover:opacity-100">
              <img src={icon} alt="" className="h-5 w-5" />
            </a>
          ))}
          <a
            href="https://github.com/guisouzsa/votus_front"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-[#1B623A] opacity-80 transition-opacity hover:opacity-100"
          >
            <GithubIcon size={20} />
          </a>
        </div>

        <p className="text-[11px] text-[#6b6255]">© {new Date().getFullYear()} Votus. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
