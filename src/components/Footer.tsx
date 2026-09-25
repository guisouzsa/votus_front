import Image from 'next/image';
import { SITE_DESCRIPTION } from '@/lib/siteConfig';

const SOCIAL_LINKS = [
  { href: 'mailto:contato@votus.com.br', label: 'E-mail', icon: '/email.svg' },
  { href: '#', label: 'Instagram', icon: '/instagram.svg' },
  { href: '#', label: 'X (Twitter)', icon: '/x.svg' },
  { href: '#', label: 'WhatsApp', icon: '/whatsapp.svg' },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-[#FDF8EE]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:px-10">
        {/* Logo ao lado do texto (empilha só no celular). */}
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
          <div className="flex shrink-0 items-center gap-2">
            <Image src="/votus_name.png" alt="Votus" width={2076} height={489} className="h-7 w-auto sm:h-8" />
            <Image src="/ivy_votus.png" alt="" width={629} height={707} className="h-7 w-auto sm:h-8" />
          </div>

          <p className="max-w-xl text-xs text-[#6b6255] sm:border-l sm:border-line sm:pl-6 sm:text-sm">
            {SITE_DESCRIPTION}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-line pt-6 sm:flex-row sm:justify-between">
          <p className="text-[11px] text-[#6b6255]">© {new Date().getFullYear()} Votus. Todos os direitos reservados.</p>

          <div className="flex items-center gap-8">
            {SOCIAL_LINKS.map(({ href, label, icon }) => (
              <a key={label} href={href} aria-label={label} className="opacity-80 transition-opacity hover:opacity-100">
                <img src={icon} alt="" className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
