// src/app/apontamento_tarefa/page.tsx
'use client';
import React, { useState } from 'react';
import { Tarefa } from '@/types/tarefas';
import FormSection from '@/components/(programacao)/novatarefas_producao/FormSection';
import DataTable from '@/components/(programacao)/novatarefas_producao/NovatarefasTable';
import ConfirmationModal from '@/components/ConfirmationModal';
import ProductModal from '@/components/produto/ProductModal_novastarefa';
import { FiSave, FiList, FiFilePlus } from 'react-icons/fi';
import AlertService from '@/services/alertservices';
import useNovaTarefasWS from '@/hooks/useNovaTarefasWS';

export default function ApontamentoTarefaPage() {
  // Prioridade inicial: mostra tarefas cadastradas
  const [activeTab, setActiveTab] = useState<'table' | 'form'>('table');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [tableData, setTableData] = useState<Tarefa[]>([]);
  const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);

  // Pega as tarefas disponíveis do hook (API/websocket)
  const {
    tarefas: availableTasks,
    isLoading,
    isError,
    refetch
  } = useNovaTarefasWS();

  // Adiciona nova tarefa criada na tabela local e muda para a aba de tarefas
  const handleAddRow = (newRow: Tarefa) => {
    setTableData(prev => [...prev, newRow]);
    setSelectedTask(null);
    setActiveTab('table');
  };

  // Seleciona uma tarefa para editar e muda para aba de formulário
  const handleSelectTask = (tarefa: Tarefa) => {
    setSelectedTask(tarefa);
    setActiveTab('form');
  };

  // Função para salvar as tarefas na API/backend com confirmação
  const handleSaveOrder = async () => {
    const confirmation = await AlertService.showConfirmation({
      title: "Confirmar envio?",
      message: "Você está prestes a salvar esta ordem de produção."
    });

    if (confirmation.isConfirmed) {
      AlertService.showLoading("Salvando ordem...");

      try {
        // Simulação de delay (trocar pela chamada real da API)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Se quiser, salva no backend, ex: await api.saveOrder(tableData);

        AlertService.closeAlerts();
        AlertService.showSuccess("Ordem salva com sucesso!");

        // Limpa a lista local após salvar
        setTableData([]);
      } catch (error) {
        AlertService.closeAlerts();
        AlertService.showAlert("Erro ao salvar ordem: " + (error as Error).message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 w-screen">
      <div className="w-full py-6">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Apontamento de Tarefa
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full max-w-[98%] min-h-[90vh]">
          {/* Abas */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'table'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('table')}
            >
              <FiList className="mr-2" />
              Tarefas Cadastradas ({tableData.length})
            </button>

            <button
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'form'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedTask(null); // Limpa edição ao abrir nova tarefa
                setActiveTab('form');
              }}
            >
              <FiFilePlus className="mr-2" />
              Nova Tarefa
            </button>
          </div>

          {/* Conteúdo das abas */}
          <div className="space-y-8">
            {activeTab === 'form' ? (
              <section className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b border-gray-300 pb-2 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                  </h2>
                  {selectedTask && (
                    <p className="text-sm text-gray-500 mt-1">
                      Editando tarefa #{selectedTask.id}
                    </p>
                  )}
                </div>

                <FormSection
                  onAddRow={handleAddRow}
                  onSave={() => setShowConfirmation(true)}
                  onOpenProductModal={() => setShowProductModal(true)}
                  selectedTask={selectedTask}
                />
              </section>
            ) : (
              <section className="bg-gray-50 p-6 border border-gray-300 rounded-lg shadow-sm">
                <div className="border-b border-gray-400 pb-2 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Tarefas Disponíveis</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Selecione uma tarefa para editar ou crie novas
                  </p>
                </div>

                {/* Tabela de tarefas disponíveis */}
                <div className="overflow-x-auto mb-8">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {availableTasks.map((tarefa) => (
                        <tr key={tarefa.id} className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{tarefa.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{tarefa.descricao}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Ativo
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => handleSelectTask(tarefa)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Selecionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-b border-gray-400 pb-2 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Tarefas Cadastradas</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {tableData.length} tarefa(s) pronta(s) para salvar
                  </p>
                </div>

                {/* Tabela das tarefas que o usuário adicionou para salvar */}
                <DataTable data={tableData} setData={setTableData} />

                <button
                  onClick={handleSaveOrder}
                  className="mt-6 flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  disabled={tableData.length === 0}
                >
                  <FiSave className="text-lg" />
                  Salvar Ordem
                </button>
              </section>
            )}
          </div>
        </div>

        {/* Modais */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={() => {
            setShowConfirmation(false);
            // Aqui você pode chamar a função real de salvar (ex: handleSaveOrder) se quiser
          }}
        />

        <ProductModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onSelectProduct={() => {
            setShowProductModal(false);
          }}
        />
      </div>
    </div>
  );
}
