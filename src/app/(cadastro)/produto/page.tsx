'use client';

import React, { useMemo, useState } from 'react';
import {
  FiChevronDown, FiChevronUp, FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiSearch,
  FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown
} from 'react-icons/fi';

import useProdutos from '@/hooks/useProdutos';
import type { Produto as ProdutoDTO, ProdutoTabela } from '@/types/produto';

import ProdutoCreateDialog from '@/components/produto/ProdutoCreateDialog';
import ProdutoEditDialog from '@/components/produto/ProdutoEditDialog';
import ProdutoDeleteDialog from '@/components/produto/ProdutoDeleteDialog';

// Helpers
function displayGrupo(g?: string) {
  if (!g) return '-';
  return g === 'SERVICO' ? 'SERVIÇO' : g;
}
function displayTipo(n?: number) {
  return n === 2 ? 'Tarefa' : 'Produto';
}
function formatDateBR(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
}
const getComponenteNome = (p: ProdutoTabela | ProdutoDTO) =>
  (p as any).componente_nome ?? (p as any).componente?.componente_nome ?? '-';
const getOperacaoNome = (p: ProdutoTabela | ProdutoDTO) =>
  (p as any).operacao_nome ?? (p as any).operacao?.op_nome ?? '-';
const getPostoNome = (p: ProdutoTabela | ProdutoDTO) =>
  (p as any).posto_trabalho_nome ?? (p as any).posto_trabalho?.posto_trabalho_nome ?? '-';

type SortBy = 'nome' | 'codigo' | 'data';
type SortDir = 'asc' | 'desc';

