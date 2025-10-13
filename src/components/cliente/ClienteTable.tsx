'use client';

import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  ColumnDef as OriginalColumnDef,
} from '@tanstack/react-table';
import { Cliente } from '@/types/cliente';

interface ColumnMeta {
  className?: string;
}

type ColumnDef<T> = OriginalColumnDef<T> & {
  meta?: ColumnMeta;
};

interface ClienteTableProps {
  clientes?: Cliente[];
  loading?: boolean;
  selecionados?: number[];
  toggleSelecionado: (id: number) => void;
  toggleSelecionarTodos: () => void;
  todosSelecionados: boolean;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

const columnHelper = createColumnHelper<Cliente>();

export default function ClienteTable({
  clientes = [],
  selecionados = [],
  toggleSelecionado,
  toggleSelecionarTodos,
  todosSelecionados,
  onEdit,
  onDelete,
  loading = false,
}: ClienteTableProps) {
  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: info => info.getValue() ?? '-',
    },
    {
      accessorKey: 'nome_cliente',
      header: 'Nome',
      cell: info => info.getValue() ?? '-',
    },
    {
      accessorKey: 'tipo_cliente',
      header: 'Tipo',
      cell: info => info.getValue() ?? '-',
    },
    {
      accessorKey: 'doc_cliente',
      header: 'Documento',
      cell: info => info.getValue() ?? '-',
    },
    {
      accessorFn: row => `${row.cidade_cliente ?? ''}${row.uf_cliente ? '/' + row.uf_cliente : ''}`,
      id: 'cidade_uf',
      header: 'Cidade/UF',
      cell: info => info.getValue() || '-',
    },
    {
      header: 'Ações',
      id: 'acoes',
      cell: info => {
        const cliente = info.row.original;
        return (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => onEdit(cliente)}
              className="text-blue-600 hover:text-blue-800"
              title="Editar"
            >
              <FiEdit />
            </button>
            <button
              onClick={() => onDelete(cliente.id!)}
              className="text-red-600 hover:text-red-800"
              title="Excluir"
            >
              <FiTrash2 />
            </button>
          </div>
        );
      },
      meta: { className: 'text-center' },
    },
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
        const cliente = info.row.original;
        return (
          <input
            type="checkbox"
            checked={selecionados.includes(cliente.id!)}
            onChange={() => toggleSelecionado(cliente.id!)}
            className="accent-green-600 w-5 h-5"
            aria-label={`Selecionar cliente ${cliente.id}`}
          />
        );
      },
      meta: { className: 'text-center' },
    }),
  ];

  const table = useReactTable({
    data: clientes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
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
                Carregando clientes...
              </td>
            </tr>
          ) : clientes.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                Nenhum cliente encontrado.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={`px-4 py-2 ${
                      (cell.column.columnDef.meta as ColumnMeta)?.className || ''
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
