'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperacaoItem } from '@/types/operacao';

const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/operacoes`;
const WS_URL = 'ws://localhost:8000/api/ws/operacao';

const fetchOperacoes = async (): Promise<OperacaoItem[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Erro ao buscar operações');
  return res.json();
};

export default function useOperacoes() {
  const queryClient = useQueryClient();

  const operacoesQuery = useQuery({
    queryKey: ['operacoes'],
    queryFn: fetchOperacoes,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const deleteOperacao = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir operação');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operacoes']);
    },
  });

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log('✅ WebSocket Operações conectado');

    ws.onmessage = (event) => {
      let data;

      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }

      if (Array.isArray(data)) {
        const dadosAtuais = queryClient.getQueryData<OperacaoItem[]>(['operacoes']);
        if (JSON.stringify(dadosAtuais) !== JSON.stringify(data)) {
          queryClient.setQueryData(['operacoes'], data);
          console.log('Cache operações atualizado pelo WS');
        }
      } else if (typeof data === 'string' && data === 'update') {
        debounceInvalidate();
      } else {
        console.log('Mensagem WS não tratada:', data);
      }
    };

    ws.onerror = (error) => console.error('❌ Erro WebSocket Operações:', error);
    ws.onclose = () => console.log('🔌 WebSocket Operações desconectado');

    let invalidateTimeout: NodeJS.Timeout | null = null;
    const debounceInvalidate = () => {
      if (invalidateTimeout) return;
      invalidateTimeout = setTimeout(() => {
        queryClient.invalidateQueries(['operacoes']);
        invalidateTimeout = null;
      }, 1000);
    };

    return () => {
      if (invalidateTimeout) clearTimeout(invalidateTimeout);
      ws.close();
    };
  }, [queryClient]);

  return {
    operacoesQuery,
    deleteOperacao: deleteOperacao.mutate,
    deleting: deleteOperacao.isPending,
  };
}
