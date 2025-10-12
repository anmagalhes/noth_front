import { useEffect, useState } from 'react';
import axios from 'axios';
import { Tarefa } from '@/types/tarefas';

const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/novas-tarefas/tarefas`;

export function useBuscarTarefaPorId(tarefaId: string) {
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (!tarefaId) return;

    const fetchTarefa = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await axios.get(`${API_URL}/${tarefaId}`);
        setTarefa(response.data);
      } catch (error) {
        console.error('Erro ao buscar tarefa por ID:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTarefa();
  }, [tarefaId]);

  return { tarefa, isLoading, isError };
}
