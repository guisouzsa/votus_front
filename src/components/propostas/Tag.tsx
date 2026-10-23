import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp, FileSearch, SearchX } from 'lucide-react';

// Etiquetas discretas com significado fixo. Cada uma tem ícone + texto, para
// não depender só da cor.
const STYLES = {
  verified: { className: 'border-[#1B623A]/30 bg-[#1B623A]/[0.07] text-[#1B623A]', icon: CheckCircle2 },
  mentioned: { className: 'border-[#1B623A]/30 bg-white text-[#1B623A]', icon: FileSearch },
  neutral: { className: 'border-[#e0d6c4] bg-white text-ink-soft', icon: CircleHelp },
  notFound: { className: 'border-[#e0d6c4] bg-[#f7f5f2] text-ink-soft', icon: SearchX },
  pending: { className: 'border-[#c98a2b]/40 bg-[#fdf3e7] text-[#7a4a00]', icon: AlertTriangle },
} as const;

export type TagTone = keyof typeof STYLES;

export default function Tag({ tone, children, title }: { tone: TagTone; children: ReactNode; title?: string }) {
  const { className, icon: Icon } = STYLES[tone];

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold leading-tight ${className}`}
    >
      <Icon size={12} aria-hidden="true" className="shrink-0" />
      {children}
    </span>
  );
}
