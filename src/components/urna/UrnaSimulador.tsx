"use client";

import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import LegislatorPhoto from "@/components/LegislatorPhoto";
import SantinhoElectionPicker from "@/components/SantinhoElectionPicker";
import { useElectionBallot } from "@/hooks/useElectionBallot";
import { PARTY_DIGITS, type BallotSlot } from "@/lib/electoralConfig";
import { findCandidateByNumber, type CandidateOfficeSlug } from "@/services/candidatesService";
import type { Candidate } from "@/services/types";

type Status =
  | "digitando"
  | "buscando"
  | "aguardando-confirmacao"
  | "sem-dados"
  | "incompleto"
  | "invalido"
  | "repetido"
  | "confirmado"
  | "legenda"
  | "branco";

const MENSAGEM_POR_STATUS: Record<Status, { texto: string; classe: string }> = {
  digitando: { texto: "Digite o número", classe: "text-[#3f4f45]" },
  buscando: { texto: "Buscando candidato...", classe: "text-[#3f4f45]" },
  "aguardando-confirmacao": { texto: "Confira os dados e toque em CONFIRMA", classe: "text-[#1b623a]" },
  "sem-dados": { texto: "Sem candidatos no Votus: toque em CONFIRMA para treinar", classe: "text-[#1b623a]" },
  incompleto: { texto: "Digite todos os números.", classe: "text-[#d9660d]" },
  invalido: { texto: "✕ NÚMERO INVÁLIDO", classe: "text-[#8d0801]" },
  repetido: { texto: "✕ ESCOLHA UM NÚMERO DIFERENTE EM CADA VAGA", classe: "text-[#8d0801]" },
  confirmado: { texto: "✓ VOTO CONFIRMADO", classe: "text-[#1b623a]" },
  legenda: { texto: "✓ VOTO DE LEGENDA CONFIRMADO", classe: "text-[#1b623a]" },
  branco: { texto: "▢ VOTO EM BRANCO CONFIRMADO", classe: "text-[#d9660d]" },
};

/** Escolha da eleição + urna. Trocar a eleição recomeça a votação (ver `key`). */
export default function UrnaSimulador() {
  const { selecao, eleicaoCompleta, eleicao, turno, votos, descricao, atualizar } = useElectionBallot();
  const chave = votos.map((voto) => `${voto.id}:${voto.candidateOffice ?? ""}`).join("|");

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <SantinhoElectionPicker
          modo="urna"
          selecao={selecao}
          eleicaoCompleta={eleicaoCompleta}
          eleicao={eleicao}
          turno={turno}
          votos={votos}
          onChange={atualizar}
        />
      </div>

      {votos.length > 0 ? (
        <div data-tour="urna" className="mt-8 flex justify-center">
          <UrnaTerminal key={chave} votos={votos} descricao={descricao} />
        </div>
      ) : (
        <p className="mt-8 text-center text-sm font-semibold text-[#8d0801]">Escolha pelo menos um cargo em disputa.</p>
      )}
    </div>
  );
}

