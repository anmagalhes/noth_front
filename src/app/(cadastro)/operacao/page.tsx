'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';

import useOperacoes from '@/hooks/useOperacoesWS';
import type { OperacaoItem } from '@/types/operacao';

import OperacaoCreateDialog from '@/components/operacao/OperacaoCreateDialog';
import OperacaoEditDialog from '@/components/operacao/OperacaoEditDialog';
import OperacaoDeleteDialog from '@/components/operacao/OperacaoDeleteDialog';

// ---------- Utils ----------
function formatDateBR(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Fortaleza',
    }).format(d);
  } catch {
    return '-';
  }
}

type PageButton = number | '...';
function buildPageRange(total: number, current: number, delta = 1): PageButton[] {
  // Retorna algo como: 1 … 4 5 6 … 20
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const set = new Set<number>([1, total, 2, total - 1]);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const arr = Array.from(set).sort((a, b) => a - b);

  const out: PageButton[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (i === 0) {
      out.push(arr[i]);
      continue;
    }
    const prev = arr[i - 1];
    const curr = arr[i];
    if (curr - prev === 1) out.push(curr);
    else out.push('...', curr);
  }
  return out;
}

// Sanitiza pageSize baseado nas opções disponíveis
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;
function sanitizePageSize(n: number, fallback = 10) {
  return PAGE_SIZE_OPTIONS.includes(n as (typeof PAGE_SIZE_OPTIONS)[number]) ? n : fallback;
}

