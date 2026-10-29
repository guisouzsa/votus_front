'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Share2 } from 'lucide-react';
import type { ShareProfile } from './shareCardData';

// O editor (canvas, controles) só é baixado no primeiro clique: quem não
// compartilha não carrega nada a mais no perfil.
const ShareCardEditor = dynamic(() => import('./ShareCardEditor'), { ssr: false });

/**
 * Botão "Compartilhar informações" dos perfis. Abre o editor num popup sobre
 * a própria página (sem rota nova). O editor continua montado depois de
 * fechado, para guardar as escolhas se o usuário abrir de novo.
 */
export default function ShareProfileButton({ profile, className = '' }: { profile: ShareProfile; className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#1B623A] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#103D23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A] ${className}`}
      >
        <Share2 size={14} aria-hidden="true" />
        Compartilhar informações
      </button>
      {mounted && (
        <ShareCardEditor
          profile={profile}
          open={open}
          onClose={() => {
            setOpen(false);
            // Devolve o foco ao botão que abriu o popup.
            requestAnimationFrame(() => buttonRef.current?.focus());
          }}
        />
      )}
    </>
  );
}
