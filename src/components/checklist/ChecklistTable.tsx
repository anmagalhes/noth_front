import React, { useRef } from 'react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import ButtonGerarPDFs from '@/components/botao/PDFButton'
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  ColumnDef as OriginalColumnDef,
} from '@tanstack/react-table'
import { Checklist, ChecklistTableItem } from '@/types/checklist'

interface ColumnMeta {
  className?: string
}

// Extende ColumnDef para aceitar meta com className
type ColumnDef<T> = OriginalColumnDef<T> & {
  meta?: ColumnMeta
}

interface ChecklistTableProps {
  checklists?: ChecklistTableItem[]
  loading?: boolean
  selecionados?: number[]
  toggleSelecionado: (id: number) => void
  toggleSelecionarTodos: () => void
  todosSelecionados: boolean
  idEditar: number | null
  modoEdicaoMultipla: boolean
  setModoEdicaoMultipla: React.Dispatch<React.SetStateAction<boolean>>
  editaveis: Checklist[]
  setEditaveis: React.Dispatch<React.SetStateAction<Checklist[]>>
  onEdit: (checklist: Checklist) => void
  onDelete: (id: number) => void
  onSalvarEdicao: (checklistEditado: Checklist) => void
  onCancelarEdicao: () => void
  onDeleteEmMassa: (ids: number[]) => Promise<void>
  onEditarEmMassa: (itensEditados: Checklist[]) => Promise<void>
}

const columnHelper = createColumnHelper<ChecklistTableItem>()

export default function ChecklistTable({
  checklists = [],
  selecionados = [],
  toggleSelecionado,
  toggleSelecionarTodos,
  todosSelecionados,
  idEditar,
  modoEdicaoMultipla,
  setModoEdicaoMultipla,
  editaveis,
  setEditaveis,
  onEdit,
  onDelete,
  onSalvarEdicao,
  onCancelarEdicao,
  onEditarEmMassa,
  loading = false,
}: ChecklistTableProps) {
  const refsInputs = useRef<(HTMLInputElement | null)[]>([])

  // Navegação com Enter e Tab entre inputs (se for usar edição inline)
  function onKeyDownCell(
    e: React.KeyboardEvent<HTMLInputElement>,
    currentIndex: number,
    totalColumns: number
  ) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const direction = e.shiftKey ? -totalColumns : totalColumns
      const nextIndex = currentIndex + direction
      const nextInput = refsInputs.current[nextIndex]
      if (nextInput) setTimeout(() => nextInput.focus(), 0)
    }
    if (e.key === 'Tab') {
      const direction = e.shiftKey ? -1 : 1
      const nextIndex = currentIndex + direction
      const nextInput = refsInputs.current[nextIndex]
      if (nextInput) {
        e.preventDefault()
        setTimeout(() => nextInput.focus(), 0)
      }
    }
  }

  const columns: ColumnDef<ChecklistTableItem>[] = [
  {
    accessorKey: 'recebimento.os_formatado',
    header: 'Nº de Controle',
    cell: info => info.getValue() || '-',
  },
  {
    accessorKey: 'recebimento.nome_cliente',
    header: 'Cliente',
    cell: info => info.getValue() || '-',
  },
  {
    accessorKey: 'recebimento.produto_nome',
    header: 'Produto',
    cell: info => info.getValue() || '-',
  },
  {
    accessorKey: 'recebimento_id',
    header: 'Recebimento ID',
    cell: info => {
      const value = info.getValue() as number | null
      return value !== null && value !== undefined ? String(value) : '-'
    },
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    cell: info => info.getValue() || '-',
  },
  {
    accessorKey: 'tem_pdf',
    header: 'Tem PDF',
    cell: info => (info.getValue() ? 'Sim' : 'Não'),
  },
  {
    header: 'Ações',
    id: 'acoes',
    cell: info => {
      const item = info.row.original
      return (
        <div className="flex gap-2">
          <button
            onClick={() =>
              onEdit({
                ...item,
                recebimento_id: item.recebimento_id
                  ? Number(item.recebimento_id)
                  : null,
              })
            }
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
    meta: { className: 'text-center' },
  },
  // 🔽 Checkbox agora é a última coluna
  columnHelper.display({
    id: 'selecionar',
    header: () => (
      <input
        type="checkbox"
        checked={todosSelecionados}
        onChange={toggleSelecionarTodos}
        className="accent-green-600 w-5 h-5"
        aria-label="Selecionar todos"
      />
    ),
    cell: info => {
      const item = info.row.original
      return (
        <input
          type="checkbox"
          checked={selecionados.includes(item.id)}
          onChange={() => toggleSelecionado(item.id)}
          className="accent-green-600 w-5 h-5"
          aria-label={`Selecionar checklist ${item.id}`}
        />
      )
    },
    meta: { className: 'text-center' },
  }),
]

  const table = useReactTable({
    data: checklists,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
      {/* Ações em massa */}
      {selecionados.length > 0 && !modoEdicaoMultipla && (
        <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md mb-3 shadow-sm">
          <span className="text-sm text-gray-700">
            {selecionados.length} checklist(s) selecionado(s)
          </span>

          <div className="flex flex-wrap gap-3 items-center">
            {checklists.some(
              item => selecionados.includes(item.id) && !item.tem_pdf
            ) && (
              <ButtonGerarPDFs
                tipo="sem_pdf"
                selecionados={selecionados}
                checklists={checklists}
                onGenerate={() => console.log('Gerar com PDF clicado')}
              />
            )}

            {checklists.some(
              item => selecionados.includes(item.id) && item.tem_pdf
            ) && (
              <ButtonGerarPDFs
                tipo="com_pdf"
                selecionados={selecionados}
                checklists={checklists}
                onGenerate={() => console.log('Gerar sem PDF clicado')}
              />
            )}
          </div>
        </div>
      )}

      <table className="w-full table-auto border border-gray-200 rounded-md shadow-sm">
        <thead className="bg-green-700 text-white">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={`px-4 py-2 ${
                    (header.column.columnDef.meta as ColumnMeta)?.className || ''
                  } text-center`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-4">
                Carregando checklists...
              </td>
            </tr>
          ) : checklists.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-4">
                Nenhum checklist cadastrado.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => {
              const item = row.original
              const estaEditando = idEditar === item.id
              const emEdicaoMultipla =
                modoEdicaoMultipla && selecionados.includes(item.id)
              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 border-t border-gray-200 ${
                    estaEditando || emEdicaoMultipla ? 'bg-yellow-100' : ''
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={`px-4 py-2 ${
                        (cell.column.columnDef.meta as ColumnMeta)?.className || ''
                      } text-center`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {/* Controles edição múltipla */}
      {modoEdicaoMultipla && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => {
              const editados = editaveis
                .filter(c => selecionados.includes(c.id))
                .map(c => {
                  const recebimentoIdNum = Number(c.recebimento_id)
                  return {
                    ...c,
                    recebimento_id: isNaN(recebimentoIdNum)
                      ? null
                      : recebimentoIdNum,
                  }
                })
              onEditarEmMassa(editados)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Salvar Edição Múltipla
          </button>
          <button
            onClick={onCancelarEdicao}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
