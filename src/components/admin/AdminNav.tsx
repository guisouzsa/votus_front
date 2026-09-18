"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Newspaper, FileText, MessageSquareText, Lightbulb, LogOut } from "lucide-react";
import { adminLogout } from "@/services/adminService";
import { clearAdminToken } from "@/lib/adminAuth";

export const ADMIN_NAV_ITEMS = [
  { id: "geral", label: "Visão geral", path: "/admin", icon: LayoutDashboard },
  { id: "noticias", label: "Notícias", path: "/admin/noticias", icon: Newspaper },
  { id: "propostas", label: "Propostas", path: "/admin/propostas", icon: FileText },
  { id: "sugestoes", label: "Sugestões", path: "/admin/sugestoes", icon: MessageSquareText },
  { id: "explicacoes", label: "Explicações", path: "/admin/explicacoes", icon: Lightbulb },
];

export function useAdminLogout() {
  const router = useRouter();

  return async function handleLogout() {
    try {
      await adminLogout();
    } catch {
      // Mesmo se a chamada falhar, limpa o token localmente e sai.
    } finally {
      clearAdminToken();
      router.push("/admin/login");
    }
  };
}

export default function AdminNav() {
  const pathname = usePathname();
  const handleLogout = useAdminLogout();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#FDF8EE]/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/IconeVotus.svg" alt="Votus" className="h-7 w-auto" />
          <span className="hidden text-xs font-black uppercase tracking-widest text-[#6b6255] sm:inline">
            Painel administrativo
          </span>
        </div>

        <nav aria-label="Navegação do painel" className="hidden items-center gap-1 md:flex">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-[#1B623A] text-white shadow-sm"
                    : "text-[#22201b] hover:bg-[#EDDBBA]/50"
                }`}
              >
                <Icon size={16} strokeWidth={2.5} />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#8D0801] transition-colors hover:bg-[#8D0801]/10"
          >
            <LogOut size={16} strokeWidth={2.5} />
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
