export type HighlightItem = {
  category: string;
  title: string;
  image?: string;
  href?: string;
};

export default function HighlightCard({
  category,
  title,
  image,
  href = "#",
}: HighlightItem) {
  return (
    <a href={href} className="group block h-full">
      <div className="relative flex h-56 w-full flex-col justify-between overflow-hidden rounded-xl border border-line bg-brasil-green-deep p-4 transition-transform duration-300 group-hover:scale-[1.01] sm:h-64">
        {image && (
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-1">
          <span className="w-fit text-sm font-bold text-white drop-shadow-sm">
            {category}
          </span>
          {title && (
            <h3 className="text-base font-medium text-white drop-shadow-sm">
              {title}
            </h3>
          )}
        </div>

        <span className="relative w-fit text-sm font-semibold text-white underline decoration-2 underline-offset-2 drop-shadow-sm">
          Ver mais
        </span>
      </div>
    </a>
  );
}