import React, { useMemo, useState, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
  PaginationState,
} from '@tanstack/react-table'
import { FiEdit, FiTrash2 } from 'react-icons/fi'

import { Defeito } from '@/types/defeito'
import { Componente } from '@/types/componente'

interface DefeitoTableProps {
  defeitos: Defeito[]
  onEdit: (item: Defeito) => void
  onDelete: (id: number) => void
  selecionados: number[]
  toggleSelecionado: (id: number) => void
  toggleSelecionarTodos: () => void
  todosSelecionados: boolean
  idEditar: number | null
  modoEdicaoMultipla: boolean
  editaveis: Defeito[]
  setEditaveis: React.Dispatch<React.SetStateAction<Defeito[]>>
  onSalvarEdicao: (item: Defeito) => void
  onCancelarMultiplos: () => void
  onSalvarMultiplos: () => void
  componentes: Componente[]
}

export default function DefeitoTable({
  defeitos,
  onEdit,
  onDelete,
  selecionados,
  toggleSelecionado,
  toggleSelecionarTodos,
  todosSelecionados,
  idEditar,
  modoEdicaoMultipla,
  editaveis,
  setEditaveis,
  onSalvarEdicao,
  onCancelarMultiplos,
  onSalvarMultiplos,
  componentes,
}: DefeitoTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const data = useMemo(() => defeitos, [defeitos])

  const memoToggleSelecionado = useCallback(
    (id: number) => () => toggleSelecionado(id),
    [toggleSelecionado]
  )

  // Helper para buscar nome do componente pelo id
  const getComponenteNome = (id: number | undefined) => {
    if (!id) return '—'
    return componentes.find(c => c.id === id)?.componente_nome || '—'
  }

  const columns = useMemo<ColumnDef<Defeito>[]>(
    () => [
      {
        accessorKey: 'def_nome',
        header: 'Nome',
        cell: ({ row, getValue }) => {
          const id = row.original.id
          const editavel = modoEdicaoMultipla && selecionados.includes(id)
          const editavelItem = editaveis.find(e => e.id === id)

          if (editavel) {
            return (
              <input
                type="text"
                value={editavelItem?.def_nome || ''}
                onChange={e => {
                  const novoValor = e.target.value
                  setEditaveis(prev =>
                    prev.map(el =>
                      el.id === id ? { ...el, def_nome: novoValor } : el
                    )
                  )
                }}
                onBlur={() => {
                  const editItem = editaveis.find(el => el.id === id)
                  if (editItem) onSalvarEdicao(editItem)
                }}
                className="border rounded px-2 py-1 w-full"
              />
            )
          }

          return getValue()
        },
      },
      {
        accessorKey: 'data',
        header: 'Data',
        cell: ({ row, getValue }) => {
          const id = row.original.id
          const editavel = modoEdicaoMultipla && selecionados.includes(id)
          const editavelItem = editaveis.find(e => e.id === id)

          if (editavel) {
            return (
              <input
                type="date"
                value={
                  editavelItem
                    ? new Date(editavelItem.data).toISOString().slice(0, 10)
                    : ''
                }
                onChange={e => {
                  const novaData = e.target.value
                  setEditaveis(prev =>
                    prev.map(el =>
                      el.id === id ? { ...el, data: novaData } : el
                    )
                  )
                }}
                className="border rounded px-2 py-1 w-full"
              />
            )
          }

          return new Date(getValue() as string).toLocaleDateString()
        },
      },
      {
        id: 'componente_nome',
        header: 'Componente',
        cell: ({ row }) => {
          const id = row.original.id
          const editavel = modoEdicaoMultipla && selecionados.includes(id)
          const editavelItem = editaveis.find(e => e.id === id)

          if (editavel) {
            return (
              <select
                value={editavelItem?.componente_id || ''}
                onChange={e => {
                  const componenteId = Number(e.target.value)
                  setEditaveis(prev =>
                    prev.map(el =>
                      el.id === id ? { ...el, componente_id: componenteId } : el
                    )
                  )
                }}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="">—</option>
                {componentes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.componente_nome}
                  </option>
                ))}
              </select>
            )
          }

          return getComponenteNome(row.original.componente_id)
        },
      },
      {
        id: 'acoes',
        header: 'Ações',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex gap-3">
              <button
                onClick={() => onEdit(item)}
                className="text-blue-600 hover:text-blue-800"
                title="Editar"
              >
                <FiEdit />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-800"
                title="Excluir"
              >
                <FiTrash2 />
              </button>
            </div>
          )
        },
        enableSorting: false,
        size: 100,
      },
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={todosSelecionados}
            onChange={toggleSelecionarTodos}
            className="accent-green-600 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-green-500"
            aria-label="Selecionar todos"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selecionados.includes(row.original.id)}
            onChange={memoToggleSelecionado(row.original.id)}
            className="accent-green-600 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-green-500"
            aria-label={`Selecionar defeito ${row.original.def_nome}`}
          />
        ),
        enableSorting: false,
        size: 50,
      },
    ],
    [
      modoEdicaoMultipla,
      selecionados,
      editaveis,
      setEditaveis,
      onSalvarEdicao,
      onEdit,
      onDelete,
      memoToggleSelecionado,
      toggleSelecionarTodos,
      todosSelecionados,
      componentes,
    ]
  )

  const table = useReactTable({
    data,
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
  })

  if (defeitos.length === 0) {
    return (
      <div className="text-center p-4 text-gray-600">Nenhum defeito cadastrado.</div>
    )
  }

  return (
    <>
      {modoEdicaoMultipla && (
        <div className="mb-4 flex gap-2 justify-end">
          <button
            onClick={onSalvarMultiplos}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Salvar todos
          </button>
          <button
            onClick={onCancelarMultiplos}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto border rounded-md shadow-sm">
        <table className="min-w-full text-sm border-collapse border border-gray-300">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="sticky top-0 bg-green-700 text-white z-10 p-2 border text-left cursor-pointer select-none"
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    aria-sort={
                      header.column.getIsSorted()
                        ? header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    scope="col"
                  >
                    <div className="flex justify-between items-center select-none">
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
              const estaEditando = idEditar === row.original.id
              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 border-t border-gray-200 ${
                    estaEditando ? 'bg-yellow-100' : ''
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-2 border align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div>Total: {defeitos.length} defeitos</div>
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
    </>
  )
}
