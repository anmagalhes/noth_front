'use client';

import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// --- Tipos internos
type ProdutosResponse<T = any> = {
  data: T[];
  page: number;
  pages: number;
  total: number;
};

export type ProdutoCreatePayload = {
  cod_produto: string;
  produto_nome: string;
  und_servicos: string;
  grupo_id: 'PRODUTO' | 'SERVICO';
  tipo_produto: 1 | 2;
  componente_id: number;
  operacao_id: number;
  posto_trabalho_id: number;
};

export type ProdutoUpdatePayload = Partial<ProdutoCreatePayload>;

// --- URLs
const baseHTTP = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const API_URL = `${baseHTTP}/api/produto`;
const baseWS = baseHTTP.startsWith('https')
  ? baseHTTP.replace('https', 'wss')
  : baseHTTP.replace('http', 'ws');
const WS_URL = `${baseWS}/api/ws/produtos`;

// --- API helpers
async function fetchProdutos({ page, pageSize, q }: { page: number; pageSize: number; q?: string }): Promise<ProdutosResponse> {
  const url = new URL(API_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (q) url.searchParams.set('q', q);

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Erro ao buscar produtos');
  }
  return response.json();
}

async function createProdutoAPI(novo: ProdutoCreatePayload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novo),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Erro ao criar produto');
  }
  return res.json();
}

async function updateProdutoAPI(id: number, patch: ProdutoUpdatePayload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Erro ao atualizar produto');
  }
  return res.json();
}

async function deleteProdutoAPI(id: number) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Erro ao excluir produto');
  }
  return { ok: true as const };
}

// --- Hook principal
export default function useProdutos(param?: { page?: number; pageSize?: number; q?: string }) {
  const queryClient = useQueryClient();

  // Valores padrão
  const page = param?.page ?? 1;
  const pageSize = param?.pageSize ?? 10;
  const q = param?.q ?? '';

  const queryKey = useMemo(() => ['produtos', { page, pageSize, q }], [page, pageSize, q]);

  const produtosQuery = useQuery<ProdutosResponse, Error>({
    queryKey,
    queryFn: () => fetchProdutos({ page, pageSize, q }),
    staleTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const { mutate: createProduto, error: createError, isPending: creating } =
    useMutation({
      mutationFn: createProdutoAPI,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] }),
    });

  const { mutate: updateProduto, error: updateError, isPending: updating } =
    useMutation({
      mutationFn: ({ id, patch }: { id: number; patch: ProdutoUpdatePayload }) =>
        updateProdutoAPI(id, patch),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] }),
    });

  const { mutate: deleteProduto, error: deleteError, isPending: deleting } =
    useMutation({
      mutationFn: (id: number) => deleteProdutoAPI(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] }),
    });

  // WebSocket para atualizações em tempo real
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (event) => {
        console.log('Mensagem WS recebida:', event.data);
        if (event.data === 'update') {
          toast.success('Atualização recebida via WebSocket');
          queryClient.invalidateQueries({ queryKey: ['produtos'] });
        }
      };
    } catch (e) {
      console.warn('WS produtos indisponível:', e);
    }

    return () => {
      try {
        ws?.close();
      } catch {}
    };
  }, [queryClient]);

  return {
    produtos: produtosQuery.data?.data ?? [],
    page: produtosQuery.data?.page ?? page,
    totalPages: produtosQuery.data?.pages ?? 1,
    total: produtosQuery.data?.total ?? 0,

    isLoading: produtosQuery.isLoading,
    isError: produtosQuery.isError,
    error: produtosQuery.error,

    createProduto,
    createError,
    creating,

    updateProduto,
    updateError,
    updating,

    deleteProduto,
    deleteError,
    deleting,

    refetch: produtosQuery.refetch,
  };
}
