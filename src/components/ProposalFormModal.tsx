'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, X } from 'lucide-react';
import { createProposal } from '@/services/proposalsService';
import { ApiError } from '@/services/apiClient';
import type { Proposal } from '@/services/types';
import CategoryTagInput from './CategoryTagInput';

export default function ProposalFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (proposal: Proposal) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [author, setAuthor] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const canSubmit = title.trim() && content.trim() && author.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (sending || !canSubmit) return;

    setSending(true);
    setError(null);

    try {
      const response = await createProposal({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        categories,
      });
      onCreated(response.data);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? 'Não foi possível cadastrar sua proposta. Tente novamente.'
          : 'Ocorreu um erro inesperado ao cadastrar sua proposta.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cadastrar uma proposta"
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[20px] bg-brasil-orange pb-10 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 shrink-0 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <h2 className="text-center text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            Cadastre uma proposta
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <label className="text-sm font-bold text-white">
                Título:
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={255}
                  required
                  className="mt-1.5 h-10 w-full rounded-[8px] border-0 bg-white px-3 text-sm text-ink outline-none"
                />
              </label>

              <label className="text-sm font-bold text-white">
                Nome para registro:
                <input
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  maxLength={255}
                  required
                  className="mt-1.5 h-10 w-full rounded-[8px] border-0 bg-white px-3 text-sm text-ink outline-none"
                />
              </label>

              <label className="text-sm font-bold text-white">
                Categoria:
                <div className="mt-1.5">
                  <CategoryTagInput value={categories} onChange={setCategories} />
                </div>
              </label>
            </div>

            <label className="flex flex-col text-sm font-bold text-white">
              Proposta:
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={5000}
                required
                className="mt-1.5 h-full min-h-[190px] w-full flex-1 rounded-[8px] border-0 bg-white px-3 py-2 text-sm text-ink outline-none"
              />
            </label>
          </div>

          {error && <p className="mt-4 text-xs font-semibold text-white">{error}</p>}

          <button
            type="submit"
            disabled={sending || !canSubmit}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1b623a] text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {sending && <Loader2 size={16} className="animate-spin" />}
            Cadastrar proposta
          </button>
        </form>

        <Image
          src="/CardProposta.svg"
          alt=""
          aria-hidden="true"
          width={963}
          height={101}
          className="pointer-events-none absolute bottom-0 left-0 h-10 w-full rounded-b-[20px] object-cover sm:h-14"
        />
      </div>
    </div>
  );
}
