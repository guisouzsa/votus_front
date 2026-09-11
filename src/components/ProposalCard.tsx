'use client';

import { useState } from 'react';
import { Check, Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Proposal, ProposalVoteType } from '@/services/types';
import { voteOnProposal } from '@/services/proposalsService';
import { ApiError } from '@/services/apiClient';

export default function ProposalCard({
  proposal,
  onVoted,
}: {
  proposal: Proposal;
  onVoted: (updated: Proposal) => void;
}) {
  const [voting, setVoting] = useState<ProposalVoteType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (vote: ProposalVoteType) => {
    if (voting) return;

    setVoting(vote);
    setError(null);

    try {
      const response = await voteOnProposal(proposal.id, vote);
      onVoted(response.data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? 'Não foi possível registrar seu voto. Tente novamente.'
          : 'Ocorreu um erro inesperado ao registrar seu voto.'
      );
    } finally {
      setVoting(null);
    }
  };

  const formattedDate = proposal.created_at
    ? new Date(proposal.created_at).toLocaleDateString('pt-BR')
    : null;

  return (
    <article className="flex flex-col gap-3 rounded-[12px] border border-[#e0d6c4] bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h3 className="text-base font-black uppercase text-[#1b623a] sm:text-lg">{proposal.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#4d4d4d] sm:text-sm">
          {proposal.category && (
            <span className="font-semibold uppercase text-[#8d0801]">{proposal.category}</span>
          )}
          {proposal.author && <span>{proposal.author}</span>}
          {formattedDate && <span>{formattedDate}</span>}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-[#3a3a3a] sm:text-base">{proposal.content}</p>

      {error && <p className="text-xs font-semibold text-[#8d0801]">{error}</p>}

      <div className="mt-1 flex flex-wrap items-center gap-3">
        <VoteButton
          label="Legal"
          count={proposal.votes.legal}
          icon={ThumbsUp}
          active={proposal.viewer_vote === 'legal'}
          loading={voting === 'legal'}
          disabled={voting !== null}
          activeClassName="border-[#1b623a] bg-[#1b623a] text-white"
          idleClassName="border-[#1b623a] text-[#1b623a] hover:bg-[#1b623a]/10"
          onClick={() => handleVote('legal')}
        />

        <VoteButton
          label="Não apoio"
          count={proposal.votes.not_support}
          icon={ThumbsDown}
          active={proposal.viewer_vote === 'not_support'}
          loading={voting === 'not_support'}
          disabled={voting !== null}
          activeClassName="border-[#8d0801] bg-[#8d0801] text-white"
          idleClassName="border-[#8d0801] text-[#8d0801] hover:bg-[#8d0801]/10"
          onClick={() => handleVote('not_support')}
        />
      </div>
    </article>
  );
}

function VoteButton({
  label,
  count,
  icon: Icon,
  active,
  loading,
  disabled,
  activeClassName,
  idleClassName,
  onClick,
}: {
  label: string;
  count: number;
  icon: typeof ThumbsUp;
  active: boolean;
  loading: boolean;
  disabled: boolean;
  activeClassName: string;
  idleClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        active ? activeClassName : idleClassName
      }`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      {label}
      {active && !loading && <Check size={14} />}
      <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-xs font-semibold">{count}</span>
    </button>
  );
}
