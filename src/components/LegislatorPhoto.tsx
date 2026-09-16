'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LegislatorPhoto({
  src,
  alt,
  fallbackSrc,
  sizes,
  className,
}: {
  src: string | null;
  alt: string;
  fallbackSrc: string;
  sizes?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      src={!failed && src ? src : fallbackSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
