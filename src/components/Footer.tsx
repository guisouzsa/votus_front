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
    // mb-16 md:mb-0: no mobile o botão flutuante "Pergunte à IA" ocupa os
    // últimos ~160px do viewport (bottom-24 + h-16); essa margem extra
    // garante que o rodapé nunca termine dentro dessa faixa e fique
    // encoberto por ele. No desktop o botão é menor e fica mais afastado
    // (bottom-6), então a margem extra não é necessária.
    <footer className="mt-8 mb-16 border-t border-line bg-white md:mb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:px-10">
        {/* Logo ao lado do texto (empilha só no celular). */}
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-6 sm:text-left">
          <div className="flex shrink-0 items-center gap-2">
            <Image src="/votus_name.png" alt="Votus" width={2076} height={489} className="h-6 w-auto sm:h-7" />
            <Image src="/ivy_votus.png" alt="" width={629} height={707} className="h-6 w-auto sm:h-7" />
          </div>

          <p className="max-w-xl text-xs text-[#6b6255] sm:border-l sm:border-line sm:pl-6">{SITE_DESCRIPTION}</p>
        </div>

        {/* Copyright e redes sociais juntos, na mesma linha (quebra se
            faltar espaço) — compacto e sem uma "última fileira" larga que
            pudesse ficar embaixo do botão de IA. */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line pt-4 text-center">
          <p className="text-[11px] text-[#6b6255]">© {new Date().getFullYear()} Votus. Todos os direitos reservados.</p>

          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ href, label, icon }) => (
              <a key={label} href={href} aria-label={label} className="opacity-80 transition-opacity hover:opacity-100">
                <img src={icon} alt="" className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
