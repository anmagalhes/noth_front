'use client';

import { useEffect, useState } from 'react';
import useProdutos from '@/hooks/useProdutos';
import type { Produto } from '@/types/produto';

// Helpers para mapear enum com/sem acento (UI ⇄ API)
const toApiGrupoId = (g: string | undefined) => (g === 'SERVIÇO' ? 'SERVICO' : g ?? 'PRODUTO');
const toUiGrupoId = (g: string | undefined) => (g === 'SERVICO' ? 'SERVIÇO' : 'PRODUTO');

type Props = {
  produto: Produto | null; // usa seu tipo já existente
  open?: boolean;
  onUpdated?: () => void;
  onClose?: () => void;
};

export default function ProdutoEditDialog({ produto, open = false, onUpdated, onClose }: Props) {
  const { updateProduto, updating } = useProdutos();
  const [isOpen, setIsOpen] = useState(open);

  // Estado do formulário com seus campos
  const [form, setForm] = useState({
    cod_produto: '',
    produto_nome: '',
    und_servicos: '',
    grupo_id: 'PRODUTO' as 'PRODUTO' | 'SERVIÇO', // UI com acento
    tipo_produto: 1 as 1 | 2,
    componente_id: 0,
    operacao_id: 0,
    posto_trabalho_id: 0,
  });

  // Sincroniza abertura externa
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Carrega valores iniciais do produto quando recebido
  useEffect(() => {
    if (!produto) return;
    setForm({
      cod_produto: produto.cod_produto ?? '',
      produto_nome: produto.produto_nome ?? '',
      und_servicos: produto.und_servicos ?? '',
      grupo_id: toUiGrupoId(produto.grupo_id) as 'PRODUTO' | 'SERVIÇO',
      tipo_produto: (produto.tipo_produto === 2 ? 2 : 1) as 1 | 2,
      componente_id: Number(produto.componente_id ?? 0),
      operacao_id: Number(produto.operacao_id ?? 0),
      posto_trabalho_id: Number(produto.posto_trabalho_id ?? 0),
    });
  }, [produto]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    if (name === 'tipo_produto') {
      setForm((p) => ({ ...p, tipo_produto: Number(value) as 1 | 2 }));
    } else if (name.endsWith('_id')) {
      setForm((p) => ({ ...p, [name]: Number(value) }));
    } else if (name === 'grupo_id') {
      // UI permite SERVIÇO; no submit convertemos para SERVICO (API)
      setForm((p) => ({ ...p, grupo_id: value as 'PRODUTO' | 'SERVIÇO' }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  }

  function close() {
    setIsOpen(false);
    onClose?.();
  }

  function validar(): string {
    if (!form.cod_produto || !form.produto_nome || !form.und_servicos) {
      return 'Preencha Código, Nome e Unidade de serviço.';
    }
    if (!form.componente_id || !form.operacao_id || !form.posto_trabalho_id) {
      return 'Selecione/Informe Componente, Operação e Posto de Trabalho.';
    }
    return '';
  }

  function submit() {
    if (!produto) return;
    const msg = validar();
    if (msg) return alert(msg);

    const patch = {
      cod_produto: form.cod_produto,
      produto_nome: form.produto_nome,
      und_servicos: form.und_servicos,
      grupo_id: toApiGrupoId(form.grupo_id), // mapeia para API sem acento
      tipo_produto: form.tipo_produto,
      componente_id: form.componente_id,
      operacao_id: form.operacao_id,
      posto_trabalho_id: form.posto_trabalho_id,
    };

    updateProduto(
      { id: produto.id, patch },
      {
        onSuccess: () => {
          onUpdated?.();
          close();
        },
        onError: (err) => alert(err.message),
      }
    );
  }

  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !updating && close()}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Editar produto</h3>
          <button
            onClick={() => !updating && close()}
            className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 sm:col-span-4">
            <label className="text-sm text-slate-700">Código</label>
            <input
              name="cod_produto"
              value={form.cod_produto}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-12 sm:col-span-8">
            <label className="text-sm text-slate-700">Nome</label>
            <input
              name="produto_nome"
              value={form.produto_nome}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-12 sm:col-span-4">
            <label className="text-sm text-slate-700">Unidade de serviço</label>
            <input
              name="und_servicos"
              value={form.und_servicos}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-6 sm:col-span-4">
            <label className="text-sm text-slate-700">Grupo</label>
            <select
              name="grupo_id"
              value={form.grupo_id}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="PRODUTO">PRODUTO</option>
              <option value="SERVIÇO">SERVIÇO</option>
            </select>
          </div>

          <div className="col-span-6 sm:col-span-4">
            <label className="text-sm text-slate-700">Tipo</label>
            <select
              name="tipo_produto"
              value={form.tipo_produto}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value={1}>Produto</option>
              <option value={2}>Tarefa</option>
            </select>
          </div>

          <div className="col-span-12 sm:col-span-4">
            <label className="text-sm text-slate-700">Componente (ID)</label>
            <input
              name="componente_id"
              type="number"
              value={form.componente_id}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label className="text-sm text-slate-700">Operação (ID)</label>
            <input
              name="operacao_id"
              type="number"
              value={form.operacao_id}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label className="text-sm text-slate-700">Posto de Trabalho (ID)</label>
            <input
              name="posto_trabalho_id"
              type="number"
              value={form.posto_trabalho_id}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
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
            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            {updating ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
