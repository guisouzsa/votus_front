'use client';

import Image from 'next/image';

export default function LandingHeader() {
  return (
    <header className="fixed w-full top-0 z-50 bg-white border-b-[2px] border-[#d9d2c6] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center gap-2 md:gap-0">
            <Image
              src="/votus_name.png"
              alt="Votus Logo"
              width={2076}
              height={489}
              priority
              className="h-8 w-auto sm:h-9 md:h-10"
            />
            <Image
              src="/ivy_votus.png"
              alt="Votus Logo"
              width={629}
              height={707}
              className="h-8 w-auto sm:h-9 md:hidden"
            />
          </div>

          <div className="hidden md:block">
            <Image src="/ivy_votus.png" alt="Votus Logo" width={629} height={707} className="h-10 w-auto" />
          </div>
        </div>
      </div>
    </header>
  );
}
