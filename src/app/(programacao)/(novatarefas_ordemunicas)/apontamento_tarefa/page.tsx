// src/app/apontamento_tarefa/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import FormSection from '@/components/(programacao)/(novastarefas)/apontamento_tarefa/FormSection';
import DataTable from '@/components/(programacao)/(novastarefas)/apontamento_tarefa/NovatarefasTable'
import ConfirmationModal from '@/components/ConfirmationModal';
import ProductModal from '@/components/produto/ProductModal_novastarefa';
import { TableRow, Tarefa } from '@/types/tarefas';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import AlertService from '@/services/alertservices';
import Link from 'next/link';
import { useBuscarTarefaPorId } from '@/hooks/useBuscarTarefaPorId';
import { mapTableRowToBackendPayload, mapToItemTarefaCreatePayload } from '@/components/Zod-schemas/NovasTarefas_producao';
import { rowSchema } from '@/components/Zod-schemas/NovasTarefas_producao';
import { Status_tarefa } from "@/types/status";

export default function ApontamentoTarefaPage() {
  const searchParams = useSearchParams();
  const tarefaId = searchParams.get('tarefaId');

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [data, setdata] = useState<TableRow[]>([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({});

  // Busca os dados completos da tarefa usando o ID
  const { tarefa, isLoading } = useBuscarTarefaPorId(tarefaId ? parseInt(tarefaId) : null);

  useEffect(() => {
    if (tarefa) {
      console.log('🔍 Tarefa carregada da API via tarefaId:', tarefa);
      setTarefaSelecionada(tarefa);

      const novaLinha: TableRow = {
        ...tarefa,
        id: Date.now().toString(),
        quantidade: 1,
        data: new Date().toISOString().split('T')[0],
        tarefaId: tarefa.id,
      };

      console.log('🧩 Adicionando tarefa à tabela:', novaLinha);
      setdata([novaLinha]);
    } else {
      console.log('⚠️ Nenhuma tarefa encontrada ou ainda não carregada.');
    }
  }, [tarefa]);

  const handleAddRow = (newRow: TableRow) => {
    setdata([...data, newRow]);
  };


  //ATUALIZAR A O STATUS TAREFA ANTES CRIAR AS OS INTES DELA.
  const atualizarTarefaNoBackend = async (id: number, status: string) => {

  const response = await fetch(`http://localhost:8000/api/novas-tarefas/atualizarTarefa`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar tarefa no servidor');
  }

  return response.json();
};


// VERIFICAR A PRIMEIRA LINHA SE ESTÁ VAZIA, EXATAMENTE O LINHA TAREFA PAI.
const isRowEmpty = (row: TableRow): boolean => {
  const validation = rowSchema.safeParse(row);
  if (!validation.success) {
    console.warn('Linha inválida:', validation.error);
    return false; // Considera como "não vazia" se estrutura for inválida
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

const handleSaveOrder = async () => {
  if (data.length === 0) {
    AlertService.showAlert('Adicione pelo menos uma tarefa antes de salvar');
    return;
  }

  const selectedRows = data.filter(row => rowSelection[row.id]);

  // Se nenhuma linha foi selecionada, perguntar se deseja salvar todas
  if (selectedRows.length === 0) {
    const confirmSaveAll = await AlertService.showConfirmation({
      title: "Nenhuma tarefa selecionada",
      message: "Você não selecionou nenhuma tarefa. Deseja salvar todas da tabela?"
    });

    if (!confirmSaveAll.isConfirmed) return;

    // VERIFICA SE A PRIMEIRA LINHA ESTÁ VAZIA
    const linhaVazia = data[0] && isRowEmpty(data[0]) ? data[0] : null;
    let tarefaIdParaAtualizar: number | null = null;

    if (linhaVazia) {
      // Usa o tarefaId da linha vazia se tiver, senão pega da segunda linha
      if (linhaVazia.tarefaId) {
        tarefaIdParaAtualizar = linhaVazia.tarefaId;
      } else if (data[1]?.tarefaId) {
        tarefaIdParaAtualizar = data[1].tarefaId;
      }

      if (tarefaIdParaAtualizar) {
        try {
          console.log('Atualizando tarefa pai com ID:', tarefaIdParaAtualizar, 'Status:', Status_tarefa.AGUARDANDO_APROVACAO);
          AlertService.showLoading("Atualizando tarefa pai vazia...");
          await atualizarTarefaNoBackend(tarefaIdParaAtualizar, Status_tarefa.AGUARDANDO_APROVACAO);
          AlertService.closeAlerts();
        } catch (error) {
          AlertService.closeAlerts();
          AlertService.showAlert("Erro ao atualizar tarefa pai: " + (error as Error).message);
          return;
        }
      } else {
        console.warn("⚠️ Nenhum tarefaId encontrado para atualizar a tarefa pai vazia.");
      }
    }

    AlertService.showLoading("Salvando todas as tarefas...");

    try {
      // Faz uma cópia do array e remove a primeira linha se ela estiver vazia
      const tarefasParaSalvar = [...data];
      if (isRowEmpty(tarefasParaSalvar[0])) {
        tarefasParaSalvar.shift(); // remove a primeira linha vazia
      }

      const payload = tarefasParaSalvar.map(mapToItemTarefaCreatePayload);

      console.log("📤 Enviando TODAS as tarefas (exceto linha vazia):", payload);

      const response = await fetch('http://localhost:8000/api/novas-tarefas-item/itens-tarefa/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erro ao salvar no servidor');

      setdata([]);
      setRowSelection({});
      setTarefaSelecionada(null);
      AlertService.closeAlerts();
      AlertService.showSuccess(`${payload.length} tarefa(s) salvas com sucesso!`);
    } catch (error) {
      AlertService.closeAlerts();
      AlertService.showAlert("Erro ao salvar tarefas: " + (error as Error).message);
    }

    return;
  }

  // Se houver seleção, salvar apenas as selecionadas
  const confirmation = await AlertService.showConfirmation({
    title: "Confirmar envio?",
    message: `Você está prestes a salvar ${selectedRows.length} tarefa(s) selecionada(s).`
  });

  if (!confirmation.isConfirmed) return;

  AlertService.showLoading("Salvando tarefas selecionadas...");

  try {
    // Usa o selectedRows já filtrado antes
    const payload = selectedRows.map(mapToItemTarefaCreatePayload);

    console.log("📤 Enviando tarefas selecionadas:", payload);

    const response = await fetch('http://localhost:8000/api/novas-tarefas-item/itens-tarefa/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Erro ao salvar no servidor');

    // Remove só as que foram salvas
    setdata(prev => prev.filter(row => !rowSelection[row.id]));
    setRowSelection({});
    setTarefaSelecionada(null);
    AlertService.closeAlerts();
    AlertService.showSuccess(`${selectedRows.length} tarefa(s) salvas com sucesso!`);
  } catch (error) {
    AlertService.closeAlerts();
    AlertService.showAlert("Erro ao salvar tarefas: " + (error as Error).message);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 m-0 p-0 w-screen">
      <div className="w-full py-6">
        <div className="flex justify-center mb-4">
          <Link href="/novatarefas_aprontamento" className="flex items-center text-blue-600 hover:text-blue-800">
            <FiArrowLeft className="mr-2" />
            Voltar para seleção de tarefas
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Novas Tarefas
        </h1>

        {/* Container principal branco com sombra */}
        <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full max-w-[98%] min-h-[90vh] space-y-8">

          {/* Seção do formulário */}
          <section className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-300 pb-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Editar Tarefa para Nova Ordem
              </h2>
              {tarefaSelecionada && (
                <p className="text-sm text-gray-500">
                  Tarefa base: {tarefaSelecionada.dataLancamento} (ID: {tarefaSelecionada.id})
                </p>
              )}
              {isLoading && (
                <p className="text-sm text-blue-500">Carregando dados da tarefa...</p>
              )}
            </div>
            <FormSection
              onAddRow={handleAddRow}
              tarefaSelecionada={tarefaSelecionada}
              onSave={() => setShowConfirmation(true)}
              onOpenProductModal={() => setShowProductModal(true)}
              isUsingExistingTask={!!tarefaId}
            />
          </section>

          {/* Seção da tabela */}
          <section className="bg-gray-50 p-6 border border-gray-300 rounded-lg shadow-sm">
            <div className="border-b border-gray-400 pb-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Ordem de Produção</h2>
              <p className="text-sm text-gray-500">
                {data.length} tarefa(s) na ordem
              </p>
            </div>

            <DataTable
                  data={data}
                  setData={setdata}
                  rowSelection={rowSelection}
                  setRowSelection={setRowSelection}
                />

            <button
              onClick={handleSaveOrder}
              className="mt-6 flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={data.length === 0}
            >
              <FiSave className="text-lg" />
              Salvar Ordem de Produção
            </button>
          </section>
        </div>

        {/* Modais */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={() => {
            // Lógica para salvar no backend
            setShowConfirmation(false);
          }}
        />

        <ProductModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onSelectProduct={(product) => {
            // Lógica para preencher formulário
            setShowProductModal(false);
          }}
        />
      </div>
    </div>
  );
}
