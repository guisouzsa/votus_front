'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-brasil-green hover:text-ink transition-colors font-semibold">
              Início
            </a>
            <a href="#how-it-works" className="text-brick hover:text-ink transition-colors font-semibold">
              uso de IA
            </a>
            <a href="#cta" className="text-brasil-gold hover:text-ink transition-colors font-semibold">
              Explicações
            </a>
            <a href="#cta" className="text-brasil-orange hover:text-ink transition-colors font-semibold">
              Equipe
            </a>
          </nav>

          <div className="hidden md:block">
            <Image src="/ivy_votus.png" alt="Votus Logo" width={629} height={707} className="h-10 w-auto" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center text-ink hover:text-brasil-green transition-colors"
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            <a href="#features" className="px-3 py-2 text-brasil-green hover:text-ink transition-colors font-semibold">
              Início
            </a>
            <a href="#how-it-works" className="px-3 py-2 text-brick hover:text-ink transition-colors font-semibold">
              Uso de IA
            </a>
            <a href="#cta" className="px-3 py-2 text-brasil-gold hover:text-ink transition-colors font-semibold">
              Explicações
            </a>
            <a href="#cta" className="px-3 py-2 text-brasil-orange hover:text-ink transition-colors font-semibold">
              Equipe
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
