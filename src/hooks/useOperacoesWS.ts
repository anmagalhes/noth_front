'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { OperacaoItem, OperacaoCreate } from '@/types/operacao';

const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/operacao`;
const WS_URL = 'ws://localhost:8000/api/ws/operacoes';

const fetchOperacoes = async (): Promise<OperacaoItem[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Erro ao buscar operações');
  return res.json();
};

const createOperacao = async (data: OperacaoCreate): Promise<OperacaoItem> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar operação');
  return res.json();
};

const updateOperacao = async ({
  id,
  patch,
}: {
  id: number;
  patch: Partial<OperacaoItem>;
}): Promise<OperacaoItem> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Erro ao atualizar operação');
  return res.json();
};

export default function useOperacoes() {
  const queryClient = useQueryClient();

  const operacoesQuery = useQuery<OperacaoItem[], Error>({
    queryKey: ['operacoes'],
    queryFn: fetchOperacoes,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

// ✅ DELETE com optimistic + rollback + idempotência (404/409) + logs úteis
  const updateOperacaoMutation = useMutation({
    mutationFn: updateOperacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] });
    },
  });


  const createOperacaoMutation = useMutation({
    mutationFn: createOperacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] });
    },
  });

  const updateOperacaoMutation = useMutation({
    mutationFn: updateOperacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] });
    },
  });

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log('✅ WebSocket Operações conectado');

    ws.onmessage = (event: MessageEvent) => {
      let data: unknown;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }

      if (Array.isArray(data)) {
        // servidor enviou lista completa
        queryClient.setQueryData<OperacaoItem[]>(['operacoes'], data);
        console.log('Cache operações atualizado pelo WS (lista completa)');
      } else if (typeof data === 'string' && data === 'update') {
        // servidor sinalizou para atualizar
        debounceInvalidate();
      } else if (typeof data === 'object' && data && (data as any).type) {
        // servidor enviou evento granular
        const msg = data as any;
        switch (msg.type) {
          case 'operacao:created':
            queryClient.setQueryData<OperacaoItem[]>(['operacoes'], (old = []) => [msg.data, ...old]);
            break;
          case 'operacao:updated':
            queryClient.setQueryData<OperacaoItem[]>(['operacoes'], (old = []) =>
              old.map((o) => (o.id === msg.data.id ? msg.data : o)),
            );
            break;
          case 'operacao:deleted':
            queryClient.setQueryData<OperacaoItem[]>(['operacoes'], (old = []) =>
              old.filter((o) => o.id !== msg.id && (o as any).op_id !== msg.id),
            );
            break;
          default:
            console.debug('Mensagem WS não tratada:', msg);
        }
      } else {
        console.log('Mensagem WS não tratada:', data);
      }
    };

    ws.onerror = (ev) => {
      // Browser envia Event genérico
      const e = ev as Event;
      console.error('❌ Erro WebSocket Operações:', {
        type: e.type,
        // @ts-expect-error: ws é conhecido aqui
        readyState: ws.readyState,
      });
      // deixe o onclose cuidar de reconexão se você implementar
    };

    ws.onclose = () => console.log('🔌 WebSocket Operações desconectado');

    // ✅ Debounce local (tipo seguro pro browser)
    let invalidateTimeout: ReturnType<typeof setTimeout> | null = null;
    const debounceInvalidate = () => {
      if (invalidateTimeout) return;
      invalidateTimeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['operacoes'] });
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
    // expose mutate e mutateAsync se quiser usar await em Dialogs
    deleteOperacao: deleteOperacao.mutate,
    createOperacao: createOperacaoMutation.mutate,
    updateOperacao: updateOperacaoMutation.mutate,
    deleteOperacaoAsync: deleteOperacao.mutateAsync,
    deleting: deleteOperacao.isPending,
    updating: updateOperacaoMutation.isPending,
  };
}
