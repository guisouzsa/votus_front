export type NewsItem = {
  eyebrow: string;
  title: string;
  gradient: string;
};

export default function NewsCard({ eyebrow, title, gradient }: NewsItem) {
  return (
    <a href="#" className="group block">
      <div className={`h-32 w-full rounded-2xl ${gradient} p-3 transition-transform duration-300 group-hover:scale-[1.02]`}>
        <span className="w-fit rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink">
          {eyebrow}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-snug text-ink">
        {title}
      </p>
    </a>
  );
}