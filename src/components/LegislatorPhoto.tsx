'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LegislatorPhoto({
  src,
  alt,
  sizes,
  className,
}: {
  src: string | null;
  alt: string;
  // Não usada mais: sem foto real, o espaço fica em branco em vez de um
  // placeholder genérico (deputados.png/senadores.png). Mantida opcional só
  // pra não exigir mudança em quem ainda passa essa prop.
  fallbackSrc?: string;
  sizes?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="absolute inset-0 bg-[#f7f5f2]" role="img" aria-label={alt} />;
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
