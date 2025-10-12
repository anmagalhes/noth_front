import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
  PaginationState
} from '@tanstack/react-table'

import { Recebimento } from '@/types/recebimento' // ajuste conforme a tipagem do seu projeto

interface TabelaRecebimentosProps {
  recebimentos: Recebimento[]
  isLoading?: boolean
  onRowClick?: (recebimento: Recebimento) => void
  selectedRecebimento?: Recebimento | null
}

export default function TabelaRecebimentos({
  recebimentos,
  isLoading,
  onRowClick,
  selectedRecebimento
}: TabelaRecebimentosProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const columns: ColumnDef<Recebimento>[] = useMemo(
    () => [
      {
        accessorKey: 'numero_ordem',
        header: 'Nº Ordem',
        cell: info => info.getValue() || '-'
      },
      {
        accessorKey: 'recebimento_ordem',
        header: 'Código Receb.',
        cell: info => info.getValue() || '-'
      },
      {
        accessorKey: 'os_formatado',
        header: 'OS Formatado',
        cell: info => info.getValue() || '-'
      },
      {
        accessorKey: 'cliente.nome_cliente',
        header: 'Cliente',
        cell: info => info.getValue() || '-'
      },
      {
        accessorKey: 'quantidade',
        header: 'Qtd',
        cell: info => info.getValue() || '-'
      },
      {
        accessorKey: 'referencia_produto',
        header: 'Referência',
        cell: info => info.getValue() || '-'
      },
      {
        accessorKey: 'nota_fiscal.numero_nota',
        header: 'Nota Fiscal',
        cell: info => info.getValue() || '-'
      },
      {
        accessorKey: 'queixa_cliente',
        header: 'Observação',
        cell: info => info.getValue() || '-'
      }
    ],
    []
  )

  const table = useReactTable({
    data: recebimentos,
    columns,
    state: {
      sorting,
      pagination
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Carregando recebimentos...</p>
      </div>
    )
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
                        {({
                          asc: ' ↑',
                          desc: ' ↓'
                        }[header.column.getIsSorted() as string] ?? null)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              const recebimento = row.original
              const isSelected = selectedRecebimento?.id === recebimento.id

              return (
                <tr
                  key={row.id}
                  className={`${
                    isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'
                  } cursor-pointer`}
                  onClick={() => onRowClick?.(recebimento)}
                  role="row"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onRowClick?.(recebimento)
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
              )
            })}
          </tbody>
        </table>

        {recebimentos.length === 0 && (
          <div className="text-center py-8 bg-gray-50">
            <p className="text-gray-500">Nenhum recebimento encontrado</p>
          </div>
        )}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          <span>Total: {recebimentos.length} recebimentos</span>
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
    </div>
  )
}