function UrnaTerminal({ votos, descricao }: { votos: BallotSlot[]; descricao: string }) {
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
  // Números já confirmados por cargo, só pra comparar entre as vagas. Nada sai
  // daqui: some ao reiniciar a simulação.
  const confirmados = useRef<Partial<Record<BallotSlot["position"], string[]>>>({});

  const cargo = votos[cargoIndex];

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
    if (bloqueado || finalizada || status === "aguardando-confirmacao" || status === "sem-dados") return;

    const base = status === "invalido" || status === "repetido" ? "" : numero;
    const proximo = (base + digito).slice(0, cargo.digits);

    buscaId.current++; // cancela qualquer busca/limpeza automática pendente
    setNumero(proximo);
    setCandidato(null);
    setStatus("digitando");
    tocarClique();

    if (proximo.length < cargo.digits) return;

    if (confirmados.current[cargo.position]?.includes(proximo)) {
      setStatus("repetido");
    } else if (cargo.candidateOffice) {
      buscarCandidato(proximo, cargo.candidateOffice);
    } else {
      // Sem candidatos na base: não dá pra dizer se o número existe, nem inventar quem seria.
      setStatus("sem-dados");
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

    // Só o número do partido, num cargo proporcional: voto de legenda.
    if (cargo.allowsPartyVote && status === "digitando" && numero.length === PARTY_DIGITS) {
      tocarConfirmacao();
      setStatus("legenda");
      setBloqueado(true);
      setTimeout(avancarCargo, 1200);
      return;
    }

    const podeConfirmar = status === "sem-dados" || (status === "aguardando-confirmacao" && candidato);
    if (!podeConfirmar) {
      if (numero.length > 0 && numero.length < cargo.digits) {
        setStatus("incompleto");
      }
      return;
    }

    confirmados.current[cargo.position] = [...(confirmados.current[cargo.position] ?? []), numero];
    tocarConfirmacao();
    setStatus("confirmado");
    setBloqueado(true);
    setTimeout(avancarCargo, 1200);
  }

  function votarBranco() {
    if (bloqueado || finalizada || status === "confirmado" || status === "legenda" || status === "branco") return;

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

      if (proximoIndex >= votos.length) {
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
      confirmados.current = {};
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
  const nomeNaTela =
    status === "branco"
      ? "VOTO EM BRANCO"
      : status === "legenda"
        ? "VOTO DE LEGENDA"
        : status === "sem-dados" || (status === "confirmado" && !candidato)
          ? "Sem candidato cadastrado no Votus"
          : mostrandoCandidato && candidato
            ? candidato.ballot_name
            : "—";

  return (
    <div className="w-full max-w-4xl">
      <audio ref={somClique} preload="auto" src="/SimuladorUrnaElementos/som-clique.mp3" />
      <audio ref={somConfirmacao} preload="auto" src="/SimuladorUrnaElementos/som-confirmacao.mp3" />

      {/* Estrutura: Tela em cima + Teclado embaixo */}
      <div className="flex flex-col items-stretch gap-4 md:gap-6">
        {/* ===================== VISOR ===================== */}
        <div className="relative min-w-0 w-full rounded-lg bg-[#f7f2df] p-3 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)] sm:rounded-xl sm:p-6 md:rounded-2xl md:p-10">
          {finalizada && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center rounded-lg bg-[#f7f2df] p-4 sm:rounded-xl sm:p-6 md:rounded-2xl md:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/SimuladorUrnaElementos/fim.png" alt="Votação encerrada" className="max-h-full max-w-full object-contain" />
            </div>
          )}

          <div className="relative z-10 flex items-start justify-between gap-1 sm:gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-10 shrink-0 sm:w-16 md:w-24" src="/IconeVotus.svg" alt="Votus" />
            <div className="text-right text-[8px] font-black uppercase leading-tight tracking-[0.1em] text-[#e3a99a] sm:text-xs sm:tracking-[0.2em] md:text-sm md:tracking-[0.3em]">
              Ilustrativo
            </div>
          </div>

          <div className="relative z-10 mt-2 grid grid-cols-[1fr_80px] items-start gap-3 sm:mt-4 sm:grid-cols-[1fr_140px] sm:gap-6 md:mt-8 md:grid-cols-[1fr_260px] md:gap-10">
            <div className="min-w-0">
              <div className="break-words text-xs font-black uppercase leading-tight text-[#1b623a] sm:text-2xl md:text-5xl">
                {finalizada ? "Votação encerrada" : cargo.label}
              </div>

              <div className="mt-1 text-[8px] font-bold uppercase leading-tight tracking-wider text-[#d9660d] sm:mt-2 sm:text-xs md:mt-3 md:text-sm">
                {finalizada
                  ? "Obrigado por votar"
                  : cargo.allowsPartyVote
                    ? "Digite o número do candidato ou só os 2 do partido"
                    : "Digite o número do candidato"}
              </div>

              <div
                className="mt-2 flex min-h-[30px] flex-wrap items-center gap-1 sm:mt-4 sm:min-h-[46px] sm:gap-2 md:mt-6 md:min-h-[80px] md:gap-3"
                aria-label="Número digitado"
              >
                {Array.from({ length: cargo.digits }, (_, index) => numero[index] ?? "").map((digito, index) => (
                  <div
                    key={index}
                    aria-label={`Dígito ${index + 1}`}
                    className={`flex h-[30px] w-[22px] items-center justify-center rounded border text-sm font-bold transition-colors duration-150 sm:h-[48px] sm:w-[36px] sm:rounded-md sm:border-2 sm:text-2xl md:h-20 md:w-16 md:text-4xl ${
                      digito ? "border-[#1b623a] bg-[#eaf6ee] text-[#1b623a]" : "border-[#1b623a] text-[#1b623a]"
                    }`}
                  >
                    {digito}
                  </div>
                ))}
              </div>

              <div className="mt-2 space-y-0.5 border-t border-dashed border-[#1b623a]/30 pt-1.5 sm:mt-5 sm:space-y-1 sm:border-t-2 sm:pt-3 md:mt-8 md:space-y-2 md:pt-6">
                <div className="text-[10px] leading-tight sm:text-sm md:text-base">
                  <span className="font-bold text-[#1b623a]">Nome:</span>
                  <span className="ml-1 text-[#1b623a]">{nomeNaTela}</span>
                </div>
                <div className="text-[10px] leading-tight sm:text-sm md:text-base">
                  <span className="font-bold text-[#1b623a]">Partido:</span>
                  <span className="ml-1 text-[#1b623a]">
                    {mostrandoCandidato && candidato ? candidato.party.acronym ?? candidato.party.name ?? "—" : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative aspect-square w-full shrink-0">
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
                      <User size={56} strokeWidth={1.5} className="h-1/2 w-1/2 text-[#1b623a]/40" />
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
            className={`relative z-10 mt-2 break-words border-t border-[#7a0e0e]/30 pt-2 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wide transition-colors duration-300 sm:mt-5 sm:border-t-2 sm:pt-3 sm:text-xs md:mt-10 md:pt-5 md:text-xl ${mensagem.classe}`}
          >
            {finalizada ? "" : mensagem.texto}
          </div>

          <div className="relative z-10 mt-2 flex items-center justify-between gap-1 sm:mt-4 sm:gap-3 md:mt-6">
            <div className="text-[8px] font-black uppercase leading-tight tracking-[0.1em] text-[#e3a99a] sm:text-xs sm:tracking-[0.2em] md:text-sm md:tracking-[0.3em]">
              Ilustrativo
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-10 shrink-0 sm:w-16 md:w-24" src="/IconeVotus.svg" alt="Votus" />
          </div>
        </div>

        {/* ===================== TECLADO ===================== */}
        <div className="mx-auto mt-2 grid w-full max-w-[280px] grid-cols-[repeat(3,1fr)_0.9fr] grid-rows-[repeat(4,42px)] gap-1.5 sm:mt-4 sm:max-w-[340px] sm:grid-rows-[repeat(4,48px)] sm:gap-2 md:mt-5 md:max-w-[380px] md:grid-cols-[repeat(3,1fr)_0.95fr] md:grid-rows-[repeat(4,58px)] md:gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digito, index) => (
            <button
              key={digito}
              type="button"
              aria-label={`Número ${digito}`}
              disabled={bloqueado || finalizada}
              onClick={() => digitar(String(digito))}
              style={{ gridColumn: (index % 3) + 1, gridRow: Math.floor(index / 3) + 1 }}
              className="rounded-[4px] bg-brasil-orange text-sm font-bold text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40 sm:rounded-[7px] sm:text-lg"
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
            className="rounded-[4px] bg-brasil-gold text-[7.5px] font-bold leading-[1.05] text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40 sm:rounded-[7px] sm:text-[9px] sm:leading-tight"
          >
            BRANCO
          </button>

          <button
            type="button"
            aria-label="Corrigir"
            disabled={bloqueado || finalizada}
            onClick={corrigir}
            style={{ gridColumn: 4, gridRow: 2 }}
            className="rounded-[4px] bg-brasil-red text-[7.5px] font-bold leading-[1.05] text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40 sm:rounded-[7px] sm:text-[9px] sm:leading-tight"
          >
            CORRIGE
          </button>

          <button
            type="button"
            aria-label="Confirmar voto"
            disabled={bloqueado || finalizada}
            onClick={confirmar}
            style={{ gridColumn: 4, gridRow: "3 / span 2" }}
            className="rounded-[4px] bg-brasil-green text-[8.5px] font-bold leading-[1.05] text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40 sm:rounded-[7px] sm:text-[10px] sm:leading-tight"
          >
            CONFIRMA
          </button>

          <button
            type="button"
            aria-label="Número 0"
            disabled={bloqueado || finalizada}
            onClick={() => digitar("0")}
            style={{ gridColumn: 2, gridRow: 4 }}
            className="rounded-[4px] bg-brasil-orange text-sm font-bold text-white transition-transform duration-75 ease-out active:scale-95 active:brightness-90 disabled:opacity-40 sm:rounded-[7px] sm:text-lg"
          >
            0
          </button>
        </div>
      </div>

      <p className="mt-2 text-center text-[9px] text-ink-soft sm:mt-4 sm:text-[11px]">
        Voto {cargoIndex + 1} de {votos.length} · {descricao}
        {cargo.candidateOffice
          ? ` · candidatos de 2026${cargo.position === "presidente" ? "" : " no Ceará"}`
          : " · sem candidatos no Votus"}
      </p>
    </div>
  );
}
