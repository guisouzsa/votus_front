'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LegislatorPhoto({
  src,
  alt,
  sizes,
  className,
  optimize = true,
}: {
  src: string | null;
  alt: string;
  // Não usada mais: sem foto real, o espaço fica em branco em vez de um
  // placeholder genérico (deputados.png/senadores.png). Mantida opcional só
  // pra não exigir mudança em quem ainda passa essa prop.
  fallbackSrc?: string;
  sizes?: string;
  className?: string;
  // false pula o otimizador de imagem da Vercel (next/image) e usa um
  // <img> direto na URL original. Usado só pra fotos de candidato (bucket
  // Supabase, ~5KB cada): com milhares de fotos, otimizar cada uma consumia
  // a franquia mensal de "Image Optimization Transformations" da Vercel sem
  // ganho real de peso — a imagem já chega pequena. Fotos de parlamentares
  // (Câmara/Senado/ALECE/Executivo) continuam otimizadas normalmente.
  optimize?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="absolute inset-0 bg-[#f7f5f2]" role="img" aria-label={alt} />;
  }

  if (!optimize) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full ${className ?? ''}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
