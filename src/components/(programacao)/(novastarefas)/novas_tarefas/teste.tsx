import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
  PaginationState,
} from '@tanstack/react-table';
import { Tarefa } from '@/types/tarefas';

interface TabelaTarefasProps {
  tarefas: Tarefa[];
  onDelete: (ids: number[]) => void;
  isLoading?: boolean;
  onRowClick?: (tarefa: Tarefa) => void;
  selectedTarefa?: Tarefa | null;
}

export default function TabelaTarefas({
  tarefas,
  onDelete,
  isLoading,
  onRowClick,
  selectedTarefa,
}: TabelaTarefasProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<Tarefa>[] = useMemo(() => [
  {
    accessorKey: 'recebimento.data_recebimento',
    header: 'Data',
    cell: info => {
      const date = new Date(info.getValue() as string); // Converte a string da data para objeto Date
      const formattedDate = date.toLocaleDateString('pt-BR'); // Formata a data para DD/MM/AAAA
      return formattedDate; // Exibe a data formatada
    }
  },
       {
        accessorKey: 'recebimento.os_formatado',  // Nome único
        header: 'Nº Controle',
        cell: info => info.getValue() || 'Não disponível'
      },
   {
    accessorKey: 'recebimento.cliente.nome_cliente',   // Nome único
    header: 'Cliente',
    cell: info => info.getValue() || 'Não disponível'
  },
  {
    accessorKey: 'recebimento.quantidade',  // Nome único
    header: 'Qtd',
    cell: info => info.getValue() || 'Não disponível'
  },
  { accessorKey: 'codigoProduto', header: 'Cód', cell: info => info.getValue() },
  { accessorKey: 'descricaoProduto', header: 'Descrição', cell: info => info.getValue() },
  { accessorKey: 'operacao', header: 'Op', cell: info => info.getValue() },
  { accessorKey: 'recebimento.queixa_cliente',
     header: 'Observação',
     cell: info => info.getValue() || 'Não disponível'
    }
], []);

  const table = useReactTable({
    data: tarefas,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
                      <span>
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              const tarefa = row.original;
              const isSelected = selectedTarefa?.id === tarefa.id;
              return (
                <tr
                    key={row.id}
                    className={`${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'} cursor-pointer`}
                    onClick={() => onRowClick?.(tarefa)}
                    role="row"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick?.(tarefa);
                      }
                    }}
                    aria-selected={isSelected}
                  >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="border p-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
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
          <span>Total: {tarefas.length} tarefas</span>
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
          onClick={() => onDelete(selectedTarefa ? [selectedTarefa.id] : [])}
          disabled={!selectedTarefa}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedTarefa
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Excluir Selecionado
        </button>
      </div>
    </div>
  );
}
