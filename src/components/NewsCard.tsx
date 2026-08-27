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
        className={`relative flex h-44 w-full flex-col justify-between overflow-hidden rounded-lg ${gradient} p-4 transition-transform duration-300 group-hover:scale-[1.02] sm:h-48`}
      >
        <span className="text-xs font-semibold text-white drop-shadow-sm">
          {eyebrow}
        </span>

        <p className="text-sm font-semibold leading-snug text-white drop-shadow-sm">
          {title}
        </p>
      </div>
    </a>
  );
}