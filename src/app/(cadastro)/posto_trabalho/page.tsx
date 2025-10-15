'use client';

import React, { useMemo, useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';

import usePostosTrabalho from '@/hooks/usePostosTrabalhoWs';
import type { PostoTrabalhoItem } from '@/types/posto_trabalho';

import PostoTrabalhoCreateDialog from '@/components/posto_trabalho/PostoTrabalhoCreateDialog';
import PostoTrabalhoEditDialog from '@/components/posto_trabalho/PostoTrabalhoEditDialog';
import PostoTrabalhoDeleteDialog from '@/components/posto_trabalho/PostoTrabalhoDeleteDialog';

// Helpers
function formatDateBR(iso?: string) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return iso;
  }
}

export default function PostosTrabalhoPage() {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [busca, setBusca] = useState('');

  const [postoEditando, setPostoEditando] = useState<PostoTrabalhoItem | null>(null);
  const [postoExcluindoId, setPostoExcluindoId] = useState<number | null>(null);

  // Paginação client-side (mantém a página com a UX do ProdutosPage)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const {
    postos,
    isLoading: loading,
    error,
    refetch,
  } = usePostosTrabalho();

  const erro = error instanceof Error ? error.message : '';

  // Filtro client-side por nome (e campos relacionados)
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return postos;

    return postos.filter((p) => {
      const nome = p.posto_trabalho_nome?.toLowerCase() ?? '';
      const produtos = (p.produtos ?? [])
        .map((x) => (x as any).nome ?? (x as any).componente_nome ?? '')
        .join(' ')
        .toLowerCase();

      return (
        nome.includes(q) ||
        produtos.includes(q) ||
        String(p.id).includes(q)
      );
    });
  }, [busca, postos]);

  // Paginação client-side
  const total = filtrados.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtrados.slice(start, end);
  }, [filtrados, currentPage, pageSize]);

  function aplicarFiltros() {
    // apenas reseta para a primeira página; filtro é client-side
    setPage(1);
  }

  function limparFiltros() {
    setBusca('');
    setPage(1);
  }

  async function refreshPage() {
    await refetch?.();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-slate-900">Postos de Trabalho</h1>

            <button
              onClick={refreshPage}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <FiRefreshCw className="size-4" />
              Atualizar
            </button>

            <PostoTrabalhoCreateDialog
              onCreated={refreshPage}
              buttonLabel="Novo Posto de Trabalho"
            />
          </div>
          <p className="text-sm text-gray-500">
            Cadastre, edite e exclua postos de trabalho e visualize produtos vinculados.
          </p>
        </div>

        {/* Grid principal: filtros + tabela */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {/* Filtros */}
          <div className="col-span-12">
            <div className="border rounded bg-white shadow-sm w-full">
              <button
                onClick={() => setFiltrosAbertos((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50"
              >
                <span className="text-sm font-medium">Filtros</span>
                {filtrosAbertos ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {filtrosAbertos && (
                <div className="p-3 space-y-3">
                  <div className="relative">
                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por nome do posto, ID ou produto vinculado..."
                      className="w-full rounded border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={aplicarFiltros}
                      className="px-3 py-1.5 text-sm rounded border border-slate-200 bg-white hover:bg-slate-50"
                    >
                      Aplicar
                    </button>
                    <button
                      onClick={limparFiltros}
                      className="px-3 py-1.5 text-sm rounded border border-slate-200 bg-white hover:bg-slate-50"
                    >
                      Limpar
                    </button>
                  </div>

                  {/* PageSize */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Itens por página</label>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Mensagens */}
            {loading && <p className="mt-3 text-sm text-gray-500">Carregando...</p>}
            {erro && <p className="mt-2 text-sm text-red-600">Erro: {erro}</p>}
          </div>

          {/* Tabela */}
          <div className="col-span-12">
            <div className="flex min-h-0 flex-col rounded border bg-white shadow-sm">
              {/* Topo: contagem e paginação resumida */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="text-sm text-slate-600">
                  {loading
                    ? 'Carregando...'
                    : `Encontrados ${total} registro(s) — Página ${currentPage} de ${totalPages}`}
                </div>

                {/* Paginação: prev/next */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-2 py-1 text-sm rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-2 py-1 text-sm rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>

              {/* Corpo */}
              <div className="min-h-0 flex-1 p-2 sm:p-3">
                <div className="overflow-x-auto overflow-y-auto h-[65vh] sm:h-[70vh]">
                  <table className="min-w-full border-separate border-spacing-y-1 border-spacing-x-0">
                    <thead className="sticky top-0 z-10 bg-green-700 text-white">
                      <tr>
                        <th className="text-left px-3 py-2">ID</th>
                        <th className="text-left px-3 py-2">Nome do Posto</th>
                        <th className="text-left px-3 py-2">Qtd. Produtos</th>
                        <th className="text-left px-3 py-2">Data Execução</th>
                        <th className="text-left px-3 py-2 w-36">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.length === 0 && !loading && (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                            Nenhum posto de trabalho encontrado.
                          </td>
                        </tr>
                      )}

                      {pageData.map((p) => (
                        <tr key={p.id} className="bg-white hover:bg-slate-50">
                          <td className="px-3 py-2 align-top text-sm text-slate-700">{p.id}</td>
                          <td className="px-3 py-2 align-top">
                            <div className="text-sm font-medium text-slate-900">
                              {p.posto_trabalho_nome}
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top text-sm text-slate-700">
                            {p.produtos?.length ?? 0}
                          </td>
                          <td className="px-3 py-2 align-top text-sm text-slate-700">
                            {formatDateBR(p.data_execucao as any)}
                          </td>
                          <td className="px-3 py-2 align-top">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPostoEditando(p)}
                                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <FiEdit2 className="size-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => setPostoExcluindoId(p.id)}
                                className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                <FiTrash2 className="size-4" />
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rodapé opcional / paginação repetida */}
              <div className="flex items-center justify-between border-t px-4 py-3">
                <div className="text-xs text-slate-500">
                  Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} de {total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-2 py-1 text-sm rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-slate-600">
                    Página {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-2 py-1 text-sm rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog: Editar */}
        {postoEditando && (
          <PostoTrabalhoEditDialog
            posto={postoEditando}
            open={!!postoEditando}
            onUpdated={refreshPage}
            onClose={() => setPostoEditando(null)}
          />
        )}

        {/* Dialog: Excluir */}
        {postoExcluindoId !== null && (
          <PostoTrabalhoDeleteDialog
            id={postoExcluindoId}
            open={postoExcluindoId !== null}
            onDeleted={refreshPage}
            onClose={() => setPostoExcluindoId(null)}
          />
        )}
      </div>
    </div>
  );
}
