'use client';

import React, { useEffect, useRef, useState } from 'react';
import usePostosTrabalho from '@/hooks/usePostosTrabalhoWs';
import type { PostoTrabalhoItem } from '@/types/posto_trabalho';

type Props = {
  posto: PostoTrabalhoItem | null;
  open?: boolean;
  onUpdated?: () => void;
  onClose?: () => void;
};

export default function PostoTrabalhoEditDialog({
  posto,
  open = false,
  onUpdated,
  onClose,
}: Props) {
  const { updatePosto, updating } = usePostosTrabalho();
  const [isOpen, setIsOpen] = useState(open);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const titleId = 'edit-posto-title';

  // Sincroniza abertura externa e limpa erro
  useEffect(() => {
    setIsOpen(open);
    if (open) setErro('');
  }, [open]);

  // Carrega valores iniciais ao receber `posto`
  useEffect(() => {
    if (!posto) return;
    setNome(posto.posto_trabalho_nome ?? '');
  }, [posto]);

  // Foco automático no input quando abrir
  useEffect(() => {
    if (isOpen) {
      // espera um tick para garantir que renderizou
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Fecha com ESC (se não estiver salvando)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !updating) {
        close();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, updating]);

  function close() {
    setIsOpen(false);
    onClose?.();
  }

  function validar(): string {
    if (!nome.trim()) return 'Informe o nome do Posto de Trabalho.';
    return '';
  }

  function submit() {
    if (!posto) return;
    const msg = validar();
    if (msg) {
      setErro(msg);
      return;
    }

    const patch = {
      posto_trabalho_nome: nome.trim(),
      // Se o backend exigir `data_execucao` no PUT, reenvie junto:
      // data_execucao: posto.data_execucao,
    };

    setErro('');
    updatePosto(
      { id: posto.id, patch },
      {
        onSuccess: () => {
          onUpdated?.();
          close();
        },
        onError: (err: any) => {
          const txt = err?.message || 'Erro ao atualizar posto de trabalho';
          if (/duplicad|unique|exists/i.test(txt)) {
            setErro('Já existe um posto de trabalho com esse nome.');
          } else {
            setErro(txt);
          }
        },
      },
    );
  }

  if (!isOpen || !posto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !updating && close()}
      />
      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-semibold">
            Editar Posto de Trabalho
          </h3>
          <button
            onClick={() => !updating && close()}
            className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>

        {!!erro && (
          <p className="mb-3 text-sm text-red-600">
            {erro}
          </p>
        )}

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12">
            <label className="text-sm text-slate-700">Nome do Posto de Trabalho</label>
            <input
              ref={inputRef}
              name="posto_trabalho_nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                }
              }}
              maxLength={50}
              placeholder="Ex.: Linha 01 - Montagem"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">{nome.length}/50</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={() => !updating && close()}
            className="rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={updating || !nome.trim()}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {updating ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
