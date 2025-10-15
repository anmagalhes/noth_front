'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  PostoTrabalhoItem,
  PostoTrabalhoCreate,
  PostoTrabalhoUpdate,
} from '@/types/posto_trabalho';

const baseURL = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api';
const API_URL = `${baseURL}/posto_trabalho`;            // ⬅️ underscore + sem plural
const WS_URL  = `ws://localhost:8000/api/ws/posto_trabalho`; // ⬅️ idem

// ---- Services
const fetchPostos = async (): Promise<PostoTrabalhoItem[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Erro ao buscar postos de trabalho: ${res.status} ${t}`);
  }
  return res.json();
};

const createPosto = async (data: PostoTrabalhoCreate): Promise<PostoTrabalhoItem> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Erro ao criar posto de trabalho: ${res.status} - ${t}`);
  }
  return res.json();
};

const updatePosto = async ({
  id,
  patch,
}: {
  id: number;
  patch: PostoTrabalhoUpdate;
}): Promise<PostoTrabalhoItem> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT', // ou PATCH se o backend suportar parcial
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Erro ao atualizar posto de trabalho: ${res.status} - ${t}`);
  }
  return res.json();
};

// ✅ DELETE com idempotência (404/409) + logs
const deletePosto = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    if (res.status === 404) {
      console.warn(`⚠️ Posto ${id} já foi deletado (idempotência)`);
      return;
    }
    if (res.status === 409) {
      console.warn(`⚠️ Conflito ao deletar posto ${id}`);
      return;
    }
    const errorText = await res.text();
    throw new Error(`Erro ao deletar posto: ${res.status} - ${errorText}`);
  }
  console.log(`✅ Posto ${id} deletado com sucesso`);
};

export default function usePostosTrabalho() {
  const queryClient = useQueryClient();

  const postosQuery = useQuery<PostoTrabalhoItem[], Error>({
    queryKey: ['postosTrabalho'],
    queryFn: fetchPostos,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: createPosto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postosTrabalho'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePosto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postosTrabalho'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePosto,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['postosTrabalho'] });
      const previousData =
        queryClient.getQueryData<PostoTrabalhoItem[]>(['postosTrabalho']);

      queryClient.setQueryData<PostoTrabalhoItem[]>(
        ['postosTrabalho'],
        (old = []) => old.filter((p) => p.id !== id),
      );

      console.log(`🧹 Otimistic delete: posto ${id} removido do cache`);

      return { previousData };
    },
    onError: (error, id, context) => {
      console.error(`❌ Erro ao deletar posto ${id}:`, error);
      if (context?.previousData) {
        queryClient.setQueryData(['postosTrabalho'], context.previousData);
        console.log(`↩️ Rollback aplicado para posto ${id}`);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['postosTrabalho'] });
    },
  });

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log('✅ WebSocket Postos de Trabalho conectado');

    // ✅ Debounce local
    let invalidateTimeout: ReturnType<typeof setTimeout> | null = null;
    const debounceInvalidate = () => {
      if (invalidateTimeout) return;
      invalidateTimeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['postosTrabalho'] });
        invalidateTimeout = null;
      }, 1000);
    };

    ws.onmessage = (event: MessageEvent) => {
      let data: unknown;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }

      if (Array.isArray(data)) {
        queryClient.setQueryData<PostoTrabalhoItem[]>(
          ['postosTrabalho'],
          data,
        );
        console.log('Cache postos atualizado pelo WS (lista completa)');
      } else if (typeof data === 'string' && data === 'update') {
        debounceInvalidate();
      } else if (typeof data === 'object' && data && (data as any).type) {
        const msg = data as any;
        switch (msg.type) {
          case 'posto:created':
            queryClient.setQueryData<PostoTrabalhoItem[]>(
              ['postosTrabalho'],
              (old = []) => [msg.data, ...old],
            );
            break;
          case 'posto:updated':
            queryClient.setQueryData<PostoTrabalhoItem[]>(
              ['postosTrabalho'],
              (old = []) => old.map((p) => (p.id === msg.data.id ? msg.data : p)),
            );
            break;
          case 'posto:deleted':
            queryClient.setQueryData<PostoTrabalhoItem[]>(
              ['postosTrabalho'],
              (old = []) =>
                old.filter((p) => p.id !== msg.id && (p as any).posto_id !== msg.id),
            );
            break;
          default:
            console.debug('Mensagem WS não tratada:', msg);
        }
      } else {
        console.log('Mensagem WS não tratada:', data);
      }
    };

    return () => {
      if (invalidateTimeout) clearTimeout(invalidateTimeout);
      ws.close();
    };
  }, [queryClient]);

  return {
    // dados
    postosQuery,
    postos: postosQuery.data ?? [],
    isLoading: postosQuery.isLoading,
    isError: postosQuery.isError,
    error: postosQuery.error,

    // mutações
    createPosto: createMutation.mutate,
    createPostoAsync: createMutation.mutateAsync,
    createError: createMutation.error,
    creating: createMutation.isPending,

    updatePosto: updateMutation.mutate,
    updatePostoAsync: updateMutation.mutateAsync,
    updateError: updateMutation.error,
    updating: updateMutation.isPending,

    deletePosto: deleteMutation.mutate,
    deletePostoAsync: deleteMutation.mutateAsync,
    deleteError: deleteMutation.error,
    deleting: deleteMutation.isPending,

    // utilidades
    refetch: postosQuery.refetch,
  };
}
