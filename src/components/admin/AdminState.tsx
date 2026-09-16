import { Loader2, AlertTriangle, Inbox } from "lucide-react";

type AdminStateType = "loading" | "error" | "empty";

const ICONS: Record<AdminStateType, typeof Loader2> = {
  loading: Loader2,
  error: AlertTriangle,
  empty: Inbox,
};

const STYLES: Record<AdminStateType, string> = {
  loading: "text-[#6b6255]",
  error: "text-[#8D0801]",
  empty: "text-[#6b6255]",
};

export default function AdminState({ type, message }: { type: AdminStateType; message: string }) {
  const Icon = ICONS[type];

  return (
    <div className={`flex flex-col items-center gap-2 rounded-[12px] border border-dashed border-line bg-white/60 px-6 py-10 text-center ${STYLES[type]}`}>
      <Icon size={22} strokeWidth={2} className={type === "loading" ? "animate-spin" : undefined} />
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
}
