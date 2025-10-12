'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

import ModalNotificacao from '@/components/ModalNotificacao';
import ClienteCreateDialog from '@/components/cliente/ClienteCreateDialog';
import ClienteEditDialog from '@/components/cliente/ClienteEditDialog';
import ClienteDeleteDialog from '@/components/cliente/ClienteDeleteDialog';

import useClientes from '@/hooks/useClientes';
import type { Cliente as ClienteDTO } from '@/types/cliente';

export default function ClientePage() {
  const [busca, setBusca] = useState('');
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [tituloNotificacao, setTituloNotificacao] = useState('');
  const [mensagemNotificacao, setMensagemNotificacao] = useState('');

  // ✅ use o que o hook realmente expõe
  const {
    clientes,          // array de Cliente
    isLoading: loading,
    error,
    page,
    totalPages,
    total,
    // (vamos expor um 'refetch' no hook — veja o patch logo abaixo)
    refetch,
  } = useClientes();

  const erro = error instanceof Error ? error.message : '';

  // Filtro client-side
  const filtrados = useMemo(() => {
    const q = (busca ?? '').toLowerCase().trim();
    if (!q) return clientes;
    return clientes.filter((c) =>
      c.nome_cliente?.toLowerCase().includes(q) ||
      c.doc_cliente?.toLowerCase().includes(q) ||
      c.cidade_cliente?.toLowerCase().includes(q) ||
      c.uf_cliente?.toLowerCase().includes(q)
    );
  }, [clientes, busca]);

  // Seleção
  const todosSelecionados = filtrados.length > 0 && selecionados.length === filtrados.length;
  function toggleSelecionado(id: number) {
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleSelecionarTodos() {
    setSelecionados((prev) => {
      if (todosSelecionados) return [];
      return filtrados.map((c) => c.id!);
    });
  }

  // Pós-ação (refetch)
  async function refresh() {
    await refetch?.(); // só funciona se expormos no hook (patch abaixo)
  }
  function onCreated() {
    setTituloNotificacao('Sucesso');
    setMensagemNotificacao('Cliente cadastrado com sucesso!');
    setModalVisivel(true);
    refresh();
  }
  function onUpdated() {
    setTituloNotificacao('Sucesso');
    setMensagemNotificacao('Cliente atualizado com sucesso!');
    setModalVisivel(true);
    refresh();
  }
  function onDeleted() {
    setTituloNotificacao('Sucesso');
    setMensagemNotificacao('Cliente excluído com sucesso!');
    setModalVisivel(true);
    setSelecionados([]);
    refresh();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-gray-500">Gerencie cadastro, edição e exclusão de clientes.</p>
          {/* (Opcional) Indicador de paginação vinda do hook */}
          {/* <p className="text-xs text-gray-400">Página {page} de {totalPages} — Total: {total}</p> */}
        </div>
        <ClienteCreateDialog onCreated={onCreated} />
      </div>

      <div className="border rounded">
        <button
          onClick={() => setFiltrosAbertos((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50"
        >
          <span className="text-sm font-medium">Filtros</span>
          {filtrosAbertos ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {filtrosAbertos && (
          <div className="p-4 flex items-center gap-2">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, documento ou cidade/UF..."
              className="border rounded px-3 py-2 w-full max-w-md"
            />
            <button
              onClick={() => refetch?.()}
              className="px-3 py-2 rounded border hover:bg-gray-50"
            >
              Atualizar
            </button>
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500">Carregando...</p>}
      {erro && <p className="text-sm text-red-600">Erro: {erro}</p>}

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 w-10">
                <input
                  type="checkbox"
                  checked={todosSelecionados}
                  onChange={toggleSelecionarTodos}
                  aria-label="Selecionar todos"
                />
              </th>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Nome</th>
              <th className="text-left px-3 py-2">Tipo</th>
              <th className="text-left px-3 py-2">Documento</th>
              <th className="text-left px-3 py-2">Cidade/UF</th>
              <th className="text-left px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(c.id!)}
                    onChange={() => toggleSelecionado(c.id!)}
                  />
                </td>
                <td className="px-3 py-2">{c.id}</td>
                <td className="px-3 py-2">{c.nome_cliente}</td>
                <td className="px-3 py-2">{c.tipo_cliente}</td>
                <td className="px-3 py-2">{c.doc_cliente}</td>
                <td className="px-3 py-2">
                  {c.cidade_cliente}{c.uf_cliente ? `/${c.uf_cliente}` : ''}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <ClienteEditDialog cliente={c} onUpdated={onUpdated} />
                    {c.id && <ClienteDeleteDialog id={c.id} onDeleted={onDeleted} />}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                  Nenhum cliente encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalNotificacao
        isOpen={modalVisivel}
        onClose={() => setModalVisivel(false)}
        title={tituloNotificacao}
        message={mensagemNotificacao}
      />
    </div>
  );
}
