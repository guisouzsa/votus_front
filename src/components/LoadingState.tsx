import Image from 'next/image';

/**
 * Estado de carregamento padrão do Votus: a logo (Ivy) parada no centro,
 * com um anel fino girando ao redor — discreto, sem telas pesadas nem
 * animação exagerada — e uma mensagem curta embaixo dizendo o que está
 * sendo carregado.
 *
 * Uso: qualquer tela/seção cujo carregamento não é instantâneo (mais de
 * ~2s), no lugar de um texto solto "Carregando...". Para esperas muito
 * curtas ou dentro de um card já carregado (ex: lista de comentários),
 * prefira não mostrar nada ou um texto pequeno inline — este componente é
 * para o carregamento principal de uma tela/seção.
 */
export default function LoadingState({
  message = 'Carregando...',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className}`}
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border-2 border-[#e7e0d2] border-t-[#1B623A] animate-spin"
          style={{ animationDuration: '900ms' }}
          aria-hidden="true"
        />
        <Image src="/ivy_votus.png" alt="" width={629} height={707} className="h-6 w-auto" priority={false} />
      </div>
      <p className="text-sm font-semibold text-[#6b6255]">{message}</p>
    </div>
  );
}
