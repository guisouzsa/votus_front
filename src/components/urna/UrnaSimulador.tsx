"use client";

import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import LegislatorPhoto from "@/components/LegislatorPhoto";
import { findCandidateByNumber, type CandidateOfficeSlug } from "@/services/candidatesService";
import type { Candidate } from "@/services/types";

type Cargo = {
  slug: CandidateOfficeSlug;
  titulo: string;
  digitos: number;
};

// Ordem real da cédula/urna eletrônica brasileira (do cargo de menor pro de
// maior abrangência). A quantidade de dígitos de cada número é regra do TSE
// (não é um dado do Votus): 4 pra federal, 5 pra estadual, 3 pra senador, 2
// pra governador e 2 pra presidente.
const CARGOS: Cargo[] = [
  { slug: "deputado-federal", titulo: "Deputada(o) Federal", digitos: 4 },
  { slug: "deputado-estadual", titulo: "Deputada(o) Estadual", digitos: 5 },
  { slug: "senado", titulo: "Senadora(or)", digitos: 3 },
  { slug: "governador", titulo: "Governadora(or)", digitos: 2 },
  { slug: "presidente", titulo: "Presidente da República", digitos: 2 },
];

type Status = "digitando" | "buscando" | "aguardando-confirmacao" | "incompleto" | "invalido" | "confirmado" | "branco";

const MENSAGEM_POR_STATUS: Record<Status, { texto: string; classe: string }> = {
  digitando: { texto: "Digite o número", classe: "text-[#3f4f45]" },
  buscando: { texto: "Buscando candidato...", classe: "text-[#3f4f45]" },
  "aguardando-confirmacao": { texto: "Confira os dados e toque em CONFIRMA", classe: "text-[#1b623a]" },
  incompleto: { texto: "Digite todos os números.", classe: "text-[#d9660d]" },
  invalido: { texto: "✕ NÚMERO INVÁLIDO", classe: "text-[#8d0801]" },
  confirmado: { texto: "✓ VOTO CONFIRMADO", classe: "text-[#1b623a]" },
  branco: { texto: "▢ VOTO EM BRANCO CONFIRMADO", classe: "text-[#d9660d]" },
};

