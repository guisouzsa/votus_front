'use client';

import { useState } from 'react';

export default function AudienceCategoriesSection() {
  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    {
      title: 'JOVENS',
      description: 'Conteúdo voltado para jovens engajados que buscam entender política de forma acessível'
    },
    {
      title: 'ENTUSIASTAS',
      description: 'Para quem quer aprofundar em temas políticos e acompanhar análises detalhadas'
    },
    {
      title: 'ESTUDANTES',
      description: 'Recursos educativos sobre sistemas políticos, legislação e cidadania'
    }
  ];

  return (
    <section className="w-full min-w-0 bg-white px-4 py-0 sm:px-6 lg:px-8">
      <div className="landing-container flex min-w-0 flex-col justify-center">
        {/* Categories Tabs */}
        <div className="grid w-full min-w-0 gap-0 overflow-hidden rounded-lg shadow-lg md:grid-cols-3">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(index)}
              className="min-w-0 bg-brasil-orange px-4 py-10 text-xl font-bold uppercase text-white transition-all hover:bg-opacity-90 border-r border-white/20 last:border-r-0"
            >
              {category.title}
            </button>
          ))}
        </div>


      </div>
    </section>
  );
}
