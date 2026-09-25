"use client";

import { useState } from "react";
import type { SuggestionQuestion } from "@/services/types";
import { distribuicaoRespostas, formatarPercentual } from "@/lib/suggestionStats";

// Cores da família Votus (amarelo, verde, azul, magenta, violeta, vermelho)
// ajustadas pra ficarem distinguíveis entre si — inclusive pra daltonismo
// protan/deutan — em QUALQUER par vizinho da rosca, incluindo o fechamento
// última↔primeira fatia pra perguntas de 2 a 6 opções (ΔE >= 9,9, validado
// com o script de paleta). A ordem é fixa: a cor segue a opção, nunca o
// ranking. Não reordenar sem revalidar.
const PALETA = ["#C99400", "#1F8A4C", "#2A78D6", "#B8327A", "#5B4AB0", "#C4302B"];
// Da 7ª opção em diante a rosca agrupa numa fatia neutra ("Demais opções");
// a legenda continua listando cada uma com o próprio número.
const COR_DEMAIS = "#8A8378";

const TAMANHO = 144;
const RAIO_EXTERNO = 68;
const RAIO_INTERNO = 46;

function ponto(raio: number, angulo: number) {
  const c = TAMANHO / 2;
  return [c + raio * Math.sin(angulo), c - raio * Math.cos(angulo)];
}

function arco(inicio: number, fim: number) {
  const grande = fim - inicio > Math.PI ? 1 : 0;
  const [x1, y1] = ponto(RAIO_EXTERNO, inicio);
  const [x2, y2] = ponto(RAIO_EXTERNO, fim);
  const [x3, y3] = ponto(RAIO_INTERNO, fim);
  const [x4, y4] = ponto(RAIO_INTERNO, inicio);

  return `M${x1} ${y1} A${RAIO_EXTERNO} ${RAIO_EXTERNO} 0 ${grande} 1 ${x2} ${y2} L${x3} ${y3} A${RAIO_INTERNO} ${RAIO_INTERNO} 0 ${grande} 0 ${x4} ${y4}Z`;
}

/**
 * Distribuição das respostas de uma pergunta de múltipla escolha. Os valores
 * vêm só de `question.stats` (contagem real do backend) via
 * distribuicaoRespostas — a mesma função usada no PDF.
 */
export default function AnswersDonut({ question }: { question: SuggestionQuestion }) {
  const [ativo, setAtivo] = useState<number | null>(null);

  if (question.type !== "choice") return null;

  const { total, fatias } = distribuicaoRespostas(question);

  if (total === 0) {
    return (
      <p className="mt-3 border-t border-line pt-3 text-xs text-[#6b6255]">Nenhuma resposta recebida ainda.</p>
    );
  }

  const cor = (indice: number) => PALETA[indice] ?? COR_DEMAIS;

  // Fatias desenhadas: as 6 primeiras opções com resposta + "Demais" agrupado.
  const desenhadas: { indices: number[]; count: number; cor: string }[] = [];
  fatias.forEach((fatia, indice) => {
    if (fatia.count === 0) return;
    if (indice < PALETA.length) {
      desenhadas.push({ indices: [indice], count: fatia.count, cor: cor(indice) });
      return;
    }
    const demais = desenhadas.find((d) => d.cor === COR_DEMAIS);
    if (demais) {
      demais.indices.push(indice);
      demais.count += fatia.count;
    } else {
      desenhadas.push({ indices: [indice], count: fatia.count, cor: COR_DEMAIS });
    }
  });

  let angulo = 0;
  const arcos = desenhadas.map((d) => {
    const inicio = angulo;
    angulo += (d.count / total) * Math.PI * 2;
    return { ...d, inicio, fim: angulo };
  });

  const fatiaAtiva = ativo !== null ? fatias[ativo] : null;
  const arcoAtivo = ativo !== null ? arcos.find((a) => a.indices.includes(ativo)) : undefined;

  return (
    <div className="mt-3 flex flex-col items-center gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: TAMANHO, height: TAMANHO }}>
        <svg
          width={TAMANHO}
          height={TAMANHO}
          viewBox={`0 0 ${TAMANHO} ${TAMANHO}`}
          role="img"
          aria-label={`${question.text}: ${fatias
            .map((f) => `${f.label}, ${f.count} de ${total} (${formatarPercentual(f.share)})`)
            .join("; ")}`}
        >
          {arcos.map((a) =>
            a.fim - a.inicio >= Math.PI * 2 - 1e-9 ? (
              // Uma única opção com 100%: o arco degeneraria, então é um anel.
              <circle
                key={a.cor}
                cx={TAMANHO / 2}
                cy={TAMANHO / 2}
                r={(RAIO_EXTERNO + RAIO_INTERNO) / 2}
                fill="none"
                stroke={a.cor}
                strokeWidth={RAIO_EXTERNO - RAIO_INTERNO}
              />
            ) : (
              <path
                key={a.indices.join("-")}
                d={arco(a.inicio, a.fim)}
                fill={a.cor}
                // Contorno da cor da superfície = o respiro de 2px entre fatias.
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinejoin="round"
                opacity={arcoAtivo && arcoAtivo !== a ? 0.35 : 1}
                className="cursor-default transition-opacity"
                onMouseEnter={() => setAtivo(a.indices[0])}
                onMouseLeave={() => setAtivo(null)}
              />
            )
          )}
        </svg>

        {/* Centro: total por padrão; a opção em foco ao passar o mouse/teclado. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          {fatiaAtiva ? (
            <>
              <span className="text-lg font-black leading-none text-[#22201b]">
                {formatarPercentual(fatiaAtiva.share)}
              </span>
              <span className="mt-1 text-[10px] font-semibold leading-tight text-[#6b6255]">
                {fatiaAtiva.count} de {total}
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-black leading-none text-[#22201b]">{total}</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#6b6255]">
                {total === 1 ? "resposta" : "respostas"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legenda = tabela de dados: nome, quantidade e % de cada opção. */}
      <ul className="flex w-full min-w-0 flex-col gap-1">
        {fatias.map((fatia, indice) => (
          <li
            key={`${fatia.label}-${indice}`}
            tabIndex={0}
            onMouseEnter={() => setAtivo(indice)}
            onMouseLeave={() => setAtivo(null)}
            onFocus={() => setAtivo(indice)}
            onBlur={() => setAtivo(null)}
            className={`flex items-center gap-2 rounded-[6px] px-2 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#1B623A]/40 ${
              ativo === indice ? "bg-[#FDF8EE]" : ""
            }`}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cor(indice) }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[#22201b]" title={fatia.label}>
              {fatia.label}
              {fatia.orfa && <span className="ml-1 text-[10px] text-[#6b6255]">(opção antiga)</span>}
            </span>
            <span className="shrink-0 font-bold tabular-nums text-[#22201b]">{fatia.count}</span>
            <span className="w-12 shrink-0 text-right tabular-nums text-[#6b6255]">{formatarPercentual(fatia.share)}</span>
          </li>
        ))}
        <li className="mt-1 flex items-center justify-between border-t border-line px-2 pt-1.5 text-xs text-[#6b6255]">
          <span>Total</span>
          <span className="font-bold tabular-nums text-[#22201b]">{total}</span>
        </li>
      </ul>
    </div>
  );
}
