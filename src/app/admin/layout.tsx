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

  // Esse layout é compartilhado por todas as rotas /admin/* — o Next.js não
  // o remonta ao navegar entre elas (nem ao voltar de /admin/login), então
  // "checking" pode continuar false (de uma sessão válida anterior) bem no
  // momento em que o pathname muda e precisamos reverificar. Resetar aqui,
  // durante a própria renderização (padrão oficial do React pra "reagir a
  // uma mudança sem usar efeito"), evita pintar até um único frame com o
  // conteúdo protegido antes da checagem assíncrona abaixo rodar — que era
  // exatamente o "pisca" ao apertar voltar depois de sair.
  const [pathnameChecado, setPathnameChecado] = useState(pathname);
  if (pathname !== pathnameChecado) {
    setPathnameChecado(pathname);
    if (!isLoginPage) {
      setChecking(true);
    }
  }

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
  }, [isLoginPage, router, pathname]);

  // Reforço contra o cache de navegação do próprio navegador (bfcache): se a
  // página for restaurada de lá (ex: histórico após fechar/reabrir aba), o
  // React não remonta nem reexecuta a lógica acima — então revalidamos aqui
  // também, com um reload de verdade em vez de navegação client-side, pra
  // garantir que nada da versão em cache fique visível.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted && !isLoginPage && !getAdminToken()) {
        window.location.replace("/admin/login");
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [isLoginPage]);

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
      <main className="mx-auto max-w-screen-2xl px-6 py-8 pb-28 sm:px-10 md:pb-8">{children}</main>
      <AdminMobileNav />
    </div>
  );
}
