"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import { getAdminToken } from "@/lib/adminAuth";
import { getAdminMe } from "@/services/adminService";

/**
 * Guarda client-side: sem token, nem chega a pedir dados. A proteção real
 * está no backend (EnsureIsAdmin em cada rota /api/admin/*) — isso aqui só
 * evita mostrar a casca do painel pra quem não tem sessão.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [checking, setChecking] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) return;

    const token = getAdminToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    getAdminMe()
      .then(() => setChecking(false))
      .catch(() => router.replace("/admin/login"));
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#FDF8EE]">
        <p className="text-sm text-[#6b6255]">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FDF8EE]">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8 pb-28 sm:px-10 md:pb-8">{children}</main>
      <AdminMobileNav />
    </div>
  );
}
