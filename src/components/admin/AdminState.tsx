import { AlertTriangle, Inbox } from "lucide-react";
import LoadingState from "@/components/LoadingState";

type AdminStateType = "loading" | "error" | "empty";

const ICONS: Record<Exclude<AdminStateType, "loading">, typeof AlertTriangle> = {
  error: AlertTriangle,
  empty: Inbox,
};

const STYLES: Record<Exclude<AdminStateType, "loading">, string> = {
  error: "text-[#8D0801]",
  empty: "text-[#6b6255]",
};

export default function AdminState({ type, message }: { type: AdminStateType; message: string }) {
  // "loading" usa o mesmo carregamento (logo + anel discreto) do resto do
  // site — ver LoadingState — pra ficar consistente com as telas públicas.
  if (type === "loading") {
    return <LoadingState message={message} className="rounded-[12px] border border-dashed border-line bg-white/60" />;
  }

  const Icon = ICONS[type];

  return (
    <div className={`flex flex-col items-center gap-2 rounded-[12px] border border-dashed border-line bg-white/60 px-6 py-10 text-center ${STYLES[type]}`}>
      <Icon size={22} strokeWidth={2} />
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
}
