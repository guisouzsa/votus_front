import { CheckCircle2, CircleHelp, Clock, MinusCircle, Repeat2 } from 'lucide-react';
import type { ElectionResult, ElectionResultStatus } from '@/services/types';

// Cada situação tem ícone e texto (não só cor). A classificação vem pronta do
// backend, a partir do resultado oficial do TSE — o front não deduz nada.
const STYLES: Record<ElectionResultStatus, { className: string; icon: typeof CheckCircle2 }> = {
  elected: { className: 'border-[#1B623A] bg-[#1B623A] text-white', icon: CheckCircle2 },
  runoff: { className: 'border-[#F07A00]/60 bg-[#fdf3e7] text-[#8a4a00]', icon: Repeat2 },
  not_elected: { className: 'border-[#e0d6c4] bg-white text-[#4d4d4d]', icon: MinusCircle },
  awaiting: { className: 'border-[#e0d6c4] bg-[#f7f5f2] text-[#4d4d4d]', icon: Clock },
  unverified: { className: 'border-dashed border-[#e0d6c4] bg-white text-[#6b6255]', icon: CircleHelp },
};

export default function ElectionResultBadge({
  result,
  size = 'sm',
}: {
  result: ElectionResult;
  size?: 'sm' | 'md';
}) {
  const { className, icon: Icon } = STYLES[result.status] ?? STYLES.unverified;

  return (
    <span
      title={result.detail}
      className={`inline-flex items-center gap-1 rounded-full border font-bold ${className} ${
        size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px] uppercase tracking-wide'
      }`}
    >
      <Icon size={size === 'md' ? 14 : 11} aria-hidden="true" className="shrink-0" />
      {result.label}
    </span>
  );
}
