'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
  RowSelectionState,
} from '@tanstack/react-table';
import { Tarefa } from '@/types/tarefas'

interface TabelaTarefasProps {
  tarefas: Tarefa[];
  onDelete: (ids: number[]) => void;
  isLoading?: boolean;
}

export default function TabelaTarefas({ tarefas, onDelete, isLoading }: TabelaTarefasProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Definir as colunas SEMPRE
  const columns: ColumnDef<Tarefa>[] = useMemo(() => [
    { accessorKey: 'dataLancamento', header: 'Data', cell: info => info.getValue() },
    { accessorKey: 'numeroControle', header: 'Nº Controle', cell: info => info.getValue() },
    { accessorKey: 'clienteNome', header: 'Cliente', cell: info => info.getValue() },
    { accessorKey: 'quantidade', header: 'Qtd', cell: info => info.getValue() },
    { accessorKey: 'codigoProduto', header: 'Cód', cell: info => info.getValue() },
    { accessorKey: 'descricaoProduto', header: 'Descrição', cell: info => info.getValue() },
    { accessorKey: 'operacao', header: 'Op', cell: info => info.getValue() },
    { accessorKey: 'observacao', header: 'Observação', cell: info => info.getValue() },
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="form-checkbox h-4 w-4 text-green-600 rounded"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="form-checkbox h-4 w-4 text-green-600 rounded"
        />
      ),
    },
  ], []);

  // Criar a tabela SEMPRE
  const table = useReactTable({
    data: tarefas,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRowIds = table.getSelectedRowModel().flatRows.map(row => row.original.id);

  // Renderização condicional do loading
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="overflow-x-auto rounded-lg shadow w-full max-w-full">
        <table className="min-w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-green-600 text-white">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="border p-2 cursor-pointer hover:bg-green-700"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-between">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={row.getIsSelected() ? 'bg-blue-50' : 'hover:bg-gray-50'}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="border p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {tarefas.length === 0 && (
          <div className="text-center py-8 bg-gray-50">
            <p className="text-gray-500">Nenhuma tarefa encontrada</p>
          </div>
        )}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          {selectedRowIds.length > 0 ? (
            <span>{selectedRowIds.length} {selectedRowIds.length === 1 ? 'item selecionado' : 'itens selecionados'}</span>
          ) : (
            <span>Total: {tarefas.length} tarefas</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </button>
          <span>
            Página{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </strong>
          </span>
          <button
            className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </button>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => onDelete(selectedRowIds)}
          disabled={selectedRowIds.length === 0}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedRowIds.length > 0
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Excluir Selecionados
        </button>
      </div>
    </div>
  );
}
