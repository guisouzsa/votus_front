"use client";

import { useState } from "react";

const TABS = ["Mais relevantes", "Mais recentes"];

export default function RelevanceTabs() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div className="mt-8 flex gap-2">
      {TABS.map((label) => {
        const isActive = tab === label;
        return (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
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