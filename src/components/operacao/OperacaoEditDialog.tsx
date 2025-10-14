'use client';

import { useEffect, useState } from 'react';
import useOperacoes from '@/hooks/useOperacoesWS';
import type { OperacaoItem } from '@/types/operacao';

type Props = {
  operacao: OperacaoItem | null;
  open?: boolean;
  onUpdated?: () => void;
  onClose?: () => void;
};

export default function OperacaoEditDialog({ operacao, open = false, onUpdated, onClose }: Props) {
  const { updateOperacao, updating } = useOperacoes();
  const [isOpen, setIsOpen] = useState(open);

  const [form, setForm] = useState({
    op_nome: '',
    op_grupo_processo: '',
  });

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    if (!operacao) return;
    setForm({
      op_nome: operacao.op_nome ?? '',
      op_grupo_processo: operacao.op_grupo_processo ?? '',
    });
  }, [operacao]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function close() {
    setIsOpen(false);
    onClose?.();
  }

  function validar(): string {
    if (!form.op_nome || !form.op_grupo_processo) {
      return 'Preencha o nome da operação e o grupo de processo.';
    }
    return '';
  }

  function submit() {
    if (!operacao) return;
    const msg = validar();
    if (msg) return alert(msg);

    updateOperacao(
      { id: operacao.id, patch: form },
      {
        onSuccess: () => {
          onUpdated?.();
          close();
        },
        onError: (err) => alert(err.message),
      }
    );
  }

  if (!isOpen || !operacao) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !updating && close()}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Editar operação</h3>
          <button
            onClick={() => !updating && close()}
            className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-700">Grupo de Processo</label>
            <input
              name="op_grupo_processo"
              value={form.op_grupo_processo}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              maxLength={3}
              placeholder="Ex: GRP"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Nome da Operação</label>
            <input
              name="op_nome"
              value={form.op_nome}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              maxLength={150}
              placeholder="Ex: Corte de chapa"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            disabled={updating}
            onClick={close}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            disabled={updating}
            onClick={submit}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {updating ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
