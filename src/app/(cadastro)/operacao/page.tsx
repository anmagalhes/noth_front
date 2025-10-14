
'use client';

import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';
import { useState, useMemo } from 'react';

import useOperacoes from '@/hooks/useOperacoesWS';
import type { OperacaoItem } from '@/types/operacao';

import OperacaoCreateDialog from '@/components/operacao/OperacaoCreateDialog';
import OperacaoEditDialog from '@/components/operacao/OperacaoEditDialog';
import OperacaoDeleteDialog from '@/components/operacao/OperacaoDeleteDialog';

function formatDateBR(iso?: string) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return iso;
  }
}

export default function OperacoesPage() {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [busca, setBusca] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [operacaoEditando, setOperacaoEditando] = useState<OperacaoItem | null>(null);
  const [operacaoExcluindoId, setOperacaoExcluindoId] = useState<number | null>(null);

  const {
    operacoesQuery: { data: operacoes = [], isLoading: loading, error, refetch },
  } = useOperacoes();

  const listagem = useMemo(() => {
    if (!busca.trim()) return operacoes;
    return operacoes.filter((o) =>
      o.op_nome.toLowerCase().includes(busca.trim().toLowerCase())
    );
  }, [operacoes, busca]);

  const erro = error instanceof Error ? error.message : '';

  function aplicarFiltros() {
    refetch();
  }

  function limparFiltros() {
    setBusca('');
    refetch();
  }

  async function refreshPage() {
    await refetch();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
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
          <p className="text-sm text-gray-500">
            Cadastre, edite e exclua operações do sistema.
          </p>
        </div>

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
                  <div className="relative">
                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por nome ou grupo..."
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

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Itens por página</label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
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

            {loading && <p className="mt-3 text-sm text-gray-500">Carregando...</p>}
            {erro && <p className="mt-2 text-sm text-red-600">Erro: {erro}</p>}
          </div>

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
                      {!loading && listagem.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                            Nenhuma operação encontrada
                          </td>
                        </tr>
                      )}
                      {!loading &&
                        listagem.map((op) => (
                          <tr key={op.id} className="bg-white even:bg-slate-50/60 hover:bg-slate-50">
                            <td className="px-3 py-2">{op.id}</td>
                            <td className="px-3 py-2">{op.op_grupo_processo}</td>
                            <td className="px-3 py-2">{op.op_nome}</td>
                            <td className="px-3 py-2">{formatDateBR(op.data_execucao)}</td>
                            <td className="px-3 py-2">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setOperacaoEditando(op)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => setOperacaoExcluindoId(op.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <OperacaoEditDialog
          operacao={operacaoEditando}
          open={!!operacaoEditando}
          onUpdated={() => {
            setOperacaoEditando(null);
            refetch();
          }}
          onClose={() => setOperacaoEditando(null)}
        />

        <OperacaoDeleteDialog
          id={operacaoExcluindoId}
          open={!!operacaoExcluindoId}
          onDeleted={() => {
            setOperacaoExcluindoId(null);
            refetch();
          }}
          onClose={() => setOperacaoExcluindoId(null)}
        />
      </div>
    </div>
  );
}
