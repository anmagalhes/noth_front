import React, { useState } from 'react';
import { TableRow, TableColumn } from '@/types/types';

interface EditableTableProps {
  data: TableRow[];
  onEdit: (rowId: number, field: TableColumn, value: string) => void;
  onSelect: (rowId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({
  data,
  onEdit,
  onSelect,
  onSelectAll
}) => {
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    field: TableColumn
  } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCellClick = (rowId: number, field: TableColumn, currentValue: string) => {
    setEditingCell({ rowId, field });
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (editingCell) {
      onEdit(editingCell.rowId, editingCell.field, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const allSelected = data.length > 0 && data.every(row => row.selected);

  const columns: TableColumn[] = [
    'dataEntrada', 'orcamento', 'pedido', 'numeroControle', 'seq', 'cliente',
    'codigo', 'quantidade', 'operacao', 'descricao', 'observacao', 'notaFiscal',
    'dataProducao', 'prazoEntrega', 'status'
  ];

  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white text-xs">
        <thead>
          <tr className="bg-green-500 text-white">
            <th className="py-2 px-3 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-4 w-4"
              />
            </th>
            {columns.map((column) => (
              <th key={column} className="py-2 px-3 text-left uppercase tracking-wider">
                {column.replace(/([A-Z])/g, ' $1').trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className={`border-b hover:bg-gray-50 ${row.selected ? 'bg-gray-100' : ''}`}
            >
              <td className="py-1 px-2 text-center">
                <input
                  type="checkbox"
                  checked={row.selected}
                  onChange={(e) => onSelect(row.id, e.target.checked)}
                  className="h-4 w-4"
                />
              </td>

              {columns.map((column) => (
                <td
                  key={`${row.id}-${column}`}
                  className={`py-1 px-2 ${
                    editingCell?.rowId === row.id && editingCell.field === column
                      ? 'bg-gray-200 border border-dashed border-gray-500'
                      : 'cursor-pointer'
                  }`}
                  onClick={() => handleCellClick(row.id, column, row[column])}
                >
                  {editingCell?.rowId === row.id && editingCell.field === column ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSave}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full p-1 text-xs border-none bg-transparent focus:outline-none"
                    />
                  ) : (
                    <div className="min-h-[24px] flex items-center">
                      {row[column]}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditableTable;
