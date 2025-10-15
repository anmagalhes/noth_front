'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Cliente_Modal';
import usePostosTrabalho from '@/hooks/usePostosTrabalhoWs';
import type { PostoTrabalhoCreate } from '@/types/posto_trabalho';

type Props = {
  onCreated?: () => void;
  trigger?: React.ReactNode;
};

export default function PostoTrabalhoCreateDialog({ onCreated, trigger }: Props) {
  const { createPosto, creating } = usePostosTrabalho();
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string>('');
  const [nome, setNome] = useState('');

  function validar(): string {
    if (!nome.trim()) return 'Informe o nome do Posto de Trabalho.';
    return '';
  }

  function submit() {
    const msg = validar();
    if (msg) {
      setErro(msg);
      return;
    }
    setErro('');
    const payload: PostoTrabalhoCreate = { posto_trabalho_nome: nome.trim() };

    createPosto(payload, {
      onSuccess: () => {
        onCreated?.();
        setOpen(false);
        setNome('');
      },
      onError: (err: any) => {
        const txt = err?.message || 'Erro ao criar posto de trabalho';
        if (/duplicad|unique|exists/i.test(txt)) {
          setErro('Já existe um posto de trabalho com esse nome.');
        } else {
          setErro(txt);
        }
      },
    });
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-green-700"
        >
          Novo Posto de Trabalho
        </button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo Posto de Trabalho"
        size="lg"
        fullScreenOnMobile
      >
        {!!erro && <p className="mb-3 text-sm text-red-600">{erro}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome do Posto de Trabalho
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={50}
              placeholder="Ex.: Linha 01 - Montagem"
              className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">{nome.length}/50</p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={creating}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-60"
            >
              {creating ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
