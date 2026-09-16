'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import { getSuggestionQuestions, createSuggestion } from '@/services/suggestionsService';
import { apiErrorMessage } from '@/services/apiClient';

function ChoiceGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {options.map((option) => {
        const isSelected = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isSelected}
            className={`flex items-center gap-3 rounded-[10px] border px-4 py-3 text-left text-sm font-semibold transition-colors ${
              isSelected
                ? 'border-[#1b623a] bg-[#1b623a]/10 text-[#1b623a]'
                : 'border-[#d6d1c8] bg-[#FDF8EE] text-ink hover:border-[#1b623a]/40'
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                isSelected ? 'border-[#1b623a]' : 'border-[#d6d1c8]'
              }`}
            >
              {isSelected && <span className="h-2 w-2 rounded-full bg-[#1b623a]" />}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

const CAMPO_TEXTO_CLASS =
  'mt-3 w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 py-3 text-sm font-medium text-ink outline-none placeholder:font-normal placeholder:text-[#8a8a8a]';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">{children}</main>
      <FloatingAIButton />
    </div>
  );
}

export default function SugestoesPageClient() {
  const { data, error, isLoading } = useSWR('suggestion-questions', getSuggestionQuestions, {
    revalidateOnFocus: false,
  });
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const perguntas = data?.data ?? [];
  const canSubmit = perguntas.every((p) => !p.required || (respostas[p.id] ?? '').trim() !== '');

  function setResposta(id: number, valor: string) {
    setRespostas((prev) => ({ ...prev, [id]: valor }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || enviando) return;

    setErro(null);
    setEnviando(true);

    try {
      await createSuggestion({
        answers: perguntas
          .filter((p) => (respostas[p.id] ?? '').trim() !== '')
          .map((p) => ({ suggestion_question_id: p.id, answer: respostas[p.id].trim() })),
      });
      setEnviado(true);
    } catch (err) {
      setErro(apiErrorMessage(err, 'Não foi possível enviar sua resposta agora. Tente novamente em instantes.'));
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-6 py-8 text-center sm:px-10">
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#1b623a] sm:text-4xl">
            Obrigado por contribuir com o Votus!
          </h1>
          <p className="mt-4 max-w-md text-sm text-[#0B2A16] sm:text-base">
            Sua resposta foi enviada e vai nos ajudar a melhorar o projeto.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full px-6 py-8 sm:px-10">
        <DashboardHeader
          titleText="Sugestões"
          titleColor="text-[#1b623a]"
          titleClassName="font-heading"
          subtitle="Conte pra gente o que achou do Votus. Leva menos de um minuto."
        />

        <div className="mt-6 max-w-2xl rounded-[10px] border border-[#d6d1c8] bg-[#EDDBBA]/40 px-4 py-3 text-sm font-semibold text-[#1b623a]">
          Sua resposta é anônima. Não pedimos seu nome, e-mail ou cadastro.
        </div>

        {isLoading && <p className="mt-6 text-sm text-[#6b6255]">Carregando perguntas...</p>}

        {error && (
          <p className="mt-6 text-sm font-semibold text-[#8d0801]">
            Não foi possível carregar a pesquisa agora. Tente novamente em instantes.
          </p>
        )}

        {!isLoading && !error && (
          <form onSubmit={handleSubmit} className="mt-6 flex max-w-2xl flex-col gap-6 pb-16">
            {perguntas.map((pergunta, index) => (
              <div key={pergunta.id} className="border-t border-line pt-6">
                <h2 className="text-base font-bold text-[#1b623a]">
                  <span className="text-[#8D0801]">{index + 1}. </span>
                  {pergunta.text}
                  {!pergunta.required && (
                    <span className="ml-2 text-xs font-medium text-[#6b6255]">(opcional)</span>
                  )}
                </h2>

                {pergunta.type === 'choice' ? (
                  <ChoiceGroup
                    options={pergunta.options ?? []}
                    value={respostas[pergunta.id] ?? ''}
                    onChange={(valor) => setResposta(pergunta.id, valor)}
                  />
                ) : (
                  <textarea
                    value={respostas[pergunta.id] ?? ''}
                    onChange={(event) => setResposta(pergunta.id, event.target.value)}
                    placeholder="Escreva aqui..."
                    maxLength={5000}
                    className={`${CAMPO_TEXTO_CLASS} min-h-[140px]`}
                  />
                )}
              </div>
            ))}

            {erro && <p className="text-sm font-semibold text-[#8d0801]">{erro}</p>}

            <button
              type="submit"
              disabled={!canSubmit || enviando}
              className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-[#1b623a] px-8 text-base font-bold text-white transition-colors hover:bg-[#164f30] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-14"
            >
              {enviando ? 'Enviando...' : 'Enviar sugestão'}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
