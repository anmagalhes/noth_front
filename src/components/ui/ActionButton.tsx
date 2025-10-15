'use client';

import React, { useRef } from 'react';
import { FiMousePointer } from 'react-icons/fi';

type Variant = 'edit' | 'delete';

type Props = {
  variant: Variant;
  label?: string;
  icon: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function FancyActionButton({ variant, label, icon, className = '', onClick, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // posição relativa ao botão
    const y = e.clientY - rect.top;

    // Atualiza variáveis CSS para o spotlight
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);

    // Move o ícone do mouse (sem re-render)
    if (iconRef.current) {
      iconRef.current.style.left = `${x}px`;
      iconRef.current.style.top = `${y}px`;
    }
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.className =
        'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-30 animate-ping';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = ripple.style.height = '140px';
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    onClick?.(e);
  }

  const isEdit = variant === 'edit';
  const colorBase = isEdit
    ? 'text-blue-600 hover:text-blue-700 focus-visible:ring-blue-500/40'
    : 'text-red-600 hover:text-red-700 focus-visible:ring-red-500/40';

  // Spotlight suave que segue o mouse (usa CSS vars)
  const spotlight =
    isEdit
      ? 'bg-[radial-gradient(120px_circle_at_var(--mx)_var(--my),theme(colors.blue.50),transparent_60%)]'
      : 'bg-[radial-gradient(120px_circle_at_var(--mx)_var(--my),theme(colors.red.50),transparent_60%)]';

  return (
    <button
      ref={ref}
      type="button"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={[
        'relative group inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0',
        spotlight,
        colorBase,
        className,
      ].join(' ')}
      {...rest}
    >
      {/* Camada para conter ripple sem vazar */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-md" aria-hidden />

      {/* Ícone principal (Editar/Excluir) */}
      <span className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110">
        {icon}
      </span>

      {/* Rótulo no desktop */}
      {label && (
        <span className="hidden sm:inline relative">
          {label}
          <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-current transition-all duration-200 group-hover:w-full" />
        </span>
      )}

      {/* Ícone do mouse que segue o cursor */}
      <span
        ref={iconRef}
        aria-hidden
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-70 transition-opacity duration-150"
      >
        <FiMousePointer className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
