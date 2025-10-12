import React, { useMemo, useState, useCallback } from 'react';
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
import { TableRow } from '@/types/tarefas';
import { FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import AlertService from '@/services/alertservices';
import { rowSchema } from '@/components/Zod-schemas/NovasTarefas_producao';


interface DataTableProps {
  data: TableRow[];
  setData: React.Dispatch<React.SetStateAction<TableRow[]>>;
}

type TableRow = z.infer<typeof rowSchema>;

const isRowEmpty = (row: TableRow): boolean => {
  // Primeiro, validamos o row com o schema
  const validation = rowSchema.safeParse(row);
  if (!validation.success) {
    console.warn('Linha inválida:', validation.error);
    return false; // Ou true, dependendo da lógica que você quiser
  }

  const data = validation.data;

  return !data.date &&
         !data.controlNumber &&
         !data.clientName &&
         !data.quantity &&
         !data.productCode &&
         !data.productDescription &&
         !data.operation &&
         !data.notes;
};


// Função para exibir alertas
const showAlert = (message: string) => {
  Swal.fire({
    title: "Atenção!",
    text: message,
    icon: "warning",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Entendi!",
  });
};


const DataTable = ({ data, setData }: DataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [batchEditMode, setBatchEditMode] = useState(false);
  const [editableRows, setEditableRows] = useState<Record<string, TableRow>>({});

  // Funções para edição individual
  const startEditing = useCallback((rowId: string) => {
    setEditingRowId(rowId);
    const row = data.find(d => d.id === rowId);
    if (row) {
      setEditableRows(prev => ({
        ...prev,
        [rowId]: { ...row }
      }));
    }
  }, [data]);

  const saveEditing = useCallback((rowId: string) => {
    const editedRow = editableRows[rowId];
    if (editedRow) {
      setData(prev => prev.map(row => row.id === rowId ? editedRow : row));
    }
    setEditingRowId(null);
  }, [editableRows, setData]);

  const cancelEditing = useCallback(() => {
    setEditingRowId(null);
  }, []);

  // Funções para edição em lote
  const startBatchEditing = useCallback(() => {
    setBatchEditMode(true);
    const newEditableRows: Record<string, TableRow> = {};
    Object.keys(rowSelection).forEach(id => {
      if (rowSelection[id]) {
        const row = data.find(d => d.id === id);
        if (row) {
          newEditableRows[id] = { ...row };
        }
      }
    });
    setEditableRows(newEditableRows);
  }, [rowSelection, data]);

  const saveBatchEditing = useCallback(() => {
    setData(prev => prev.map(row =>
      editableRows[row.id] ? editableRows[row.id] : row
    ));
    setBatchEditMode(false);
    setEditableRows({});
    setRowSelection({});
  }, [editableRows, setData]);

  const cancelBatchEditing = useCallback(() => {
    setBatchEditMode(false);
    setEditableRows({});
  }, []);

  // Funções para exclusão
  const deleteSelected = useCallback(() => {
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
    setData(prev => prev.filter(row => !selectedIds.includes(row.id)));
    setRowSelection({});
  }, [rowSelection, setData]);

  const deleteRow = useCallback((rowId: string) => {
    setData(prev => prev.filter(row => row.id !== rowId));
  }, [setData]);

  // Seleção de linhas
  const toggleRowSelect = useCallback((rowId: string) => {
    setRowSelection(prev => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  const toggleSelectAll = useCallback(() => {
    setRowSelection(prev => {
      const allSelected = Object.keys(prev).length === data.length &&
                         Object.values(prev).every(Boolean);
      if (allSelected) {
        return {};
      } else {
        return data.reduce((acc, row) => {
          acc[row.id] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }
    });
  }, [data]);

  // Colunas da tabela
  const columns = useMemo<ColumnDef<TableRow>[]>(() => [
    {
      accessorKey: 'date',
      header: 'Data',
      size: 100,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const isEditing = batchEditMode ? rowSelection[rowId] : editingRowId === rowId;

        if (isEditing) {
          return (
            <input
              type="date"
              value={editableRows[rowId]?.date || ''}
              onChange={(e) => setEditableRows(prev => ({
                ...prev,
                [rowId]: {
                  ...prev[rowId],
                  date: e.target.value
                }
              }))}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          );
        }
        return <div className="text-center px-2">{row.original.date}</div>;
      },
    },
    {
      accessorKey: 'controlNumber',
      header: 'Nº Controle',
      size: 120,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const isEditing = batchEditMode ? rowSelection[rowId] : editingRowId === rowId;

        if (isEditing) {
          return (
            <input
              type="text"
              value={editableRows[rowId]?.controlNumber || ''}
              onChange={(e) => setEditableRows(prev => ({
                ...prev,
                [rowId]: {
                  ...prev[rowId],
                  controlNumber: e.target.value
                }
              }))}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          );
        }
        return <div className="text-center px-2">{row.original.controlNumber}</div>;
      },
    },
    {
      accessorKey: 'clientName',
      header: 'Cliente',
      size: 150,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const isEditing = batchEditMode ? rowSelection[rowId] : editingRowId === rowId;

        if (isEditing) {
          return (
            <input
              type="text"
              value={editableRows[rowId]?.clientName || ''}
              onChange={(e) => setEditableRows(prev => ({
                ...prev,
                [rowId]: {
                  ...prev[rowId],
                  clientName: e.target.value
                }
              }))}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          );
        }
        return <div className="text-center px-2">{row.original.clientName}</div>;
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Qtd',
      size: 80,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const isEditing = batchEditMode ? rowSelection[rowId] : editingRowId === rowId;

        if (isEditing) {
          return (
            <input
              type="number"
              min="1"
              value={editableRows[rowId]?.quantity || 1}
              onChange={(e) => setEditableRows(prev => ({
                ...prev,
                [rowId]: {
                  ...prev[rowId],
                  quantity: Number(e.target.value)
                }
              }))}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          );
        }
        return <div className="text-center px-2">{row.original.quantity}</div>;
      },
    },
    {
      accessorKey: 'productCode',
      header: 'Cód',
      size: 100,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const isEditing = batchEditMode ? rowSelection[rowId] : editingRowId === rowId;

        if (isEditing) {
          return (
            <input
              type="text"
              value={editableRows[rowId]?.productCode || ''}
              onChange={(e) => setEditableRows(prev => ({
                ...prev,
                [rowId]: {
                  ...prev[rowId],
                  productCode: e.target.value
                }
              }))}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          );
        }
        return <div className="text-center px-2">{row.original.productCode}</div>;
      },
    },
    {
      accessorKey: 'productDescription',
      header: 'Descrição',
      size: 200,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const isEditing = batchEditMode ? rowSelection[rowId] : editingRowId === rowId;

        if (isEditing) {
          return (
            <textarea
              value={editableRows[rowId]?.productDescription || ''}
              onChange={(e) => setEditableRows(prev => ({
                ...prev,
                [rowId]: {
                  ...prev[rowId],
                  productDescription: e.target.value
                }
              }))}
              className="w-full border rounded px-2 py-1 text-sm"
              rows={2}
            />
          );
        }
        return <div className="text-center px-2">{row.original.productDescription}</div>;
      },
    },
    {
      accessorKey: 'operation',
      header: 'Op',
      size: 100,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const isEditing = batchEditMode ? rowSelection[rowId] : editingRowId === rowId;

        if (isEditing) {
          return (
            <input
              type="text"
              value={editableRows[rowId]?.operation || ''}
              onChange={(e) => setEditableRows(prev => ({
                ...prev,
                [rowId]: {
                  ...prev[rowId],
                  operation: e.target.value
                }
              }))}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          );
        }
        return <div className="text-center px-2">{row.original.operation}</div>;
      },
    },
    {
      accessorKey: 'notes',
      header: 'Observação',
      size: 200,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const isEditing = batchEditMode ? rowSelection[rowId] : editingRowId === rowId;

        if (isEditing) {
          return (
            <textarea
              value={editableRows[rowId]?.notes || ''}
              onChange={(e) => setEditableRows(prev => ({
                ...prev,
                [rowId]: {
                  ...prev[rowId],
                  notes: e.target.value
                }
              }))}
              className="w-full border rounded px-2 py-1 text-sm"
              rows={2}
            />
          );
        }
        return <div className="text-center px-2">{row.original.notes}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      size: 150,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const isEditingIndividual = editingRowId === rowId;
        const isEditing = batchEditMode ? rowSelection[rowId] : isEditingIndividual;

        if (isEditingIndividual) {
          return (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => saveEditing(rowId)}
                className="text-green-600 hover:text-green-800"
                title="Salvar"
              >
                <FiSave size={18} />
              </button>
              <button
                onClick={cancelEditing}
                className="text-gray-600 hover:text-gray-800"
                title="Cancelar"
              >
                <FiX size={18} />
              </button>
            </div>
          );
        }

        if (batchEditMode) {
          return null;
        }

        return (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => startEditing(rowId)}
              className="text-blue-600 hover:text-blue-800"
              title="Editar"
            >
              <FiEdit size={18} />
            </button>
            <button
              onClick={() => deleteRow(rowId)}
              className="text-red-600 hover:text-red-800"
              title="Excluir"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        );
      },
    },
    {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={Object.keys(rowSelection).length > 0 &&
                  Object.keys(rowSelection).length === data.length}
          onChange={toggleSelectAll}
          className="accent-green-600 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-green-500"
          aria-label="Selecionar todos"
        />
      ),
      size: 50,
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={rowSelection[row.original.id] || false}
          onChange={() => toggleRowSelect(row.original.id)}
          className="accent-green-600 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-green-500"
          aria-label={`Selecionar ${row.original.controlNumber}`}
        />
      ),
    },
  ], [
    batchEditMode, editingRowId, rowSelection, editableRows,
    toggleSelectAll, data.length, toggleRowSelect,
    saveEditing, cancelEditing, startEditing, deleteRow
  ]);

  // Configuração da tabela
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    enableRowSelection: true,
    enableMultiRowSelection: true,
  });

  // Contador de linhas selecionadas
  const selectedCount = Object.keys(rowSelection).filter(id => rowSelection[id]).length;

  // Mensagem quando não há dados
  if (data.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
        <p className="text-gray-500">Nenhum registro encontrado</p>
        <p className="text-sm text-gray-400 mt-2">
          Adicione novos itens usando o formulário acima
        </p>
      </div>
    );
  }


