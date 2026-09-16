"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/services/adminService";
import { setAdminToken } from "@/lib/adminAuth";
import { ApiError } from "@/services/apiClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setEntrando(true);

    try {
      const { token } = await adminLogin(email, password);
      setAdminToken(token);
      router.push("/admin");
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 422)) {
        setErro("E-mail ou senha inválidos.");
      } else {
        setErro("Não foi possível entrar agora. Tente novamente em instantes.");
      }
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#FDF8EE] px-6">
      <div className="w-full max-w-sm rounded-[16px] border border-line bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <img src="/IconeVotus.svg" alt="Votus" className="h-8 w-auto" />
          <h1 className="text-sm font-black uppercase tracking-wide text-[#1B623A]">
            Painel administrativo
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            E-mail
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 h-12 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-base text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Senha
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 h-12 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-base text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          {erro && <p className="text-sm font-semibold text-[#8D0801]">{erro}</p>}

          <button
            type="submit"
            disabled={entrando}
            className="mt-2 flex h-12 items-center justify-center rounded-[10px] bg-[#1b623a] text-base font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
