"use client";

import { Search } from "lucide-react";

export default function AdminSearchInput({
  value,
  onChange,
  placeholder = "Pesquisar...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-[10px] border border-line bg-white px-4">
      <Search size={16} className="shrink-0 text-[#6b6255]" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-sm text-[#22201b] outline-none placeholder:text-[#6b6255]"
      />
    </div>
  );
}
