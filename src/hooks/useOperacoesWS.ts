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
    const deleteOperacao = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    if (res.status === 404) {
      console.warn(`⚠️ Operação ${id} já foi deletada (idempotência)`);
      return;
    }
    if (res.status === 409) {
      console.warn(`⚠️ Conflito ao deletar operação ${id}`);
      return;
    }
    const errorText = await res.text();
    throw new Error(`Erro ao deletar operação: ${res.status} - ${errorText}`);
  }

  console.log(`✅ Operação ${id} deletada com sucesso`);
};

  const createOperacaoMutation = useMutation({
    mutationFn: createOperacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] });
    },
  });

  const deleteOperacaoMutation = useMutation({
  mutationFn: deleteOperacao,
  // Otimistic update
  onMutate: async (id: number) => {
    await queryClient.cancelQueries({ queryKey: ['operacoes'] });

    const previousData = queryClient.getQueryData<OperacaoItem[]>(['operacoes']);

    queryClient.setQueryData<OperacaoItem[]>(['operacoes'], (old = []) =>
      old.filter((o) => o.id !== id)
    );

    console.log(`🧹 Otimistic delete: operação ${id} removida do cache`);

    return { previousData };
  },
  // Rollback em erro
  onError: (error, id, context) => {
    console.error(`❌ Erro ao deletar operação ${id}:`, error);
    if (context?.previousData) {
      queryClient.setQueryData(['operacoes'], context.previousData);
      console.log(`↩️ Rollback aplicado para operação ${id}`);
    }
  },
  // Revalida os dados
  onSettled: () => {
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
  // dados
  operacoesQuery,
  operacoes: operacoesQuery.data ?? [],
  isLoading: operacoesQuery.isLoading,
  isError: operacoesQuery.isError,
  error: operacoesQuery.error,

  // mutações
  createOperacao: createOperacaoMutation.mutate,
  createOperacaoAsync: createOperacaoMutation.mutateAsync,
  createError: createOperacaoMutation.error,
  creating: createOperacaoMutation.isPending,

  updateOperacao: updateOperacaoMutation.mutate,
  updateOperacaoAsync: updateOperacaoMutation.mutateAsync,
  updateError: updateOperacaoMutation.error,
  updating: updateOperacaoMutation.isPending,

  deleteOperacao: deleteOperacaoMutation.mutate,
  deleteOperacaoAsync: deleteOperacaoMutation.mutateAsync,
  deleteError: deleteOperacaoMutation.error,
  deleting: deleteOperacaoMutation.isPending,

  // utilidades
  refetch: operacoesQuery.refetch,
};

}
