'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Loader2, Send } from 'lucide-react';
import { createComment, getProposalComments } from '@/services/proposalsService';
import { ApiError } from '@/services/apiClient';

export default function ProposalComments({
  proposalId,
  onCommentAdded,
}: {
  proposalId: number;
  onCommentAdded: () => void;
}) {
  const {
    data: response,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR(['proposal-comments', proposalId], () => getProposalComments(proposalId), {
    revalidateOnFocus: false,
  });

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comments = response?.data ?? [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (sending || !content.trim()) return;

    setSending(true);
    setError(null);

    try {
      await createComment(proposalId, {
        content: content.trim(),
        author_name: name.trim() || undefined,
      });
      setContent('');
      mutate();
      onCommentAdded();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? 'Não foi possível enviar seu comentário. Tente novamente.'
          : 'Ocorreu um erro inesperado ao enviar seu comentário.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 border-t border-[#e0d6c4] pt-3">
      {isLoading && <p className="text-xs text-[#4d4d4d]">Carregando comentários...</p>}

      {!isLoading && swrError && (
        <p className="text-xs font-semibold text-[#8d0801]">Não foi possível carregar os comentários.</p>
      )}

      {!isLoading && !swrError && comments.length === 0 && (
        <p className="text-xs text-[#4d4d4d]">Nenhum comentário ainda. Seja o primeiro a comentar.</p>
      )}

      {!isLoading && !swrError && comments.length > 0 && (
        <ul className="flex flex-col gap-2">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-[10px] bg-[#f7f5f2] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#1b623a]">{comment.author_name}</span>
                <span className="text-[11px] text-[#8a8a8a]">
                  {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[#3a3a3a]">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Seu nome (opcional)"
          maxLength={255}
          className="h-9 w-full rounded-[8px] border border-[#e0d6c4] bg-white px-3 text-sm text-[#1b623a] outline-none focus:border-[#1b623a]"
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Escreva um comentário..."
            maxLength={2000}
            className="h-9 flex-1 rounded-[8px] border border-[#e0d6c4] bg-white px-3 text-sm text-[#1b623a] outline-none focus:border-[#1b623a]"
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            aria-label="Enviar comentário"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1b623a] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        {error && <p className="text-xs font-semibold text-[#8d0801]">{error}</p>}
      </form>
    </div>
  );
}
