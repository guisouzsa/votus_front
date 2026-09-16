"use client";

import { useState } from "react";
import Link from "next/link";

export type NewsItem = {
  id: number | string;
  eyebrow: string;
  title: string;
  gradient: string;
  imageUrl?: string | null;
};

export default function NewsCard({ id, eyebrow, title, gradient, imageUrl }: NewsItem) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/noticias/${id}`} className="group block h-full">
      <div
        className={`relative flex h-44 w-full flex-col justify-between overflow-hidden rounded-lg ${gradient} p-4 transition-transform duration-300 group-hover:scale-[1.02] sm:h-48`}
      >
        {imageUrl && !imgError && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          </>
        )}

        <span className="relative text-xs font-semibold text-white drop-shadow-sm">
          {eyebrow}
        </span>

        <p className="relative line-clamp-3 text-sm font-semibold leading-snug text-white drop-shadow-sm">
          {title}
        </p>
      </div>
    </Link>
  );
}
