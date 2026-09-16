import type { LucideIcon } from "lucide-react";

const ACCENTS = {
  green: "text-[#1B623A]",
  red: "text-[#8D0801]",
  gold: "text-[#8D6A00]",
} as const;

export default function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "green",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: keyof typeof ACCENTS;
}) {
  return (
    <div className="rounded-[10px] border border-line bg-white p-5">
      <div className="flex items-center gap-2 text-[#6b6255]">
        <Icon size={16} strokeWidth={2.25} />
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className={`mt-2 truncate text-2xl font-black ${ACCENTS[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-[#6b6255]">{hint}</p>}
    </div>
  );
}
