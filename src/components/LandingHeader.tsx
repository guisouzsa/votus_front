'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 bg-white border-b-[2px] border-[#d9d2c6] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="text-3xl font-bold text-brasil-green">
              <img src="/votus_name.png" alt="Votus Logo" className="h-10 w-auto" />
            </div>
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

          <div>
            <img src="/ivy_votus.png" alt="Votus Logo" className="h-10 w-auto" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-ink hover:text-brasil-green transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            <a href="#features" className="px-3 py-2 text-ink hover:text-brasil-green transition-colors font-semibold">
              Início
            </a>
            <a href="#how-it-works" className="px-3 py-2 text-ink hover:text-brasil-green transition-colors font-semibold">
              Uso de IA
            </a>
            <a href="#cta" className="px-3 py-2 text-ink hover:text-brasil-green transition-colors font-semibold">
              Explicações
            </a>
              <a href="#cta" className="px-3 py-2 text-ink hover:text-brasil-green transition-colors font-semibold">
              Equipe
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
