// src/app/novas-tarefas/selecao/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import TabelaTarefas from '@/components/(programacao)/(novastarefas)/novas_tarefas/NovaTarefasUnicoTable';
import { Tarefa } from '@/types/tarefas';
import useNovaTarefasWS from '@/hooks/useNovaTarefasWS';

export default function SelecionarTarefaPage() {
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const router = useRouter();

  const {
    tarefas,
    isLoading,
    isError,
    refetch,
  } = useNovaTarefasWS();

  const handleSelect = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa);
  };

  const handleIncluirNovaTarefa = () => {
    if (!tarefaSelecionada) {
      toast.error('Selecione uma tarefa para continuar');
      return;
    }

    // Codifica os dados da tarefa para passar na URL
    const dadosCodificados = encodeURIComponent(JSON.stringify(tarefaSelecionada));
    router.push(`/apontamento_tarefa?tarefa=${dadosCodificados}`);
  };

  return (
    <div className="w-screen min-h-screen bg-slate-100 overflow-x-auto">
      <div className="py-6 min-w-[320px] sm:min-w-[640px] md:min-w-[1024px] lg:min-w-[1400px] mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold tracking-tight text-green-700 text-center sm:text-left mb-8">
            Selecionar Tarefa Existente
          </h1>
          <p className="text-gray-600 mb-6 text-center sm:text-left">
            Selecione uma tarefa abaixo para criar uma nova ordem de produção com base nela
          </p>

          {isLoading ? (
            <div className="flex justify-center py-16" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
            </div>
          ) : isError ? (
            <div className="text-center text-red-600 py-10">
              Erro ao carregar tarefas.
              <button onClick={() => refetch()} className="ml-2 underline text-blue-600">
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <TabelaTarefas
                tarefas={tarefas}
                onDelete={() => {}}
                isLoading={false}
                onRowClick={handleSelect}
                selectedTarefa={tarefaSelecionada}
              />

              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={handleIncluirNovaTarefa}
                  disabled={!tarefaSelecionada}
                  className={`px-8 py-3 rounded-md font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    tarefaSelecionada
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-offset-white'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  aria-disabled={!tarefaSelecionada}
                >
                  Usar esta Tarefa para Nova Ordem
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