export default function ProdutosPage() {
  // Filtros
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState<'' | 'PRODUTO' | 'SERVIÇO'>('');
  const [filtroTipo, setFiltroTipo] = useState<'' | '1' | '2'>('');
  const [filtroComponente, setFiltroComponente] = useState('');

  // Estado efetivo para a query
  const [q, setQ] = useState('');

  // Paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Ordenação
  const [sortBy, setSortBy] = useState<SortBy>('nome');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Modais
  const [produtoEditando, setProdutoEditando] = useState<ProdutoDTO | null>(null);
  const [produtoExcluindoId, setProdutoExcluindoId] = useState<number | null>(null);

  const {
    produtos,
    isLoading: loading,
    error,
    total,
    totalPages,
    refetch,
  } = useProdutos({
    page,
    pageSize,
    q,
    sortBy,
    sortDir,
    grupo: filtroGrupo,
    tipo: filtroTipo,
    componente: filtroComponente,
  });

  const erro = error instanceof Error ? error.message : '';

  const listagem = useMemo(() => produtos ?? [], [produtos]);

  function aplicarFiltros() {
    setQ(busca.trim());
    setPage(1);
    // não precisa chamar refetch: a queryKey já depende de q/grupo/tipo/componente
  }
  function limparFiltros() {
    setBusca('');
    setFiltroGrupo('');
    setFiltroTipo('');
    setFiltroComponente('');
    setQ('');
    setPage(1);
  }
  async function refreshPage() {
    await refetch?.();
  }

  function toggleSort(col: SortBy) {
    if (sortBy !== col) {
      setSortBy(col);
      setSortDir('asc');
      setPage(1);
      return;
    }
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  }

  const sortIcon = (col: SortBy) =>
    sortBy === col ? (sortDir === 'asc' ? <FiArrowUp className="inline-block ml-1" /> : <FiArrowDown className="inline-block ml-1" />) : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* Cabeçalho */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-slate-900">Produtos</h1>

            <button
              onClick={refreshPage}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <FiRefreshCw className="size-4" />
              Atualizar
            </button>

            <ProdutoCreateDialog
              onCreated={refreshPage}
              trigger={
                <button className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-green-700">
                  <FiPlus className="size-4" />
                  Novo produto
                </button>
              }
            />
          </div>
          <p className="text-sm text-gray-500">
            Cadastre, edite e exclua produtos do catálogo.
          </p>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
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
                  <div className="grid grid-cols-12 gap-3">
                    {/* Busca livre */}
                    <div className="col-span-12 lg:col-span-5 relative">
                      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                      <input
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar por nome, código, componente..."
                        className="w-full rounded border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400"
                        onKeyDown={(e) => { if (e.key === 'Enter') aplicarFiltros(); }}
                      />
                    </div>

                    {/* Grupo */}
                    <div className="col-span-6 lg:col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">Grupo</label>
                      <select
                        value={filtroGrupo}
                        onChange={(e) => { setFiltroGrupo(e.target.value as any); setPage(1); }}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
                      >
                        <option value="">Todos</option>
                        <option value="PRODUTO">Produto</option>
                        <option value="SERVIÇO">Serviço</option>
                      </select>
                    </div>

                    {/* Tipo */}
                    <div className="col-span-6 lg:col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">Tipo</label>
                      <select
                        value={filtroTipo}
                        onChange={(e) => { setFiltroTipo(e.target.value as any); setPage(1); }}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
                      >
                        <option value="">Todos</option>
                        <option value="1">Produto</option>
                        <option value="2">Tarefa</option>
                      </select>
                    </div>

                    {/* Componente */}
                    <div className="col-span-12 lg:col-span-3">
                      <label className="block text-xs text-slate-500 mb-1">Componente contém</label>
                      <input
                        value={filtroComponente}
                        onChange={(e) => { setFiltroComponente(e.target.value); setPage(1); }}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
                        placeholder="Ex.: Comp 10"
                      />
                    </div>
                  </div>

                  {/* PageSize + Ações filtros */}
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-600">Itens por página</label>
                      <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
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
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabela */}
          <div className="col-span-12">
            <div className="flex min-h-0 flex-col rounded border bg-white shadow-sm">
              {/* Topo */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="text-sm text-slate-600">
                  {loading ? 'Carregando...' : `Encontrados ${listagem.length} registro(s)`}
                </div>
              </div>

              {/* Mensagens */}
              {!!erro && (
                <div className="px-4 py-2">
                  <p className="text-sm text-red-600">Erro: {erro}</p>
                </div>
              )}

              {/* Corpo */}
              <div className="min-h-0 flex-1 p-2 sm:p-3">
                <div className="overflow-x-auto overflow-y-auto h-[65vh] sm:h-[70vh]">
                  <table className="min-w-full border-separate border-spacing-y-1 border-spacing-x-0">
                    <thead className="sticky top-0 z-10 bg-green-700 text-white">
                      <tr>
                        <th className="text-left px-3 py-2">
                          <button onClick={() => toggleSort('codigo')} className="inline-flex items-center">
                            Código {sortIcon('codigo')}
                          </button>
                        </th>
                        <th className="text-left px-3 py-2">
                          <button onClick={() => toggleSort('nome')} className="inline-flex items-center">
                            Nome {sortIcon('nome')}
                          </button>
                        </th>
                        <th className="text-left px-3 py-2">Grupo</th>
                        <th className="text-left px-3 py-2">Tipo</th>
                        <th className="text-left px-3 py-2">Componente</th>
                        <th className="text-left px-3 py-2">Operação</th>
                        <th className="text-left px-3 py-2">Posto</th>
                        <th className="text-left px-3 py-2">
                          <button onClick={() => toggleSort('data')} className="inline-flex items-center">
                            Data {sortIcon('data')}
                          </button>
                        </th>
                        <th className="text-right px-3 py-2">Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                            Carregando...
                          </td>
                        </tr>
                      )}

                      {!loading && listagem.length === 0 && !erro && (
                        <tr>
                          <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                            Nenhum produto encontrado
                          </td>
                        </tr>
                      )}

                      {!loading && listagem.map((p) => (
                        <tr key={String((p as any).id)} className="bg-white even:bg-slate-50/60 hover:bg-slate-50">
                          <td className="px-3 py-2">{(p as any).cod_produto}</td>
                          <td className="px-3 py-2">{(p as any).produto_nome}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                                displayGrupo((p as any).grupo_id) === 'SERVIÇO'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {displayGrupo((p as any).grupo_id)}
                            </span>
                          </td>
                          <td className="px-3 py-2">{displayTipo((p as any).tipo_produto)}</td>
                          <td className="px-3 py-2">{getComponenteNome(p)}</td>
                          <td className="px-3 py-2">{getOperacaoNome(p)}</td>
                          <td className="px-3 py-2">{getPostoNome(p)}</td>
                          <td className="px-3 py-2">{formatDateBR((p as any).data)}</td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setProdutoEditando(p as ProdutoDTO)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm"
                              >
                                <FiEdit2 className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => setProdutoExcluindoId((p as any).id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:underline text-sm"
                              >
                                <FiTrash2 className="w-4 h-4" />
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

              {/* Rodapé / Paginação */}
              <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 px-3 pb-3">
                <span>{total} registro(s)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 disabled:opacity-40"
                  >
                    <FiChevronLeft className="w-4 h-4" /> Anterior
                  </button>
                  <span>Página {page} de {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 disabled:opacity-40"
                  >
                    Próxima <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modais */}
          <ProdutoEditDialog
            produto={produtoEditando}
            open={!!produtoEditando}
            onUpdated={refreshPage}
            onClose={() => setProdutoEditando(null)}
          />
          <ProdutoDeleteDialog
            id={produtoExcluindoId}
            open={produtoExcluindoId !== null}
            onDeleted={refreshPage}
            onClose={() => setProdutoExcluindoId(null)}
          />
        </div>
      </div>
    </div>
  );
}
