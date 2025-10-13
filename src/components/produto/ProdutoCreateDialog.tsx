'use client';

import { useState } from 'react';
import useProdutos from '@/hooks/useProdutos';
import type { ProdutoCreate } from '@/types/produto';
import { useOptions } from '@/hooks/useOptions';

type Props = {
  onCreated?: () => void;
  trigger?: React.ReactNode;
};

type Option = { id: number; nome: string }; // ajuste se sua API retornar outro shape

export default function ProdutoCreateDialog({ onCreated, trigger }: Props) {
  const { createProduto, creating } = useProdutos();
  const [open, setOpen] = useState(false);

  // Fallback seguro para evitar `undefined.map` no primeiro render
  const {
    options: componentes = [],
    isLoading: loadingComponentes = true,
  } = useOptions<Option>('/api/componentes/options') ?? { options: [], isLoading: true };

  const {
    options: operacoes = [],
    isLoading: loadingOperacoes = true,
  } = useOptions<Option>('/api/operacoes/options') ?? { options: [], isLoading: true };

  const {
    options: postos = [],
    isLoading: loadingPostos = true,
  } = useOptions<Option>('/api/postos-trabalho/options') ?? { options: [], isLoading: true };

  const {
    options: fornecedores = [],
    isLoading: loadingFornecedores = true,
  } = useOptions<Option>('/api/fornecedores/options') ?? { options: [], isLoading: true };

  const [form, setForm] = useState<ProdutoCreate>({
    cod_produto: '',
    produto_nome: '',
    und_servicos: '',
    grupo_id: 'PRODUTO',
    tipo_produto: 1,
    componente_id: 0,
    operacao_id: 0,
    posto_trabalho_id: 0,
    fornecedor_ids: [],
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name === 'tipo_produto') {
      setForm((p) => ({ ...p, tipo_produto: Number(value) as 1 | 2 }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  }

  function handleNumber(name: keyof ProdutoCreate, value: string) {
    setForm((p) => ({ ...p, [name]: Number(value) }));
  }

  function toggleFornecedor(id: number) {
    setForm((p) => ({
      ...p,
      fornecedor_ids: p.fornecedor_ids.includes(id)
        ? p.fornecedor_ids.filter((x) => x !== id)
        : [...p.fornecedor_ids, id],
    }));
  }

  function validar() {
    if (!form.cod_produto || !form.produto_nome || !form.und_servicos) {
      return 'Preencha Código, Nome e Unidade de serviço.';
    }
    if (!form.componente_id || !form.operacao_id || !form.posto_trabalho_id) {
      return 'Selecione Componente, Operação e Posto de Trabalho.';
    }
    return '';
  }

  function submit() {
    const msg = validar();
    if (msg) return alert(msg);
    createProduto(
      {
        ...form,
        componente_id: Number(form.componente_id),
        operacao_id: Number(form.operacao_id),
        posto_trabalho_id: Number(form.posto_trabalho_id),
      },
      {
        onSuccess: () => {
          onCreated?.();
          setOpen(false);
          setForm({
            cod_produto: '',
            produto_nome: '',
            und_servicos: '',
            grupo_id: 'PRODUTO',
            tipo_produto: 1,
            componente_id: 0,
            operacao_id: 0,
            posto_trabalho_id: 0,
            fornecedor_ids: [],
          });
        },
        onError: (err) => alert(err.message),
      }
    );
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)} className="inline-block">
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Novo produto
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !creating && setOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cadastrar produto</h3>
              <button
                onClick={() => !creating && setOpen(false)}
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
                  <option value="SERVICO">SERVICO</option>
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
                <label className="text-sm text-slate-700">Componente</label>
                <select
                  name="componente_id"
                  value={form.componente_id}
                  onChange={(e) => handleNumber('componente_id', e.target.value)}
                  disabled={loadingComponentes || creating}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value={0} disabled={loadingComponentes}>
                    {loadingComponentes ? 'Carregando...' : 'Selecione...'}
                  </option>
                  {componentes.length > 0 &&
                    componentes.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-span-12 sm:col-span-4">
                <label className="text-sm text-slate-700">Operação</label>
                <select
                  name="operacao_id"
                  value={form.operacao_id}
                  onChange={(e) => handleNumber('operacao_id', e.target.value)}
                  disabled={loadingOperacoes || creating}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value={0} disabled={loadingOperacoes}>
                    {loadingOperacoes ? 'Carregando...' : 'Selecione...'}
                  </option>
                  {operacoes.length > 0 &&
                    operacoes.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-span-12 sm:col-span-4">
                <label className="text-sm text-slate-700">Posto de trabalho</label>
                <select
                  name="posto_trabalho_id"
                  value={form.posto_trabalho_id}
                  onChange={(e) => handleNumber('posto_trabalho_id', e.target.value)}
                  disabled={loadingPostos || creating}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value={0} disabled={loadingPostos}>
                    {loadingPostos ? 'Carregando...' : 'Selecione...'}
                  </option>
                  {postos.length > 0 &&
                    postos.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nome}
                      </option>
                    ))}
                </select>
              </div>

              {/* TODO: Fornecedores (replicar padrão de loading + map) */}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-slate-100" disabled={creating}>
                Cancelar
              </button>
              <button
                onClick={submit}
                className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                disabled={creating}
              >
                {creating ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
