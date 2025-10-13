'use client';

import React, { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiEdit2, FiTrash2 } from 'react-icons/fi';

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
  const [clienteEditando, setClienteEditando] = useState<ClienteDTO | null>(null);
  const [clienteExcluindoId, setClienteExcluindoId] = useState<number | null>(null);

  const {
    clientes,
    isLoading: loading,
    error,
    page,
    totalPages,
    total,
    refetch,
  } = useClientes();

  const erro = error instanceof Error ? error.message : '';

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    if (!q) return clientes;
    return clientes.filter((c) =>
      c.nome_cliente?.toLowerCase().includes(q) ||
      c.doc_cliente?.toLowerCase().includes(q) ||
      c.cidade_cliente?.toLowerCase().includes(q) ||
      c.uf_cliente?.toLowerCase().includes(q)
    );
  }, [clientes, busca]);

  const todosSelecionados = filtrados.length > 0 && selecionados.length === filtrados.length;

  function toggleSelecionado(id: number) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelecionarTodos() {
    setSelecionados((prev) =>
      todosSelecionados ? [] : filtrados.map((c) => c.id!)
    );
  }

  async function refresh() {
    await refetch?.();
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
    setClienteEditando(null);
    refresh();
  }

  function onDeleted() {
    setTituloNotificacao('Sucesso');
    setMensagemNotificacao('Cliente excluído com sucesso!');
    setModalVisivel(true);
    setSelecionados([]);
    setClienteExcluindoId(null);
    refresh();
  }

  return (
    <div className="w-screen min-h-screen bg-slate-100 overflow-x-auto">
      <div className="py-6 min-w-[320px] sm:min-w-[640px] md:min-w-[1024px] lg:min-w-[1400px] mx-auto px-4 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Clientes</h1>
            <p className="text-sm text-gray-500">Gerencie cadastro, edição e exclusão de clientes.</p>
          </div>
          <ClienteCreateDialog onCreated={onCreated} />
        </div>

        {/* Filtros */}
        <div className="border rounded bg-white">
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
                onClick={refresh}
                className="px-3 py-2 rounded border hover:bg-gray-50"
              >
                Atualizar
              </button>
            </div>
          )}
        </div>

        {/* Mensagens */}
        {loading && <p className="text-sm text-gray-500">Carregando...</p>}
        {erro && <p className="text-sm text-red-600">Erro: {erro}</p>}

        {/* Tabela */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto border rounded shadow-sm bg-white">
          <table className="w-full table-auto border border-gray-200 rounded-md">
            <thead className="bg-green-700 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 w-10">
                  <input
                    type="checkbox"
                    checked={todosSelecionados}
                    onChange={toggleSelecionarTodos}
                    aria-label="Selecionar todos"
                    className="accent-green-600"
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
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selecionados.includes(c.id!)}
                      onChange={() => toggleSelecionado(c.id!)}
                      className="accent-green-600"
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
                      <button
                        onClick={() => setClienteEditando(c)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => setClienteExcluindoId(c.id!)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:underline text-sm"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Excluir
                      </button>
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

        {/* Modais */}
        {clienteEditando && (
          <ClienteEditDialog
            key={clienteEditando.id}
            cliente={clienteEditando}
            open={true}
            onUpdated={onUpdated}
            onClose={() => setClienteEditando(null)}
          />
        )}

        {clienteExcluindoId !== null && (
          <ClienteDeleteDialog
            key={clienteExcluindoId}
            id={clienteExcluindoId}
            open={true}
            onDeleted={onDeleted}
            onClose={() => setClienteExcluindoId(null)}
          />
        )}

        {/* Notificação */}
        <ModalNotificacao
          isOpen={modalVisivel}
          onClose={() => setModalVisivel(false)}
          title={tituloNotificacao}
          message={mensagemNotificacao}
        />
      </div>
    </div>
  );
}