export default function OperacoesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const didInitFromURL = useRef(false);

  // ---------- State ----------
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [busca, setBusca] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [operacaoEditando, setOperacaoEditando] = useState<OperacaoItem | null>(null);
  const [operacaoExcluindoId, setOperacaoExcluindoId] = useState<number | null>(null);

  // ---------- Data ----------
  const {
    operacoesQuery: { data: operacoes = [], isLoading: loading, error, refetch },
  } = useOperacoes();

  const erro = error instanceof Error ? error.message : '';

  // ---------- URL <-> State (inicial) ----------
  useEffect(() => {
    if (didInitFromURL.current) return;
    didInitFromURL.current = true;

    const q = (searchParams.get('q') ?? '').toString();
    const page = Number(searchParams.get('page') ?? '1');
    const size = Number(searchParams.get('pageSize') ?? '10');

    setBusca(q);
    setCurrentPage(Number.isFinite(page) && page > 0 ? page : 1);
    setPageSize(sanitizePageSize(size, 10));
  }, [searchParams]);

  // Helper: atualiza a URL com replace (para não poluir histórico)
  function updateURL(partial: { q?: string; page?: number; pageSize?: number }) {
    const sp = new URLSearchParams(searchParams.toString());
    if (partial.q !== undefined) {
      if (partial.q) sp.set('q', partial.q);
      else sp.delete('q');
    }
    if (partial.page !== undefined) {
      if (partial.page && partial.page > 1) sp.set('page', String(partial.page));
      else sp.delete('page'); // oculta página 1
    }
    if (partial.pageSize !== undefined) {
      if (partial.pageSize && partial.pageSize !== 10)
        sp.set('pageSize', String(partial.pageSize));
      else sp.delete('pageSize'); // oculta pageSize default
    }
    const qs = sp.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  }

  // ---------- Filtro ----------
  const listagem = useMemo(() => {
    const texto = busca.trim().toLowerCase();
    if (!texto) return operacoes;
    return operacoes.filter((o) =>
      [o.op_nome, o.op_grupo_processo].some((v) => (v ?? '').toLowerCase().includes(texto)),
    );
  }, [operacoes, busca]);

  // ---------- Paginação ----------
  const totalPages = Math.ceil(listagem.length / pageSize) || 0;

  const paginatedList = useMemo(() => {
    if (!listagem.length) return [];
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return listagem.slice(start, end);
  }, [listagem, currentPage, pageSize]);

  // Clamp de página quando total mudar + reflete na URL
  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) {
        setCurrentPage(1);
        updateURL({ page: 1 });
      }
      return;
    }
    if (currentPage < 1) {
      setCurrentPage(1);
      updateURL({ page: 1 });
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      updateURL({ page: totalPages });
    }
  }, [totalPages, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reflete mudanças de busca/page/pageSize na URL (sem inflar histórico)
  useEffect(() => {
    if (!didInitFromURL.current) return;
    updateURL({ q: busca, page: currentPage, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, currentPage, pageSize]);

  // Opcional: resetar para página 1 ao trocar busca ou pageSize
  useEffect(() => {
    setCurrentPage(1);
  }, [busca, pageSize]);

  // ---------- Handlers ----------
  function aplicarFiltros() {
    refetch();
  }
  function limparFiltros() {
    setBusca('');
    setCurrentPage(1);
    updateURL({ q: '', page: 1 });
    refetch();
  }
  async function refreshPage() {
    await refetch();
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-slate-900">Operações</h1>

            <button
              onClick={refreshPage}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <FiRefreshCw className="size-4" />
              Atualizar
            </button>

            <OperacaoCreateDialog
              onCreated={refreshPage}
              trigger={
                <button className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-green-700">
                  <FiPlus className="size-4" />
                  Nova operação
                </button>
              }
            />
          </div>
          <p className="text-sm text-gray-500">Cadastre, edite e exclua operações do sistema.</p>
        </div>

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
                    <FiSearch
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4"
                      aria-hidden="true"
                    />
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por nome ou grupo..."
                      className="w-full rounded border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
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

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Itens por página</label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(sanitizePageSize(Number(e.target.value)))}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {loading && <p className="mt-3 text-sm text-gray-500">Carregando...</p>}
            {erro && <p className="mt-2 text-sm text-red-600">Erro: {erro}</p>}
          </div>

          {/* Tabela */}
          <div className="col-span-12">
            <div className="flex min-h-0 flex-col rounded border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="text-sm text-slate-600">
                  {loading ? 'Carregando...' : `Encontradas ${listagem.length} operação(ões)`}
                </div>
              </div>

              <div className="min-h-0 flex-1 p-2 sm:p-3">
                <div className="overflow-x-auto overflow-y-auto h-[65vh] sm:h-[70vh]">
                  <table className="min-w-full border-separate border-spacing-y-1 border-spacing-x-0">
                    <thead className="sticky top-0 z-10 bg-green-700 text-white">
                      <tr>
                        <th className="text-left px-3 py-2">ID</th>
                        <th className="text-left px-3 py-2">Grupo</th>
                        <th className="text-left px-3 py-2">Nome</th>
                        <th className="text-left px-3 py-2">Data</th>
                        <th className="text-right px-3 py-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                            Carregando...
                          </td>
                        </tr>
                      )}

                      {!loading && paginatedList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                            Nenhuma operação encontrada
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        paginatedList.map((op) => (
                          <tr
                            key={op.id}
                            className="bg-white even:bg-slate-50/60 hover:bg-slate-50"
                          >
                            <td className="px-3 py-2">{op.id}</td>
                            <td className="px-3 py-2">{op.op_grupo_processo}</td>
                            <td className="px-3 py-2">{op.op_nome}</td>
                            <td className="px-3 py-2">{formatDateBR(op.data_execucao)}</td>
                            <td className="px-3 py-2">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setOperacaoEditando(op)}
                                  className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-sm text-blue-700 hover:bg-slate-50"
                                  title="Editar"
                                >
                                  <FiEdit2 />
                                  Editar
                                </button>
                                <button
                                  onClick={() => setOperacaoExcluindoId(op.id)}
                                  className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-sm text-red-700 hover:bg-red-50"
                                  title="Excluir"
                                >
                                  <FiTrash2 />
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {/* Paginação com ellipses */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2">
                      <span className="text-sm text-slate-600">
                        Mostrando{' '}
                        <b>
                          {(currentPage - 1) * pageSize + 1}-
                          {Math.min(currentPage * pageSize, listagem.length)}
                        </b>{' '}
                        de <b>{listagem.length}</b>
                      </span>

                      <nav className="flex items-center gap-1" aria-label="Paginação">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage <= 1}
                          className="px-2.5 py-1.5 text-sm rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>

                        {buildPageRange(totalPages, currentPage, 1).map((p, idx) =>
                          p === '...' ? (
                            <span
                              key={`dots-${idx}`}
                              className="px-2.5 py-1.5 text-sm text-slate-500 select-none"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setCurrentPage(p as number)}
                              aria-current={currentPage === p ? 'page' : undefined}
                              className={[
                                'min-w-8 px-2.5 py-1.5 text-sm rounded border',
                                currentPage === p
                                  ? 'border-green-600 bg-green-600 text-white'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                              ].join(' ')}
                            >
                              {p}
                            </button>
                          ),
                        )}

                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                          className="px-2.5 py-1.5 text-sm rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Próxima
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        {operacaoEditando && (
          <OperacaoEditDialog
            open={!!operacaoEditando}
            operacao={operacaoEditando}
            onClose={() => setOperacaoEditando(null)}
            onUpdated={refreshPage}
          />
        )}

        {operacaoExcluindoId != null && (
          <OperacaoDeleteDialog
            open={operacaoExcluindoId != null}
            id={operacaoExcluindoId}
            onClose={() => setOperacaoExcluindoId(null)}
            onDeleted={refreshPage}
          />
        )}
      </div>
    </div>
  );
}
