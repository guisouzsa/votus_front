'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, Download, RotateCcw, Share2, X } from 'lucide-react';
import { SITE_URL } from '@/lib/siteConfig';
import { SHARE_GROUP_LABELS, type ShareFieldGroup, type ShareProfile } from './shareCardData';
import {
  DEFAULT_DESIGN,
  SHARE_ACCENTS,
  SHARE_BACKGROUNDS,
  SHARE_FORMATS,
  SHARE_TEMPLATES,
  canvasToPng,
  effectiveAccent,
  loadShareAssets,
  renderShareCard,
  type ShareAssets,
  type ShareDesign,
  type ShareFormat,
  type ShareTemplate,
} from './shareCardCanvas';

function siteHost(): string {
  try {
    const host = new URL(SITE_URL).host;
    return host.startsWith('localhost') ? window.location.host : host;
  } catch {
    return window.location.host;
  }
}

function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 border-t border-line pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#1B623A]">{title}</legend>
      {children}
    </fieldset>
  );
}

/** Botões de escolha única no padrão pílula do Votus (role=radio). */
function Pills<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string; hint?: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={`inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A] ${
            o.id === value ? 'border-[#1B623A] bg-[#1B623A] text-white' : 'border-[#EDDBBA] bg-[#FDF8EE] text-[#1B623A] hover:border-[#1B623A]/40'
          }`}
        >
          {o.label}
          {o.hint && <span className={o.id === value ? 'font-semibold text-white/80' : 'font-semibold text-ink-soft'}>{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

/** Amostras de cor (fundo e destaque), escolha única, com nome acessível. */
function Swatches({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: string; label: string; css: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            title={o.label}
            onClick={() => onChange(o.id)}
            className={`relative h-10 w-10 rounded-full border border-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A] ${
              active ? 'ring-2 ring-[#1B623A] ring-offset-2' : ''
            }`}
            style={{ background: o.css }}
          >
            {active && (
              <Check size={16} aria-hidden="true" className="absolute inset-0 m-auto rounded-full bg-white/90 p-0.5 text-[#1B623A]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Popup de compartilhamento: prévia do card (o próprio canvas exportado),
 * escolha dos dados, personalização visual e as ações de baixar/compartilhar.
 * Fica montado enquanto o perfil estiver aberto, para guardar as escolhas
 * entre uma abertura e outra.
 */
export default function ShareCardEditor({
  profile,
  open,
  onClose,
}: {
  profile: ShareProfile;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const defaults = useMemo(() => profile.fields.filter((f) => f.defaultOn).map((f) => f.id), [profile]);
  const [selected, setSelected] = useState<string[]>(defaults);
  const [design, setDesign] = useState<ShareDesign>(DEFAULT_DESIGN);
  const [assets, setAssets] = useState<ShareAssets | null>(null);
  const [omitted, setOmitted] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Foto, logo e fontes: uma vez só, na primeira abertura.
  useEffect(() => {
    if (!open || assets) return;
    let cancelled = false;
    loadShareAssets(profile.photoUrl).then((loaded) => {
      if (!cancelled) setAssets(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [open, assets, profile.photoUrl]);

  // Redesenha a prévia a cada mudança — é a mesma imagem que será exportada.
  useEffect(() => {
    if (!open || !assets || !canvasRef.current) return;
    const result = renderShareCard(canvasRef.current, profile, selected, design, assets, siteHost());
    setOmitted(result.omitted);
  }, [open, assets, profile, selected, design]);

  // Abrir: foco no fechar e página de trás sem rolagem. Fechar: devolve.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    // Mantém o Tab dentro do popup.
    if (event.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const fileName = `votus-${slug(profile.name)}-${design.format}.png`;

  const download = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToPng(canvasRef.current);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const onDownload = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await download();
      setStatus('Imagem baixada.');
    } catch {
      setStatus('Não foi possível gerar a imagem. Tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  // Compartilhamento nativo do navegador (abre o menu do sistema; o Votus não
  // publica nada sozinho). Sem suporte a arquivos, baixa a imagem.
  const onShare = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    setStatus(null);
    try {
      const blob = await canvasToPng(canvasRef.current);
      const file = new File([blob], fileName, { type: 'image/png' });
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: profile.name, text: `${profile.name} no Votus` });
        setStatus('Menu de compartilhamento aberto.');
      } else {
        await download();
        setStatus('Este navegador não compartilha imagens diretamente; a imagem foi baixada para você enviar.');
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setStatus('Não foi possível compartilhar. Use “Baixar imagem”.');
      }
    } finally {
      setBusy(false);
    }
  };

  const groups = (['identificacao', 'atuacao', 'perfil'] as ShareFieldGroup[])
    .map((g) => ({ group: g, fields: profile.fields.filter((f) => f.group === g) }))
    .filter((g) => g.fields.length > 0);
  const accentAdjusted = SHARE_ACCENTS.find((a) => a.id === design.accentId)?.color !== effectiveAccent(design);

  // Portal no <body>: nenhum contêiner do perfil (overflow, transform,
  // z-index) consegue cortar ou esconder o popup, no celular ou no desktop.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-stretch justify-center bg-black/50 md:items-center md:p-6" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
        className="flex h-full w-full flex-col overflow-hidden bg-[#FDFDFD] md:h-auto md:max-h-[92vh] md:max-w-5xl md:rounded-2xl md:shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-black text-[#1B623A] sm:text-lg">
              Compartilhar informações
            </h2>
            <p className="truncate text-xs text-ink-soft">{profile.name}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[#1B623A]"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:grid-cols-[minmax(0,1fr)_22rem] md:overflow-hidden">
          {/* Prévia: o canvas na resolução final, reduzido pela tela. */}
          <div className="flex shrink-0 items-center justify-center bg-[#eee8dc] p-4 md:min-h-0 md:p-6">
            {!assets && (
              <p role="status" className="text-sm font-semibold text-ink-soft">
                Preparando a prévia…
              </p>
            )}
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Prévia do card de ${profile.name}`}
              className={`h-auto max-h-[42vh] w-auto max-w-full rounded-lg shadow-md md:max-h-[calc(92vh-11rem)] ${assets ? '' : 'hidden'}`}
            />
          </div>

          {/* Controles */}
          <div className="space-y-4 px-4 py-4 sm:px-5 md:min-h-0 md:overflow-y-auto">
            <Section title="O que compartilhar?">
              <p className="mb-2 text-xs text-ink-soft">Nome e cargo sempre aparecem.</p>
              {groups.map(({ group, fields }) => (
                <div key={group} className="mb-2 last:mb-0">
                  <p className="text-[11px] font-semibold text-ink-soft">{SHARE_GROUP_LABELS[group]}</p>
                  <ul className="mt-1 space-y-0.5">
                    {fields.map((f) => (
                      <li key={f.id}>
                        <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm text-ink">
                          <input
                            type="checkbox"
                            checked={selected.includes(f.id)}
                            onChange={() => toggle(f.id)}
                            className="h-4 w-4 shrink-0 accent-[#1B623A]"
                          />
                          <span className="min-w-0">
                            {f.label}
                            <span className="ml-1 text-xs text-ink-soft">({f.value})</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {omitted.length > 0 && (
                <p role="status" className="mt-2 rounded-lg bg-[#fdf3e7] p-2.5 text-xs text-[#7a4a00]">
                  Não couberam neste formato: {omitted.join(', ')}. Desmarque algum item ou use Stories (9:16).
                </p>
              )}
            </Section>

            <Section title="Formato">
              <Pills<ShareFormat>
                label="Formato da imagem"
                value={design.format}
                onChange={(format) => setDesign((d) => ({ ...d, format }))}
                options={(Object.keys(SHARE_FORMATS) as ShareFormat[]).map((id) => ({
                  id,
                  label: SHARE_FORMATS[id].label,
                  hint: SHARE_FORMATS[id].hint,
                }))}
              />
            </Section>

            <Section title="Modelo">
              <Pills<ShareTemplate>
                label="Modelo do card"
                value={design.template}
                onChange={(template) => setDesign((d) => ({ ...d, template }))}
                options={(Object.keys(SHARE_TEMPLATES) as ShareTemplate[]).map((id) => ({ id, label: SHARE_TEMPLATES[id] }))}
              />
            </Section>

            <Section title="Fundo">
              {[
                { title: 'Sólidos', list: SHARE_BACKGROUNDS.filter((b) => b.colors.length === 1) },
                { title: 'Gradientes', list: SHARE_BACKGROUNDS.filter((b) => b.colors.length > 1) },
              ].map(({ title, list }) => (
                <div key={title} className="mb-3 last:mb-0">
                  <p className="mb-1.5 text-[11px] font-semibold text-ink-soft">{title}</p>
                  <Swatches
                    label={`Fundos ${title.toLowerCase()}`}
                    value={design.backgroundId}
                    onChange={(backgroundId) => setDesign((d) => ({ ...d, backgroundId }))}
                    options={list.map((b) => ({
                      id: b.id,
                      label: b.colors.length > 1 ? `Gradiente ${b.label}` : `Fundo ${b.label}`,
                      css: b.colors.length > 1 ? `linear-gradient(135deg, ${b.colors.join(', ')})` : b.colors[0],
                    }))}
                  />
                </div>
              ))}
            </Section>

            <Section title="Cor de destaque">
              <Swatches
                label="Cor de destaque"
                value={design.accentId}
                onChange={(accentId) => setDesign((d) => ({ ...d, accentId: accentId as ShareDesign['accentId'] }))}
                options={SHARE_ACCENTS.map((a) => ({ id: a.id, label: a.label, css: a.color }))}
              />
              {accentAdjusted && (
                <p className="mt-2 text-xs text-ink-soft">Essa cor some neste fundo; o card usa a cor do texto para manter a leitura.</p>
              )}
            </Section>

            <Section title="Foto">
              <label className={`flex min-h-9 items-center gap-2.5 text-sm ${assets?.photo ? 'cursor-pointer text-ink' : 'text-ink-soft'}`}>
                <input
                  type="checkbox"
                  checked={design.showPhoto && Boolean(assets?.photo)}
                  disabled={!assets?.photo}
                  onChange={() => setDesign((d) => ({ ...d, showPhoto: !d.showPhoto }))}
                  className="h-4 w-4 shrink-0 accent-[#1B623A]"
                />
                Mostrar foto
              </label>
              {assets && !assets.photo && <p className="text-xs text-ink-soft">Foto indisponível para este perfil.</p>}
            </Section>
          </div>
        </div>

        {/* pb com safe-area: no iPhone os botões não ficam sob a barra de gestos. */}
        <footer className="border-t border-line px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <p aria-live="polite" className="mb-2 min-h-4 text-xs font-semibold text-[#1B623A] empty:mb-0 empty:min-h-0">
            {status}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-full border border-[#EDDBBA] px-4 text-sm font-semibold text-[#1B623A] hover:bg-[#FDF8EE]"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setDesign(DEFAULT_DESIGN);
                  setStatus('Visual padrão restaurado.');
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[#1B623A] hover:bg-[#FDF8EE]"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Restaurar padrão
              </button>
            </div>
            <div className="flex flex-1 gap-2 sm:flex-none">
              <button
                type="button"
                onClick={onDownload}
                disabled={!assets || busy}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#1B623A] px-4 text-sm font-semibold text-[#1B623A] hover:bg-[#1B623A]/5 disabled:opacity-50 sm:flex-none"
              >
                <Download size={16} aria-hidden="true" />
                Baixar imagem
              </button>
              <button
                type="button"
                onClick={onShare}
                disabled={!assets || busy}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1B623A] px-4 text-sm font-semibold text-white hover:bg-[#103D23] disabled:opacity-60 sm:flex-none"
              >
                <Share2 size={16} aria-hidden="true" />
                Compartilhar
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