const handleSaveSelectedOrder = async () => {
  // Filtrar apenas linhas selecionadas
 const selectedRows = data.filter(row => rowSelection[row.id]);


  if (selectedRows.length === 0) {
    AlertService.showAlert('Selecione pelo menos uma tarefa antes de salvar');
    return;
  }

  const confirmation = await AlertService.showConfirmation({
    title: "Confirmar envio?",
    message: `Você está prestes a salvar ${selectedRows.length} tarefa(s) selecionada(s).`
  });

  if (confirmation.isConfirmed) {
    AlertService.showLoading("Salvando tarefas selecionadas...");

    try {
      // Preparar dados para o backend
    const payload = selectedRows.map(row => ({
      id_tarefa_original: row.tarefaId, // ID real do banco
      os_formatado: row.controlNumber,
      id_cliente: row.idCliente,
      id_produto: row.idProduto,
      data_lancamento: row.date,
      nome_cliente: row.clientName,
      quantidade: row.quantity,
      codigo_produto: row.productCode,
      descricao_produto: row.productDescription,
      operacao: row.operation,
      notas: row.notes
    }));

    console.log("📤 Enviando para o backend:", payload);

    // Chamada API real (substitua pela sua implementação)
    const response = await fetch('/api/salvar-tarefas', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Erro na resposta do servidor');

      // Simulação de chamada API
     // await new Promise(resolve => setTimeout(resolve, 1500));

      // Atualizar a tabela: remover as linhas salvas
      setData(prev => prev.filter(row => !rowSelection[row.id]));

      // Limpar seleção
      setRowSelection({});

      AlertService.closeAlerts();
      AlertService.showSuccess(`${selectedRows.length} tarefa(s) salva(s) com sucesso!`);
    } catch (error) {
      AlertService.closeAlerts();
      AlertService.showAlert("Erro ao salvar tarefas: " + (error as Error).message);
    }
  }
};

  return (
    <div className="my-4 space-y-4">
      {/* Botões de ação em lote */}
      {selectedCount > 0 && !batchEditMode && (
        <div className="flex gap-3 justify-end">
          <button
            onClick={deleteSelected}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition flex items-center gap-2"
          >
            <FiTrash2 /> Excluir Selecionados
          </button>
          <button
            onClick={startBatchEditing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center gap-2"
          >
            <FiEdit /> Editar Selecionados
          </button>

        {/* Novo botão para salvar no banco */}
        <button
          onClick={handleSaveSelectedOrder}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
        >
          <FiSave /> Salvar Selecionados
        </button>

        </div>
      )}

      {/* Botões para edição em lote */}
      {batchEditMode && (
        <div className="flex gap-3 justify-end">
          <button
            onClick={saveBatchEditing}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition flex items-center gap-2"
          >
            <FiSave /> Salvar Tudo
          </button>
          <button
            onClick={cancelBatchEditing}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition flex items-center gap-2"
          >
            <FiX /> Cancelar
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto border rounded-lg shadow max-h-[calc(100vh-300px)]">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-green-600 text-white z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold"
                    style={{ width: header.getSize() }}
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: `flex items-center ${
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : ''
                          }`,
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => {
              const rowId = row.original.id;
              const isEditing = batchEditMode ? rowSelection[rowId] : editingRowId === rowId;
              console.log('aaaa')
              console.log(rowId )

            // Ocultar linha 0 somente se estiver vazia
                if (row.index === 0 && isRowEmpty(row.original)) return null;

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${
                    rowSelection[rowId] ? 'bg-blue-50' : ''
                  } ${isEditing ? 'bg-yellow-50' : ''}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="py-3"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Controles de paginação */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          {selectedCount} de {data.length} linha(s) selecionada(s)
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">Linhas por página:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;

