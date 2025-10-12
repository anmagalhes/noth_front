import React from 'react';

interface TableControlsProps {
  onFilterChange: (filter: string, value: string) => void;
  onCompleteInfo: () => void;
  onSave: () => void;
  onAdd: () => void;
}

const TableControls: React.FC<TableControlsProps> = ({
  onFilterChange,
  onCompleteInfo,
  onSave,
  onAdd
}) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Filtrar por Data:</label>
        <select
          onChange={(e) => onFilterChange('date', e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Todas as datas</option>
          {/* Opções serão preenchidas dinamicamente */}
        </select>
      </div>

      <div className="flex items-end gap-3">
        <button
          onClick={onAdd}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full"
        >
          <span className="material-icons mr-2">add</span>
          Adicionar
        </button>

        <button
          onClick={onCompleteInfo}
          className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-full"
        >
          <span className="material-icons mr-2">edit</span>
          Completar
        </button>

        <button
          onClick={onSave}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full"
        >
          <span className="material-icons mr-2">save</span>
          Salvar
        </button>
      </div>
    </div>
  );
};

export default TableControls;
