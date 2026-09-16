"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS, useAdminLogout } from "./AdminNav";

/**
 * Espelha o padrão visual do MobileBottomNav público (barra flutuante,
 * pílulas ativas) — mesma identidade, só que com os itens do admin.
 */
export default function AdminMobileNav() {
  const pathname = usePathname();
  const handleLogout = useAdminLogout();

  return (
    <nav
      aria-label="Navegação do painel"
      className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-0.5 rounded-full border border-[#8D0801]/15 bg-[#FDF8EE] px-2 py-2 shadow-lg md:hidden"
    >
      {ADMIN_NAV_ITEMS.map(({ id, label, path, icon: Icon }) => {
        const isActive = pathname === path;

        return (
          <Link
            key={id}
            href={path}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            title={label}
            className={`flex h-12 flex-1 items-center justify-center rounded-full transition-colors ${
              isActive ? "bg-[#1B623A] text-white" : "text-[#103D23]"
            }`}
          >
            <Icon size={20} strokeWidth={2.5} />
          </Link>
        );
      })}

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Sair"
        title="Sair"
        className="flex h-12 flex-1 items-center justify-center rounded-full text-[#8D0801]"
      >
        <LogOut size={20} strokeWidth={2.5} />
      </button>
    </nav>
  );
}
