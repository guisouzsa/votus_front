"use client";

export const RELEVANCE_TABS = ["Mais relevantes", "Mais recentes"] as const;
export type RelevanceTab = (typeof RELEVANCE_TABS)[number];

export default function RelevanceTabs({
  value,
  onChange,
}: {
  value: RelevanceTab;
  onChange: (tab: RelevanceTab) => void;
}) {
  return (
    <div className="mt-8 flex gap-2">
      {RELEVANCE_TABS.map((label) => {
        const isActive = value === label;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(label)}
            className={`rounded-full border border-[#EDDBBA] px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? "bg-[#EDDBBA]/50 text-[#1B623A]"
                : "bg-[#EDDBBA]/30 text-[#1B623A]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
