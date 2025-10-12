import React, { useMemo, useState } from 'react';
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

interface Recebimento {
  id: number;
  data_recebimento: string;
  numero_ordem: number;
  cliente: {
    nome_cliente: string;
  };
  quantidade: number;
  descricaoProduto: string;
  nota_fiscal?: {
    numero_nf: string;
  };
  referencia_produto?: string;
  queixa_cliente?: string;
}

interface TabelaRecebimentosProps {
  recebimentos: Recebimento[];
  onRowClick?: (rec: Recebimento) => void;
  selectedRecebimento?: Recebimento | null;
  isLoading?: boolean;
}

export default function TabelaRecebimentos({
  recebimentos,
  onRowClick,
  selectedRecebimento,
  isLoading,
}: TabelaRecebimentosProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<Recebimento>[] = useMemo(() => [
    {
      accessorKey: 'data_recebimento',
      header: 'Data',
      cell: info => {
        const rawDate = info.getValue() as string;
        const formatted = new Date(rawDate).toLocaleDateString('pt-BR');
        return formatted;
      }
    },
    {
      accessorKey: 'numero_ordem',
      header: 'Nº Ordem',
      cell: info => info.getValue() ?? 'N/A'
    },
    {
      accessorKey: 'cliente.nome_cliente',
      header: 'Cliente',
      cell: info => info.getValue() ?? 'N/A'
    },
    {
      accessorKey: 'quantidade',
      header: 'Qtd',
      cell: info => info.getValue() ?? 'N/A'
    },
    {
      accessorKey: 'descricaoProduto',
      header: 'Produto',
      cell: info => info.getValue() ?? 'N/A'
    },
    {
      accessorKey: 'nota_fiscal.numero_nf',
      header: 'NF Remessa',
      cell: info => info.getValue() ?? 'N/A'
    },
    {
      accessorKey: 'referencia_produto',
      header: 'Referência',
      cell: info => info.getValue() ?? 'N/A'
    },
    {
      accessorKey: 'queixa_cliente',
      header: 'Obs',
      cell: info => info.getValue() ?? 'N/A'
    },
  ], []);

  const table = useReactTable({
    data: recebimentos,
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
    return <div className="text-center py-8">Carregando recebimentos...</div>;
  }

  return (
    <div className="mt-6">
      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-200">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="p-2 border text-left cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex justify-between items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: '↑',
                        desc: '↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              const recebimento = row.original;
              const isSelected = selectedRecebimento?.id === recebimento.id;
              return (
                <tr
                  key={row.id}
                  className={`${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'} cursor-pointer`}
                  onClick={() => onRowClick?.(recebimento)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-2 border">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm">Total: {recebimentos.length} recebimentos</div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