export default function UrnaSimulador() {
  const [cargoIndex, setCargoIndex] = useState(0);
  const [numero, setNumero] = useState("");
  const [candidato, setCandidato] = useState<Candidate | null>(null);
  const [status, setStatus] = useState<Status>("digitando");
  const [bloqueado, setBloqueado] = useState(false);
  const [finalizada, setFinalizada] = useState(false);

  const somClique = useRef<HTMLAudioElement>(null);
  const somConfirmacao = useRef<HTMLAudioElement>(null);
  // Ignora resultado de uma busca antiga se o usuário já corrigiu/redigitou
  // antes dela responder.
  const buscaId = useRef(0);

  const cargo = CARGOS[cargoIndex];

  function tocarClique() {
    const audio = somClique.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function tocarConfirmacao() {
    const audio = somConfirmacao.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  async function buscarCandidato(numeroCompleto: string, office: CandidateOfficeSlug) {
    const idBusca = ++buscaId.current;
    setStatus("buscando");

    let encontrado: Candidate | null = null;
    try {
      encontrado = await findCandidateByNumber(office, numeroCompleto);
    } catch {
      encontrado = null;
    }

    if (idBusca !== buscaId.current) return;

    if (encontrado) {
      setCandidato(encontrado);
      setStatus("aguardando-confirmacao");
    } else {
      setCandidato(null);
      setStatus("invalido");
      setTimeout(() => {
        if (idBusca === buscaId.current) {
          setNumero("");
          setStatus("digitando");
        }
      }, 1200);
    }
  }

  function digitar(digito: string) {
    if (bloqueado || finalizada || status === "aguardando-confirmacao") return;

    const base = status === "invalido" ? "" : numero;
    const proximo = (base + digito).slice(0, cargo.digitos);

    buscaId.current++; // cancela qualquer busca/limpeza automática pendente
    setNumero(proximo);
    setCandidato(null);
    setStatus("digitando");
    tocarClique();

    if (proximo.length === cargo.digitos) {
      buscarCandidato(proximo, cargo.slug);
    }
  }

  function corrigir() {
    if (bloqueado || finalizada) return;

    buscaId.current++;
    setNumero("");
    setCandidato(null);
    setStatus("digitando");
  }

  function confirmar() {
    if (bloqueado || finalizada) return;

    if (status !== "aguardando-confirmacao" || !candidato) {
      if (numero.length > 0 && numero.length < cargo.digitos) {
        setStatus("incompleto");
      }
      return;
    }

    tocarConfirmacao();
    setStatus("confirmado");
    setBloqueado(true);
    setTimeout(avancarCargo, 1200);
  }

  function votarBranco() {
    if (bloqueado || finalizada || status === "confirmado" || status === "branco") return;

    buscaId.current++;
    tocarConfirmacao();
    setCandidato(null);
    setStatus("branco");
    setBloqueado(true);
    setTimeout(avancarCargo, 1200);
  }

  function avancarCargo() {
    setCargoIndex((indiceAtual) => {
      const proximoIndex = indiceAtual + 1;

      if (proximoIndex >= CARGOS.length) {
        finalizarVotacao();
        return indiceAtual;
      }

      setNumero("");
      setCandidato(null);
      setStatus("digitando");
      setBloqueado(false);
      return proximoIndex;
    });
  }

  function finalizarVotacao() {
    setFinalizada(true);

    setTimeout(() => {
      setFinalizada(false);
      setCargoIndex(0);
      setNumero("");
      setCandidato(null);
      setStatus("digitando");
      setBloqueado(false);
    }, 2200);
  }

  // Teclado físico (desktop): números digitam, Enter confirma, Backspace/
  // Delete corrige, "+" vota em branco — mesmos atalhos do modelo original.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        digitar(event.key);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        confirmar();
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        corrigir();
        return;
      }

      if (event.key === "+") {
        event.preventDefault();
        votarBranco();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const mensagem = MENSAGEM_POR_STATUS[status];
  const mostrandoCandidato = status === "aguardando-confirmacao" || status === "confirmado";

  return (
    // pr-16 no mobile: o botão flutuante "Pergunte à IA" fica fixo no canto
    // inferior direito (bottom-24 right-4, só sai dessa posição em md:) e
    // sobreporia o CONFIRMA/a moldura da foto sem esse respiro.
    <div className="w-full max-w-4xl pr-16 md:pr-0">
      <audio ref={somClique} preload="auto" src="/SimuladorUrnaElementos/som-clique.mp3" />
      <audio ref={somConfirmacao} preload="auto" src="/SimuladorUrnaElementos/som-confirmacao.mp3" />

      {/* ===================== VISOR ===================== */}
      <div className="relative w-full rounded-2xl bg-[#f7f2df] p-5 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)] sm:p-6 md:p-10">
        {finalizada && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center rounded-2xl bg-[#f7f2df] p-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/SimuladorUrnaElementos/fim.png" alt="Votação encerrada" className="max-h-full max-w-full object-contain" />
          </div>
        )}

        <div className="relative z-10 flex items-start justify-between gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="w-16 shrink-0 sm:w-20 md:w-24" src="/IconeVotus.svg" alt="Votus" />
          <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-[#e3a99a] sm:text-xs md:text-sm md:tracking-[0.3em]">
            Ilustrativo
          </div>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-1 gap-6 sm:gap-8 md:mt-10 md:grid-cols-[1fr_260px] md:gap-10">
          <div className="min-w-0">
            <div className="break-words text-2xl font-black uppercase leading-none text-[#1b623a] sm:text-3xl md:text-5xl">
              {finalizada ? "Votação encerrada" : cargo.titulo}
            </div>

            <div className="mt-3 text-xs font-bold uppercase tracking-wider text-[#d9660d] md:text-sm">
              {finalizada ? "Obrigado por votar" : "Digite o número do candidato"}
            </div>

            <div className="mt-6 flex min-h-[70px] flex-wrap items-center gap-2 sm:min-h-[80px] sm:gap-3" aria-label="Número digitado">
              {Array.from({ length: cargo.digitos }, (_, index) => numero[index] ?? "").map((digito, index) => (
                <div
                  key={index}
                  aria-label={`Dígito ${index + 1}`}
                  className={`flex h-14 w-11 items-center justify-center rounded-md border-2 text-2xl font-bold transition-colors duration-150 sm:h-16 sm:w-14 sm:text-3xl md:h-20 md:w-16 md:text-4xl ${
                    digito ? "border-[#1b623a] bg-[#eaf6ee] text-[#1b623a]" : "border-[#1b623a] text-[#1b623a]"
                  }`}
                >
                  {digito}
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-2 border-t-2 border-dashed border-[#1b623a]/30 pt-6">
              <div className="text-sm md:text-base">
                <span className="font-bold text-[#1b623a]">Nome:</span>
                <span className="ml-1 text-[#1b623a]">
                  {mostrandoCandidato && candidato ? candidato.ballot_name : status === "branco" ? "VOTO EM BRANCO" : "—"}
                </span>
              </div>
              <div className="text-sm md:text-base">
                <span className="font-bold text-[#1b623a]">Partido:</span>
                <span className="ml-1 text-[#1b623a]">
                  {mostrandoCandidato && candidato ? candidato.party.acronym ?? candidato.party.name ?? "—" : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[280px] shrink-0 md:mx-0 md:max-w-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/SimuladorUrnaElementos/textura1.png"
              alt=""
              className="pointer-events-none absolute -bottom-[20%] -left-[35%] z-0 w-[55%] select-none"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/SimuladorUrnaElementos/textura2.png"
              alt=""
              className="pointer-events-none absolute -right-[60%] -top-[70%] z-0 w-full select-none"
            />

            <div className="relative z-10 h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/SimuladorUrnaElementos/Moldura.png"
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
              />

              <div className="absolute inset-[12%] overflow-hidden rounded-sm bg-white">
                {mostrandoCandidato && candidato?.photo_url ? (
                  <LegislatorPhoto src={candidato.photo_url} alt={candidato.ballot_name} optimize={false} className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User size={56} strokeWidth={1.5} className="text-[#1b623a]/40" />
                  </div>
                )}
              </div>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/SimuladorUrnaElementos/orelhao.png"
              alt=""
              className="pointer-events-none absolute -right-[40%] -top-[15%] z-20 w-[80%] select-none"
            />
          </div>
        </div>

        <div
          role="status"
          aria-live="polite"
          className={`relative z-10 mt-8 break-words border-t-2 border-[#7a0e0e]/30 pt-5 text-center text-sm font-extrabold uppercase tracking-wide transition-colors duration-300 sm:text-base md:mt-10 md:text-xl ${mensagem.classe}`}
        >
          {finalizada ? "" : mensagem.texto}
        </div>

        <div className="relative z-10 mt-6 flex items-center justify-between gap-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e3a99a] sm:text-xs md:text-sm md:tracking-[0.3em]">
            Ilustrativo
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="w-16 shrink-0 sm:w-20 md:w-24" src="/IconeVotus.svg" alt="Votus" />
        </div>
      </div>

      {/* ===================== TECLADO ===================== */}
      <div className="mx-auto mt-5 grid w-full max-w-[380px] grid-cols-[repeat(3,1fr)_0.95fr] grid-rows-[repeat(4,58px)] gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digito, index) => (
          <button
            key={digito}
            type="button"
            aria-label={`Número ${digito}`}
            disabled={bloqueado || finalizada}
            onClick={() => digitar(String(digito))}
            style={{ gridColumn: (index % 3) + 1, gridRow: Math.floor(index / 3) + 1 }}
            className="rounded-[7px] bg-brasil-orange text-2xl font-bold text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40"
          >
            {digito}
          </button>
        ))}

        <button
          type="button"
          aria-label="Votar em branco"
          disabled={bloqueado || finalizada}
          onClick={votarBranco}
          style={{ gridColumn: 4, gridRow: 1 }}
          className="rounded-[7px] bg-brasil-gold text-xs font-bold leading-tight text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40"
        >
          BRANCO
        </button>

        <button
          type="button"
          aria-label="Corrigir"
          disabled={bloqueado || finalizada}
          onClick={corrigir}
          style={{ gridColumn: 4, gridRow: 2 }}
          className="rounded-[7px] bg-brasil-red text-xs font-bold leading-tight text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40"
        >
          CORRIGE
        </button>

        <button
          type="button"
          aria-label="Confirmar voto"
          disabled={bloqueado || finalizada}
          onClick={confirmar}
          style={{ gridColumn: 4, gridRow: "3 / span 2" }}
          className="rounded-[7px] bg-brasil-green text-[13px] font-bold leading-tight text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40"
        >
          CONFIRMA
        </button>

        <button
          type="button"
          aria-label="Número 0"
          disabled={bloqueado || finalizada}
          onClick={() => digitar("0")}
          style={{ gridColumn: 2, gridRow: 4 }}
          className="rounded-[7px] bg-brasil-orange text-2xl font-bold text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40"
        >
          0
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-ink-soft">
        Cargo {cargoIndex + 1} de {CARGOS.length} — candidatos de 2026{cargo.slug === "presidente" ? "" : " no Ceará"}.
      </p>
    </div>
  );
}
