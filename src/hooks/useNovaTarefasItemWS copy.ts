'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/novas_tarefas_item/tarefa_item`;  // endpoint REST itens tarefa
const WS_URL = 'ws://localhost:8000/api/novas_tarefas_item/ws/tarefa_item'; // endpoint WS itens tarefa

interface ItemTarefa {
  id: number;
  descricao: string;
  status: string;
  // adicione mais campos conforme seu schema
}

interface ItemTarefaResponse {
  data: ItemTarefa[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const fetchItensTarefa = async (page = 1, limit = 20): Promise<ItemTarefaResponse> => {
  const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Erro ao buscar itens de tarefa');
  return res.json();
};

export default function useNovaTarefasItemWS(page = 1, limit = 20) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  let reconnectAttempts = 0;
  let isUnmounted = false;

  const itensTarefaQuery = useQuery({
    queryKey: ['itens-tarefa', page, limit],
    queryFn: () => fetchItensTarefa(page, limit),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const connectWebSocket = () => {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close(1000, 'Fechando conexão anterior');
      }

      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('✅ WebSocket conectado:', WS_URL);
          reconnectAttempts = 0;
        };

        ws.onerror = (event) => {
          console.error('❌ Erro no WebSocket:', event);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('📨 Mensagem WebSocket recebida:', message);

            if (message === 'update_item_tarefa') {  // de acordo com sua mensagem enviada no backend
              debounceInvalidate();
            }
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        };

        ws.onclose = (event) => {
          console.warn(`🔌 WebSocket fechado: código=${event.code}, motivo=${event.reason}, limpo=${event.wasClean}`);

          if (!isUnmounted && event.code !== 1000) {
            reconnectAttempts++;
            const delay = Math.min(5000, 1000 * Math.pow(2, reconnectAttempts));
            console.log(`⏳ Reconectando em ${delay / 1000}s...`);

            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }

            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Tentando reconectar...');
              connectWebSocket();
            }, delay);
          }
        };
      } catch (error) {
        console.error('❌ Erro ao criar WebSocket:', error);
      }
    };

    const debounceInvalidate = () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        console.log('♻️ Invalidando dados via WebSocket');
        queryClient.invalidateQueries({ queryKey: ['itens-tarefa', page, limit] });
        debounceTimeoutRef.current = null;
      }, 500);
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close(1000, 'Componente desmontado');
        wsRef.current = null;
      }
    };
  }, [queryClient, page, limit]);

  return {
    itensTarefa: itensTarefaQuery.data?.data ?? [],
    pageInfo: {
      page: itensTarefaQuery.data?.page ?? page,
      limit: itensTarefaQuery.data?.limit ?? limit,
      total: itensTarefaQuery.data?.total ?? 0,
      pages: itensTarefaQuery.data?.pages ?? 0,
    },
    isLoading: itensTarefaQuery.isLoading,
    isError: itensTarefaQuery.isError,
    refetch: itensTarefaQuery.refetch,
  };
}
