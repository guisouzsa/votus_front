export type NewsItem = {
  eyebrow: string;
  title: string;
  gradient: string;
};

export default function NewsCard({
  eyebrow,
  title,
  gradient,
}: NewsItem) {
  return (
    <a href="#" className="group block h-full">
      <div
        className={`relative h-44 w-full overflow-hidden rounded-2xl ${gradient} p-4 transition-transform duration-300 group-hover:scale-[1.02] sm:h-48`}
      >
        <span className="text-xs font-semibold text-white drop-shadow-sm">
          {eyebrow}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold leading-snug text-ink">
        {title}
      </p>
    </a>
  );
}
