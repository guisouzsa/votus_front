'use client';

import { useState } from 'react';
import { ChevronDown, Heart, MessageCircle, ThumbsDown } from 'lucide-react';
import type { Proposal, ProposalVoteType } from '@/services/types';
import { deleteVote, voteOnProposal } from '@/services/proposalsService';
import { ApiError } from '@/services/apiClient';
import ProposalComments from './ProposalComments';

const BADGE_COLORS = [
  { bg: 'bg-[#8d0801]', pill: 'bg-[#8d0801]/10 text-[#8d0801]' },
  { bg: 'bg-[#F07A00]', pill: 'bg-[#F07A00]/10 text-[#F07A00]' },
  { bg: 'bg-[#F4C400]', pill: 'bg-[#F4C400]/15 text-[#8a6a00]' },
  { bg: 'bg-[#1C5D45]', pill: 'bg-[#1C5D45]/10 text-[#1C5D45]' },
  { bg: 'bg-[#EDDBBA]', pill: 'bg-[#EDDBBA]/40 text-[#8d0801]' },
];

function withOptimisticVote(proposal: Proposal, vote: ProposalVoteType | null): Proposal {
  const previousVote = proposal.viewer_vote;
  if (previousVote === vote) return proposal;

  const votes = { ...proposal.votes };
  if (previousVote === 'legal') votes.legal = Math.max(0, votes.legal - 1);
  if (previousVote === 'not_support') votes.not_support = Math.max(0, votes.not_support - 1);
  if (vote === 'legal') votes.legal += 1;
  if (vote === 'not_support') votes.not_support += 1;

  return { ...proposal, viewer_vote: vote, votes };
}

export default function ProposalCard({
  proposal,
  index,
  onVoted,
}: {
  proposal: Proposal;
  index: number;
  onVoted: (updated: Proposal) => void;
}) {
  const [voting, setVoting] = useState<ProposalVoteType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(proposal.comments_count);

  const colors = BADGE_COLORS[index % BADGE_COLORS.length];

  const handleVote = async (vote: ProposalVoteType) => {
    if (voting) return;

    const removing = proposal.viewer_vote === vote;
    const previous = proposal;

    setVoting(vote);
    setError(null);
    onVoted(withOptimisticVote(proposal, removing ? null : vote));

    try {
      const response = removing ? await deleteVote(proposal.id) : await voteOnProposal(proposal.id, vote);
      onVoted(response.data);
    } catch (err) {
      onVoted(previous);
      setError(
        err instanceof ApiError
          ? 'Não foi possível registrar seu voto. Tente novamente.'
          : 'Ocorreu um erro inesperado ao registrar seu voto.'
      );
    } finally {
      setVoting(null);
    }
  };

  return (
    <article className="flex flex-col gap-3 rounded-[12px] border border-[#e0d6c4] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-xs font-black text-white sm:h-12 sm:w-12 sm:text-sm ${colors.bg}`}
        >
          #{proposal.id}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-sm font-black uppercase text-[#1b623a] sm:text-base">
              {proposal.title}
              {proposal.author && <span className="font-semibold normal-case text-[#4d4d4d]"> — {proposal.author}</span>}
            </h3>
            {proposal.categories.map((category) => (
              <span key={category} className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${colors.pill}`}>
                #{category}
              </span>
            ))}
          </div>

          <p className={`mt-1.5 text-sm leading-relaxed text-[#3a3a3a] ${expanded ? '' : 'line-clamp-2'}`}>
            {proposal.content}
          </p>

          {proposal.content.length > 140 && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? 'Mostrar menos' : 'Mostrar mais'}
              className="mt-1 flex items-center bg-transparent text-[#1b623a]/60 transition-transform hover:text-[#1b623a]"
            >
              <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 self-center">
          <VoteIcon
            icon={Heart}
            active={proposal.viewer_vote === 'legal'}
            disabled={voting !== null}
            count={proposal.votes.legal}
            activeColor="text-[#8d0801]"
            fillWhenActive
            label="Legal"
            onClick={() => handleVote('legal')}
          />
          <VoteIcon
            icon={ThumbsDown}
            active={proposal.viewer_vote === 'not_support'}
            disabled={voting !== null}
            count={proposal.votes.not_support}
            activeColor="text-[#4d4d4d]"
            label="Não apoio"
            onClick={() => handleVote('not_support')}
          />
          <VoteIcon
            icon={MessageCircle}
            active={showComments}
            disabled={false}
            count={commentsCount}
            activeColor="text-[#1b623a]"
            label="Comentários"
            onClick={() => setShowComments((value) => !value)}
          />
        </div>
      </div>

      {error && <p className="text-xs font-semibold text-[#8d0801]">{error}</p>}

      {showComments && (
        <ProposalComments
          proposalId={proposal.id}
          onCommentAdded={() => setCommentsCount((count) => count + 1)}
          onCommentRemoved={() => setCommentsCount((count) => Math.max(0, count - 1))}
        />
      )}
    </article>
  );
}

function VoteIcon({
  icon: Icon,
  active,
  disabled,
  count,
  activeColor,
  fillWhenActive = false,
  label,
  onClick,
}: {
  icon: typeof Heart;
  active: boolean;
  disabled: boolean;
  count: number;
  activeColor: string;
  fillWhenActive?: boolean;
  label: string;
  onClick: () => void;
}) {
  const filled = fillWhenActive && active;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full bg-transparent px-1 py-1.5 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? activeColor : 'text-[#c9c2b3]'
      }`}
    >
      <Icon size={18} fill={filled ? 'currentColor' : 'none'} strokeWidth={filled ? 1.5 : 2} />
      <span className="text-xs font-bold">{count}</span>
    </button>
  );
}
