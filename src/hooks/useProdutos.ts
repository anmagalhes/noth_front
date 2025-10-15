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
  grupo_id: 'PRODUTO' | 'SERVICO'; // back usa 'SERVICO' (sem acento)
  tipo_produto: 1 | 2;            // 1=Produto, 2=Tarefa
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

// --- Normalizador (aceita array ou diferentes formatos paginados)
function normalizeProdutosJSON(
  json: any,
  response: Response,
  page: number,
  pageSize: number
): ProdutosResponse {
  // 1) Array puro: [...produtos]
  if (Array.isArray(json)) {
    const headerTotal = Number(response.headers.get('x-total-count'));
    const total = Number.isFinite(headerTotal) ? headerTotal : json.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    return { data: json, page, pages, total };
  }

  // 2) { data, page, pages, total }
  if (json && Array.isArray(json.data)) {
    const total = Number.isFinite(json.total) ? json.total : json.data.length;
    const pages = Number.isFinite(json.pages) ? json.pages : Math.max(1, Math.ceil(total / pageSize));
    return {
      data: json.data,
      page: Number.isFinite(json.page) ? json.page : page,
      pages,
      total,
    };
  }

  // 3) { items, total, totalPages }
  if (json && Array.isArray(json.items)) {
    const total = Number.isFinite(json.total) ? json.total : json.items.length;
    const pages = Number.isFinite(json.totalPages)
      ? json.totalPages
      : Math.max(1, Math.ceil(total / pageSize));
    return { data: json.items, page, pages, total };
  }

  // 4) Fallback
  return { data: [], page, pages: 1, total: 0 };
}

// --- API helpers (usa o `signal` do React Query para cancelamento)
async function fetchProdutos({
  page,
  pageSize,
  q,
  signal,
}: {
  page: number;
  pageSize: number;
  q?: string;
  signal?: AbortSignal;
}): Promise<ProdutosResponse> {
  const url = new URL(API_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (q) url.searchParams.set('q', q);

  const response = await fetch(url.toString(), {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Erro ao buscar produtos');
  }

  const json = await response.json();
  return normalizeProdutosJSON(json, response, page, pageSize);
}

// --- API CRUD
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

  // Chave de cache inclui parâmetros (evita servir cache errado)
  const queryKey = useMemo(() => ['produtos', { page, pageSize, q }], [page, pageSize, q]);

  // Query: usa `signal` do React Query
  const produtosQuery = useQuery<ProdutosResponse, Error>({
    queryKey,
    queryFn: ({ signal }) => fetchProdutos({ page, pageSize, q, signal }),
    staleTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  // Mutations (invalida todas as queries começando com 'produtos')
  const { mutate: createProduto, error: createError, isPending: creating } = useMutation({
    mutationFn: createProdutoAPI,
    onSuccess: () => {
      toast.success('Produto criado');
      queryClient.invalidateQueries({ queryKey: ['produtos'], exact: false });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Erro ao criar produto'),
  });

  const { mutate: updateProduto, error: updateError, isPending: updating } = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: ProdutoUpdatePayload }) =>
      updateProdutoAPI(id, patch),
    onSuccess: () => {
      toast.success('Produto atualizado');
      queryClient.invalidateQueries({ queryKey: ['produtos'], exact: false });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Erro ao atualizar produto'),
  });

  const { mutate: deleteProduto, error: deleteError, isPending: deleting } = useMutation({
    mutationFn: (id: number) => deleteProdutoAPI(id),
    onSuccess: () => {
      toast.success('Produto excluído');
      queryClient.invalidateQueries({ queryKey: ['produtos'], exact: false });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Erro ao excluir produto'),
  });

  // WebSocket para atualizações em tempo real
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (event) => {
        // Tenta JSON, senão assume string 'update'
        try {
          const msg = JSON.parse(event.data);
          if (msg?.type === 'produto:changed') {
            queryClient.invalidateQueries({ queryKey: ['produtos'], exact: false });
            toast.success('Atualização via WebSocket');
            return;
          }
        } catch {
          if (event.data === 'update') {
            queryClient.invalidateQueries({ queryKey: ['produtos'], exact: false });
            toast.success('Atualização via WebSocket');
          }
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
