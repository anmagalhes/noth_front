'use client';
import React, { useState, useEffect } from 'react';
import EditableTable from '@/components/lancamento_producao/EditableTable';
import TableControls from '@/components/lancamento_producao/TableControls';
//import EditModal from '@/components/EditModal';
import { TableRow, TableColumn } from '@/types/lancamento_producao';
import { fetchTableData, saveTableData } from '@/lib/lancamento_producao';

export default function MaintenanceSystem() {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    orcamento: '',
    pedido: ''
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchTableData();
      setTableData(data);
      setFilteredData(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    let result = [...tableData];

    if (filters.date) {
      result = result.filter(row => row.dataEntrada === filters.date);
    }

    if (filters.orcamento) {
      result = result.filter(row => row.orcamento.includes(filters.orcamento));
    }

    if (filters.pedido) {
      result = result.filter(row => row.pedido.includes(filters.pedido));
    }

    setFilteredData(result);
  }, [filters, tableData]);

  const handleEditCell = (rowId: number, field: TableColumn, value: string) => {
    setTableData(prevData =>
      prevData.map(row =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSelectRow = (rowId: number, selected: boolean) => {
    setTableData(prevData =>
      prevData.map(row =>
        row.id === rowId ? { ...row, selected } : row
      )
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setTableData(prevData =>
      prevData.map(row => ({ ...row, selected }))
    );
  };

  const handleCompleteInfo = () => {
    // Lógica para completar informações em massa
    const updatedData = tableData.map(row => ({
      ...row,
      // Preencher com valores padrão ou de outros campos
      observacao: row.observacao || 'Sem observações',
      status: row.status || 'ANDAMENTO NA PRODUÇÃO'
    }));
    setTableData(updatedData);
  };

  const handleSave = async () => {
    try {
      await saveTableData(tableData);
      alert('Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar dados');
    }
  };

  const handleFilterChange = (filter: string, value: string) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  const uniqueDates = [...new Set(tableData.map(row => row.dataEntrada))];

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <TableControls
            onFilterChange={handleFilterChange}
            onCompleteInfo={handleCompleteInfo}
            onSave={handleSave}
            onAdd={() => setIsModalOpen(true)}
          />

          <div className="overflow-auto max-h-[70vh] border rounded-lg">
            <EditableTable
              data={filteredData}
              onEdit={handleEditCell}
              onSelect={handleSelectRow}
              onSelectAll={handleSelectAll}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
