'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Send, Trash2 } from 'lucide-react';
import { createComment, deleteComment, getProposalComments } from '@/services/proposalsService';
import { ApiError } from '@/services/apiClient';
import type { PaginatedResponse, ProposalComment } from '@/services/types';

export default function ProposalComments({
  proposalId,
  onCommentAdded,
  onCommentRemoved,
}: {
  proposalId: number;
  onCommentAdded: () => void;
  onCommentRemoved: () => void;
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
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const comments = response?.data ?? [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (sending || !trimmedContent) return;

    const trimmedName = name.trim();
    const optimisticComment: ProposalComment = {
      id: -Date.now(),
      author_name: trimmedName || 'Visitante',
      content: trimmedContent,
      created_at: new Date().toISOString(),
      can_delete: true,
    };

    setSending(true);
    setError(null);
    setContent('');

    try {
      await mutate(
        async (current) => {
          const created = await createComment(proposalId, {
            content: trimmedContent,
            author_name: trimmedName || undefined,
          });

          return current
            ? { ...current, data: [created.data, ...current.data] }
            : ({ data: [created.data] } as PaginatedResponse<ProposalComment>);
        },
        {
          optimisticData: (current) =>
            current
              ? { ...current, data: [optimisticComment, ...current.data] }
              : ({ data: [optimisticComment] } as PaginatedResponse<ProposalComment>),
          rollbackOnError: true,
          revalidate: false,
        }
      );
      onCommentAdded();
    } catch (err) {
      setContent(trimmedContent);
      setError(
        err instanceof ApiError
          ? 'Não foi possível enviar seu comentário. Tente novamente.'
          : 'Ocorreu um erro inesperado ao enviar seu comentário.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (deletingId) return;

    setDeletingId(commentId);
    setError(null);

    try {
      await mutate(
        async (current) => {
          await deleteComment(proposalId, commentId);
          return current && { ...current, data: current.data.filter((c) => c.id !== commentId) };
        },
        {
          optimisticData: (current) =>
            current
              ? { ...current, data: current.data.filter((c) => c.id !== commentId) }
              : ({ data: [] as ProposalComment[] } as PaginatedResponse<ProposalComment>),
          rollbackOnError: true,
          revalidate: false,
        }
      );
      onCommentRemoved();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? 'Não foi possível apagar seu comentário. Tente novamente.'
          : 'Ocorreu um erro inesperado ao apagar seu comentário.'
      );
    } finally {
      setDeletingId(null);
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
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1b623a] text-xs font-black text-white">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 rounded-[10px] rounded-tl-none bg-[#f7f5f2] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="text-xs font-bold text-[#1b623a]">{comment.author_name}</span>
                  <span className="flex shrink-0 items-center gap-2 text-[11px] text-[#8a8a8a]">
                    {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                    {comment.can_delete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId !== null}
                        aria-label="Apagar comentário"
                        className="bg-transparent text-[#8d0801]/60 transition-colors hover:text-[#8d0801] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#3a3a3a]">{comment.content}</p>
              </div>
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
          className="h-9 w-full rounded-[8px] border border-[#e0d6c4] bg-white px-3 text-sm font-normal text-[#1b623a] outline-none placeholder:font-normal focus:border-[#1b623a]"
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Escreva um comentário..."
            maxLength={2000}
            className="h-9 flex-1 rounded-[8px] border border-[#e0d6c4] bg-white px-3 text-sm font-normal text-[#1b623a] outline-none placeholder:font-normal focus:border-[#1b623a]"
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            aria-label="Enviar comentário"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1b623a] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={15} />
          </button>
        </div>
        {error && <p className="text-xs font-semibold text-[#8d0801]">{error}</p>}
      </form>
    </div>
  );
}
