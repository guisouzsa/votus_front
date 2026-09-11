'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { createProposal } from '@/services/proposalsService';
import { ApiError } from '@/services/apiClient';
import type { Proposal } from '@/services/types';

export default function ProposalFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (proposal: Proposal) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (sending || !title.trim() || !content.trim()) return;

    setSending(true);
    setError(null);

    try {
      const response = await createProposal({
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        author: author.trim() || undefined,
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
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[14px] bg-white p-6 text-left shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-black uppercase text-[#1b623a]">Cadastrar uma proposta</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-full p-1 text-[#1b623a]/60 transition-colors hover:bg-[#1b623a]/10 hover:text-[#1b623a]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-sm text-ink-soft">
          Sua proposta fica visível publicamente assim que você enviar.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="text-sm font-semibold text-[#1b623a]">
            Título *
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={255}
              required
              className="mt-1 h-10 w-full rounded-[8px] border border-[#e0d6c4] bg-white px-3 text-sm text-ink outline-none focus:border-[#1b623a]"
            />
          </label>

          <label className="text-sm font-semibold text-[#1b623a]">
            Descrição *
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={5000}
              required
              rows={4}
              className="mt-1 w-full rounded-[8px] border border-[#e0d6c4] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-[#1b623a]"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex-1 text-sm font-semibold text-[#1b623a]">
              Categoria
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                maxLength={255}
                placeholder="Ex: Educação"
                className="mt-1 h-10 w-full rounded-[8px] border border-[#e0d6c4] bg-white px-3 text-sm text-ink outline-none focus:border-[#1b623a]"
              />
            </label>

            <label className="flex-1 text-sm font-semibold text-[#1b623a]">
              Seu nome (opcional)
              <input
                type="text"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                maxLength={255}
                className="mt-1 h-10 w-full rounded-[8px] border border-[#e0d6c4] bg-white px-3 text-sm text-ink outline-none focus:border-[#1b623a]"
              />
            </label>
          </div>

          {error && <p className="text-xs font-semibold text-[#8d0801]">{error}</p>}

          <button
            type="submit"
            disabled={sending || !title.trim() || !content.trim()}
            className="mt-1 flex h-11 items-center justify-center gap-2 rounded-full bg-[#1b623a] text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending && <Loader2 size={16} className="animate-spin" />}
            Enviar proposta
          </button>
        </form>
      </div>
    </div>
  );
}
