'use client';

import React, { useEffect, useRef, useState } from 'react';
import useProdutos from '@/hooks/useProdutos';
import type { Produto as ProdutoDTO } from '@/types/produto';

type Props = {
  produto: ProdutoDTO | null;
  open?: boolean;
  onUpdated?: () => void;
  onClose?: () => void;
};

export default function ProdutoEditDialog({
  produto,
  open = false,
  onUpdated,
  onClose,
}: Props) {
  // Você pode passar params reais se precisar; para a mutation, não é necessário
  const { updateProduto, updating } = useProdutos({ page: 1, pageSize: 1 });

  const [cod, setCod] = useState('');
  const [nome, setNome] = useState('');
  const [grupo, setGrupo] = useState<'PRODUTO' | 'SERVIÇO' | 'SERVICO' | ''>('');
  const [tipo, setTipo] = useState<'1' | '2' | ''>('');
  const [undServ, setUndServ] = useState('');

  const [erro, setErro] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isOpen = !!produto && open;
  const titleId = 'edit-produto-title';

  // Carrega os valores ao abrir
  useEffect(() => {
    if (isOpen && produto) {
      setCod(String((produto as any).cod_produto ?? ''));
      setNome(String((produto as any).produto_nome ?? ''));
      const g = (produto as any).grupo_id ?? '';
      setGrupo(g === 'SERVICO' ? 'SERVIÇO' : (g || '')); // exibe com acento
      const t = (produto as any).tipo_produto;
      setTipo(t === 1 || t === '1' ? '1' : t === 2 || t === '2' ? '2' : '');
      setUndServ(String((produto as any).und_servicos ?? ''));
      setErro('');
    }
  }, [isOpen, produto]);

  // Foco automático
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Fechar com ESC
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
    onClose?.();
  }

  function validar(): string {
    if (!cod.trim()) return 'Informe o código do produto.';
    if (!nome.trim()) return 'Informe o nome do produto.';
    if (!grupo) return 'Selecione o grupo.';
    if (!tipo) return 'Selecione o tipo.';
    return '';
  }

  function submit() {
    if (!produto) return;
    const msg = validar();
    if (msg) {
      setErro(msg);
      return;
    }

    // Normaliza grupo com backend (sem acento)
    const grupo_backend = grupo === 'SERVIÇO' ? 'SERVICO' : grupo;

    const patch: any = {
      cod_produto: cod.trim(),
      produto_nome: nome.trim(),
      grupo_id: grupo_backend,
      tipo_produto: tipo === '2' ? 2 : 1,
      und_servicos: undServ.trim(),
    };

    setErro('');
    updateProduto(
      { id: (produto as any).id, patch },
      {
        onSuccess: () => {
          onUpdated?.();
          close();
        },
        onError: (err: any) => {
          const txt = err?.message || 'Erro ao atualizar produto';
          if (/duplicad|unique|exists/i.test(txt)) {
            setErro('Já existe um produto com esse código/nome.');
          } else {
            setErro(txt);
          }
        },
      }
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !updating && close()}
      />
      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-semibold">Editar Produto</h3>
          <button
            type="button"
            onClick={() => !updating && close()}
            className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
          >
            Fechar
          </button>
        </div>

        {!!erro && <p className="mb-3 text-sm text-red-600">{erro}</p>}

        <div className="grid grid-cols-12 gap-3">
          {/* Código */}
          <div className="col-span-12 sm:col-span-4">
            <label className="text-sm text-slate-700">Código</label>
            <input
              ref={inputRef}
              value={cod}
              onChange={(e) => setCod(e.target.value)}
              maxLength={50}
              placeholder="Ex.: P-00001"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Nome */}
          <div className="col-span-12 sm:col-span-8">
            <label className="text-sm text-slate-700">Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={120}
              placeholder="Ex.: Produto XYZ"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Grupo */}
          <div className="col-span-12 sm:col-span-4">
            <label className="text-sm text-slate-700">Grupo</label>
            <select
              value={grupo}
              onChange={(e) => setGrupo(e.target.value as any)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">Selecione...</option>
              <option value="PRODUTO">Produto</option>
              <option value="SERVIÇO">Serviço</option>
            </select>
          </div>

          {/* Tipo */}
          <div className="col-span-12 sm:col-span-4">
            <label className="text-sm text-slate-700">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">Selecione...</option>
              <option value="1">Produto</option>
              <option value="2">Tarefa</option>
            </select>
          </div>

          {/* Unidade de Serviços (opcional) */}
          <div className="col-span-12 sm:col-span-4">
            <label className="text-sm text-slate-700">Unid. Serviços</label>
            <input
              value={undServ}
              onChange={(e) => setUndServ(e.target.value)}
              maxLength={50}
              placeholder="Ex.: UND01"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => !updating && close()}
            className="rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={updating || !cod.trim() || !nome.trim() || !grupo || !tipo}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            {updating ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
