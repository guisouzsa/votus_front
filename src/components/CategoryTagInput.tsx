'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getCategories } from '@/services/categoriesService';

export default function CategoryTagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (categories: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timeout = setTimeout(() => {
      getCategories(trimmed)
        .then((response) => setSuggestions(response.data.map((category) => category.name)))
        .catch(() => setSuggestions([]));
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function addCategory(name: string) {
    const trimmed = name.trim();
    if (!trimmed || value.includes(trimmed)) return;

    onChange([...value, trimmed]);
    setQuery('');
    setSuggestions([]);
    setOpen(false);
  }

  function removeCategory(name: string) {
    onChange(value.filter((category) => category !== name));
  }

  const trimmedQuery = query.trim();
  const availableSuggestions = trimmedQuery
    ? suggestions.filter((name) => !value.includes(name))
    : [];
  const canCreateNew =
    trimmedQuery.length > 0 && !suggestions.some((name) => name.toLowerCase() === trimmedQuery.toLowerCase());

  return (
    <div ref={containerRef} className="relative">
      {value.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {value.map((category) => (
            <span
              key={category}
              className="flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white"
            >
              {category}
              <button
                type="button"
                onClick={() => removeCategory(category)}
                aria-label={`Remover categoria ${category}`}
                className="bg-transparent text-white/80 hover:text-white"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addCategory(query);
          }
        }}
        placeholder="Buscar ou criar categoria..."
        className="h-10 w-full rounded-[8px] border-0 bg-white px-3 text-sm font-normal text-ink outline-none placeholder:font-normal placeholder:text-[#8a8a8a]"
      />

      {open && (availableSuggestions.length > 0 || canCreateNew) && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-[8px] border border-black/5 bg-white shadow-md">
          {availableSuggestions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => addCategory(name)}
              className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-[#f7f5f2]"
            >
              {name}
            </button>
          ))}

          {canCreateNew && (
            <button
              type="button"
              onClick={() => addCategory(query)}
              className="block w-full border-t border-black/5 px-3 py-2 text-left text-sm font-semibold text-[#1b623a] hover:bg-[#f7f5f2]"
            >
              + Criar categoria &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
