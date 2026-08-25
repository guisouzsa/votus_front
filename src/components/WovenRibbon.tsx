export default function WovenRibbon({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden ${className}`} role="presentation" aria-hidden="true">
      <img
        src="/sidebar.png"
        alt=""
        className="w-full h-full object-cover"
      />
    </div>
  );
}