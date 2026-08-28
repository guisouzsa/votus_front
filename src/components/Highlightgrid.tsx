import HighlightCard, { HighlightItem } from "@/components/Highlightcard";

const HIGHLIGHTS: HighlightItem[] = [
  { category: "Notícias em alta", title: "", href: "/Painelnoticias" },
  { category: "Explicações", title: "", href: "#" },
  { category: "Senadores e deputados em alta", title: "", href: "#" },
  { category: "Juventude em pauta", title: "", href: "#" },
];

export default function HighlightGrid() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {HIGHLIGHTS.map((item) => (
        <HighlightCard key={item.category} {...item} />
      ))}
    </div>
  );
}