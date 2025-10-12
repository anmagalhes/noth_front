// src/components/apontamento_tarefa/TabNovaTarefa.tsx
'use client';

import React, { useState, useEffect } from 'react';
import FormSection from '@/components/(programacao)/novatarefas_producao/FormSection';
import ConfirmationModal from '@/components/ConfirmationModal';
import ProductModal from '@/components/produto/ProductModal_novastarefa';
import AlertService from '@/services/alertservices';
import { Tarefa } from '@/types/tarefas';

interface TabNovaTarefaProps {
  onSubmit: (tarefa: Tarefa) => void;
  selectedTask?: Tarefa | null;
}

export default function TabNovaTarefa({ onSubmit, selectedTask = null }: TabNovaTarefaProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [tarefaData, setTarefaData] = useState<Tarefa | null>(selectedTask);

  // Reseta o formulário quando muda a tarefa selecionada
  useEffect(() => {
    setTarefaData(selectedTask);
  }, [selectedTask]);

  const handleSave = () => {
    setShowConfirmation(true);
  };

  const confirmSave = () => {
    if (tarefaData) {
      onSubmit(tarefaData);
      setShowConfirmation(false);
    } else {
      AlertService.showAlert('Preencha os dados da tarefa antes de salvar.');
    }
  };

  return (
    <section className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-300 pb-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {tarefaData ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h2>
      </div>

      <FormSection
        tarefaSelecionada={tarefaData || undefined}
        onAddRow={(t: Tarefa) => setTarefaData(t)}
        onOpenProductModal={() => setShowProductModal(true)}
        onSave={handleSave}
      />

      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelectProduct={(prod) => {
          // Preencha o produto dentro de FormSection via estado
          setTarefaData(prev => prev ? { ...prev, product: prod } : prev);
          setShowProductModal(false);
        }}
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmSave}
      />
    </section>
  );
}
