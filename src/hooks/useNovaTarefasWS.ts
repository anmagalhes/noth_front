'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tarefa } from '@/types/tarefas';

const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/novas-tarefas/tarefas`;
const WS_URL = 'ws://localhost:8000/api/novas-tarefas/ws/tarefa';

interface TarefaResponse {
  data: Tarefa[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const fetchTarefas = async (page = 1, limit = 20): Promise<TarefaResponse> => {
  const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Erro ao buscar tarefas');
  return res.json();
};

export default function useNovaTarefasWS(page = 1, limit = 20) {
  const queryClient = useQueryClient();

  // Estados para status da conexão WS
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);
  const messageQueueRef = useRef<string[]>([]); // Fila para mensagens recebidas

  const MAX_RECONNECT_ATTEMPTS = 10;
  const DEBOUNCE_DELAY = 1000; // 1s debounce para invalidar query

  const tarefasQuery = useQuery({
    queryKey: ['tarefas', page, limit],
    queryFn: () => fetchTarefas(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const processMessageQueue = () => {
    if (debounceTimeoutRef.current) return; // debounce ativo

    debounceTimeoutRef.current = setTimeout(() => {
      if (messageQueueRef.current.length > 0) {
        console.log(`♻️ Invalidando dados via WebSocket após receber ${messageQueueRef.current.length} mensagens`);
        queryClient.invalidateQueries({ queryKey: ['tarefas', page, limit] });
        messageQueueRef.current = [];
      }
      debounceTimeoutRef.current = null;
    }, DEBOUNCE_DELAY);
  };

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      console.log('🔌 Fechando conexão WebSocket anterior antes de reconectar');
      wsRef.current.close(1000, 'Fechando conexão anterior');
    }

    setWsStatus(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket conectado:', WS_URL);
        reconnectAttemptsRef.current = 0;
        setWsStatus('connected');
      };

      ws.onerror = (event) => {
        console.error('❌ Erro no WebSocket:', event);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Mensagem WebSocket recebida:', message);

          if (message.type === 'update') {
            messageQueueRef.current.push(event.data);
            processMessageQueue();
          } else {
            console.log('Mensagem WS não tratada:', message);
          }
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = (event) => {
        console.warn(
          `🔌 WebSocket fechado: código=${event.code}, motivo=${event.reason}, limpo=${event.wasClean}`
        );

        setWsStatus('disconnected');

        if (!isUnmountedRef.current && event.code !== 1000) {
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(
              5000,
              1000 * Math.pow(2, reconnectAttemptsRef.current)
            );
            console.log(`⏳ Tentativa ${reconnectAttemptsRef.current} de reconectar em ${delay / 1000}s...`);

            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }

            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Tentando reconectar WebSocket...');
              connectWebSocket();
            }, delay);
          } else {
            console.error('🚫 Número máximo de tentativas de reconexão atingido. WebSocket não será reconectado.');
          }
        }
      };
    } catch (error) {
      console.error('❌ Erro ao criar WebSocket:', error);
      setWsStatus('disconnected');
    }
  };

  useEffect(() => {
    isUnmountedRef.current = false;
    connectWebSocket();

    return () => {
      isUnmountedRef.current = true;

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
      setWsStatus('disconnected');
    };
  }, [queryClient, page, limit]);

  return {
    tarefas: tarefasQuery.data?.data ?? [],
    pageInfo: {
      page: tarefasQuery.data?.page ?? page,
      limit: tarefasQuery.data?.limit ?? limit,
      total: tarefasQuery.data?.total ?? 0,
      pages: tarefasQuery.data?.pages ?? 0,
    },
    isLoading: tarefasQuery.isLoading,
    isError: tarefasQuery.isError,
    refetch: tarefasQuery.refetch,
    wsStatus,
  };
}
