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
    <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white mx-4 md:mx-6 lg:mx-8 rounded-lg my-2">
      <div className="max-w-7xl mx-auto min-h-[230px] flex flex-col justify-center">
        {/* Categories Tabs */}
        <div className="grid md:grid-cols-3 gap-0 overflow-hidden rounded-lg shadow-lg">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(index)}
              className="bg-brasil-orange text-white font-bold text-xl py-10 px-4 hover:bg-opacity-90 transition-all uppercase border-r border-white/20 last:border-r-0"
            >
              {category.title}
            </button>
          ))}
        </div>


      </div>
    </section>
  );
}
