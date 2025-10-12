'use client';

import { useState, useEffect } from 'react';
import FormTarefa from '@/components/(programacao)/(novastarefas)/novas_tarefas/NovasTarefasform';
import TabelaTarefas from '@/components/(programacao)/(novastarefas)/novas_tarefas/NovasTarefasTable';
import { Tarefa, NewTarefa } from '@/types/tarefas';
import { fetchInitialData, saveTarefa, deleteTarefas } from '@/utils/api';
import { toast } from 'react-hot-toast';
import { FaSave } from 'react-icons/fa';

export default function NovasTarefasPage() {
  // Estado para controle da aba selecionada (form ou tabela)
  const [tabSelecionada, setTabSelecionada] = useState<'form' | 'tabela'>('form');
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [initialData, setInitialData] = useState<Partial<Tarefa>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedTarefas = async (): Promise<Tarefa[]> => {
    try {
      // Simulação de fetch, substitua pelo fetch real
      return [
        {
          id: 1,
          dataLancamento: '2023-10-15',
          numeroControle: 'CTRL-001',
          clienteNome: 'Cliente Exemplo',
          quantidade: 5,
          codigoProduto: 'PROD-123',
          descricaoProduto: 'Produto de exemplo',
          operacao: 'OP-456',
          observacao: 'Observação de teste',
        },
        {
          id: 2,
          dataLancamento: '2023-10-16',
          numeroControle: 'CTRL-002',
          clienteNome: 'Outro Cliente',
          quantidade: 3,
          codigoProduto: 'PROD-456',
          descricaoProduto: 'Outro produto',
          operacao: 'OP-789',
          observacao: 'Mais uma observação',
        },
      ];
    } catch {
      toast.error('Erro ao carregar tarefas salvas');
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [initial, savedTasks] = await Promise.all([fetchInitialData(), fetchSavedTarefas()]);
        setInitialData(initial);
        setTarefas(savedTasks);
      } catch {
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (data: Partial<Tarefa>) => {
    try {
      setIsLoading(true);
      const tarefaCompleta: NewTarefa = {
        dataLancamento: data.dataLancamento || initialData.dataLancamento || '',
        numeroControle: data.numeroControle || initialData.numeroControle || '',
        clienteNome: data.clienteNome || initialData.clienteNome || '',
        quantidade: data.quantidade || 0,
        codigoProduto: data.codigoProduto || '',
        descricaoProduto: data.descricaoProduto || '',
        operacao: data.operacao || '',
        observacao: data.observacao || '',
      };

      const novaTarefa = await saveTarefa(tarefaCompleta);
      setTarefas(prev => [...prev, novaTarefa]);
      toast.success('Tarefa adicionada com sucesso!');
    } catch {
      toast.error('Erro ao salvar tarefa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (ids: number[]) => {
    try {
      setIsLoading(true);
      await deleteTarefas(ids);
      setTarefas(prev => prev.filter(t => !ids.includes(t.id)));
      toast.success(`${ids.length} tarefa(s) excluída(s) com sucesso!`);
    } catch {
      toast.error('Erro ao excluir tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsLoading(true);
      // TODO: implementar salvar todas as tarefas
      toast.success('Todas as tarefas foram salvas com sucesso!');
    } catch {
      toast.error('Erro ao salvar tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-slate-100 overflow-x-auto">
      <div className="py-6 min-w-[320px] sm:min-w-[640px] md:min-w-[1024px] lg:min-w-[1400px] mx-auto">

        {/* Abas à esquerda + Título centralizado (responsivo e profissional) */}
        <div className="relative flex flex-wrap items-center justify-center sm:justify-between mb-6 px-4 sm:px-6">
          {/* Abas à esquerda */}
          <nav
            aria-label="Navegação de abas"
            className="absolute left-4 sm:static flex space-x-2"
          >
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 ${
                tabSelecionada === 'form'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setTabSelecionada('form')}
              aria-selected={tabSelecionada === 'form'}
              role="tab"
              id="tab-form"
              aria-controls="tabpanel-form"
            >
              Nova Tarefa
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 ${
                tabSelecionada === 'tabela'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setTabSelecionada('tabela')}
              aria-selected={tabSelecionada === 'tabela'}
              role="tab"
              id="tab-tabela"
              aria-controls="tabpanel-tabela"
            >
              Tarefas Cadastradas
            </button>
          </nav>

          {/* Título centralizado */}
          <h1
            className="text-2xl font-bold text-green-700 mx-auto"
            aria-label="Cadastro de Nova Ordem"
          >
            Aprontamento de Tarefas
          </h1>
        </div>

        {/* Conteúdo da aba */}
        <section
          className="bg-white p-6 rounded-lg shadow-md min-h-[500px] flex flex-col justify-between"
          role="tabpanel"
          aria-labelledby={tabSelecionada === 'form' ? 'tab-form' : 'tab-tabela'}
          id={tabSelecionada === 'form' ? 'tabpanel-form' : 'tabpanel-tabela'}
        >
          {tabSelecionada === 'form' ? (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Cadastrar Nova Tarefa
              </h2>
              <FormTarefa
                onSubmit={handleSubmit}
                initialData={initialData}
                isLoading={isLoading}
              />
            </>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Tarefas Salvas
                </h2>
                {isLoading ? (
                  <div
                    className="flex items-center justify-center py-10"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
                  </div>
                ) : (
                  <TabelaTarefas tarefas={tarefas} onDelete={handleDelete} isLoading={isLoading} />
                )}
              </div>

              {!isLoading && (
                <footer className="pt-4 mt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-sm text-gray-600" aria-live="polite">
                    {tarefas.length > 0
                      ? `Total de tarefas: ${tarefas.length}`
                      : 'Nenhuma tarefa cadastrada'}
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={tarefas.length === 0}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      tarefas.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <FaSave className="mr-2" />
                    Salvar Todas
                  </button>
                </footer>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
