'use client';

import { useRef } from 'react';

export default function SantinhoCandidateInput({
  digitos,
  numero,
  onChange,
  invalid = false,
}: {
  digitos: number;
  numero: string;
  onChange: (numero: string) => void;
  invalid?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length: digitos }, (_, index) => numero[index] ?? ' ');

  function setDigitAt(index: number, value: string) {
    const next = [...digits];
    next[index] = value || ' ';
    onChange(next.join(''));
  }

  function handleChange(index: number, rawValue: string) {
    const digit = rawValue.replace(/\D/g, '').slice(-1);

    setDigitAt(index, digit);

    if (digit && index < digitos - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      if (digits[index] !== ' ') {
        setDigitAt(index, '');
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigitAt(index - 1, '');
      }
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < digitos - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;

    event.preventDefault();

    const next = [...digits];
    for (let offset = 0; offset < pasted.length && index + offset < digitos; offset += 1) {
      next[index + offset] = pasted[offset];
    }
    onChange(next.join(''));

    const lastFilled = Math.min(index + pasted.length, digitos - 1);
    inputRefs.current[lastFilled]?.focus();
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit === ' ' ? '' : digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          aria-label={`Dígito ${index + 1}`}
          className={`h-10 w-10 shrink-0 rounded-[8px] border bg-white text-center text-base font-bold text-[#8d0801] outline-none focus:border-[#8d0801] focus:ring-2 focus:ring-[#8d0801]/20 sm:h-11 sm:w-11 ${
            invalid ? 'border-[#8d0801]' : 'border-[#8d0801]/35'
          }`}
        />
      ))}
    </div>
  );
}
