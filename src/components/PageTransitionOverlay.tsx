import Image from 'next/image';

/**
 * Sobreposição usada ao trocar de página numa listagem (paginação) ou ao
 * revalidar em segundo plano: o conteúdo ANTERIOR continua visível ao fundo
 * (levemente esbranquiçado), com a logo da Votus + um indicador girando por
 * cima — em vez de apagar a lista inteira e mostrar uma tela em branco/um
 * esqueleto novo enquanto a próxima página chega.
 *
 * Uso: envolva a lista com `className="relative"` e renderize isto como
 * filho, condicionado a `isValidating && !loading` (do useSsrPaginatedList).
 */
export default function PageTransitionOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando"
      className="absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-white/70 backdrop-blur-[1px]"
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border-2 border-[#e7e0d2] border-t-[#1B623A] animate-spin"
          style={{ animationDuration: '900ms' }}
          aria-hidden="true"
        />
        <Image src="/ivy_votus.png" alt="" width={629} height={707} className="h-6 w-auto" />
      </div>
    </div>
  );
}
