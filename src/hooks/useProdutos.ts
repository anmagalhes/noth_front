'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Tipos mínimos internos para não depender de outros arquivos
type ProdutosResponse<T = any> = {
  data: T[];
  page: number;
  pages: number;
  total: number;
};

type ProdutoCreatePayload = {
  cod_produto: string;
  produto_nome: string;
  und_servicos: string;
  grupo_id: 'PRODUTO' | 'SERVICO'; // API SEM acento
  tipo_produto: 1 | 2;
  componente_id: number;
  operacao_id: number;
  posto_trabalho_id: number;
};

type ProdutoUpdatePayload = Partial<ProdutoCreatePayload>;

// --- URLs base (ajuste sua .env se necessário)
const baseHTTP = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const API_URL = `${baseHTTP}/api/produtos`;
const baseWS = baseHTTP.startsWith('https')
  ? baseHTTP.replace('https', 'wss')
  : baseHTTP.replace('http', 'ws');
// Se seu backend usar plural no WS, troque '/api/ws/produto' por '/api/ws/produtos'
const WS_URL = `${baseWS}/api/ws/produto`;

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
    method: 'PUT', // troque para 'PATCH' se sua API suportar
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
export default function useProdutos(initial = { page: 1, pageSize: 10, q: '' }) {
  const queryClient = useQueryClient();

  // Estados locais de paginação e busca
  const [page, setPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState(initial.pageSize);
  const [q, setQ] = useState(initial.q);

  const queryKey = useMemo(() => ['produtos', { page, pageSize, q }], [page, pageSize, q]);

  const produtosQuery = useQuery<ProdutosResponse, Error>({
    queryKey,
    queryFn: () => fetchProdutos({ page, pageSize, q: q || undefined }),
    staleTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const { mutate: createProduto, error: createError, isPending: creating } =
    useMutation({ mutationFn: createProdutoAPI, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] }) });

  const { mutate: updateProduto, error: updateError, isPending: updating } =
    useMutation({ mutationFn: ({ id, patch }: { id: number; patch: ProdutoUpdatePayload }) => updateProdutoAPI(id, patch), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] }) });

  const { mutate: deleteProduto, error: deleteError, isPending: deleting } =
    useMutation({ mutationFn: (id: number) => deleteProdutoAPI(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] }) });

  // Listener WebSocket para invalidar ao receber 'update' (opcional)
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (event) => {
        if (event.data === 'update') {
          queryClient.invalidateQueries({ queryKey: ['produtos'] });
        }
      };
    } catch (e) {
      console.warn('WS produtos indisponível:', e);
    }
    return () => {
      try { ws?.close(); } catch {}
    };
  }, [queryClient]);

  return {
    // dados
    produtos: produtosQuery.data?.data ?? [],
    page: produtosQuery.data?.page ?? page,
    totalPages: produtosQuery.data?.pages ?? 1,
    total: produtosQuery.data?.total ?? 0,

    // estados
    isLoading: produtosQuery.isLoading,
    isError: produtosQuery.isError,
    error: produtosQuery.error,

    // mutations
    createProduto,
    createError,
    creating,

    updateProduto,
    updateError,
    updating,

    deleteProduto,
    deleteError,
    deleting,

    // paginação/busca controladas
    pageState: { page, setPage, pageSize, setPageSize, q, setQ },

    // util
    refetch: produtosQuery.refetch,
  };
}
