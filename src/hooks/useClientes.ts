// src/hooks/useClientes.ts
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Cliente, ClienteCreate, ClienteUpdate, ClientesResponse } from '@/types/cliente';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const API_URL = `${baseURL}/api/clientes`;
const WS_URL = (baseURL.startsWith('https') ? baseURL.replace('https', 'wss') : baseURL.replace('http', 'ws')) + '/api/ws/cliente';

// --- API helpers
async function fetchClientes({ page, pageSize, q }: { page: number; pageSize: number; q?: string }): Promise<ClientesResponse> {
  const url = new URL(API_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (q) url.searchParams.set('q', q);

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Erro ao buscar clientes');
  }
  return response.json();
}

async function createClienteAPI(novo: ClienteCreate): Promise<Cliente> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novo),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Erro ao criar cliente');
  }
  return response.json();
}

async function updateClienteAPI(id: number, patch: ClienteUpdate): Promise<Cliente> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT', // ou 'PATCH'
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Erro ao atualizar cliente');
  }
  return response.json();
}

async function deleteClienteAPI(id: number): Promise<{ ok: true }> {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Erro ao excluir cliente');
  }
  return { ok: true as const };
}

export default function useClientes(initial = { page: 1, pageSize: 10, q: '' }) {
  const queryClient = useQueryClient();

  // Estado local de paginação e busca (controlado pela Page Pai)
  const [page, setPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState(initial.pageSize);
  const [q, setQ] = useState(initial.q);

  // Query key inclui paginação e busca => cache por combinação
  const queryKey = useMemo(() => ['clientes', { page, pageSize, q }], [page, pageSize, q]);

  const clientesQuery = useQuery<ClientesResponse, Error>({
    queryKey,
    queryFn: () => fetchClientes({ page, pageSize, q: q || undefined }),
    staleTime: 1000 * 60 * 10,
    keepPreviousData: true,
  });

  // Mutations
  const { mutate: createCliente, error: createError, isPending: creating } = useMutation<Cliente, Error, ClienteCreate>({
    mutationFn: createClienteAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] }); // invalida todas as páginas/buscas
    },
  });

  const { mutate: updateCliente, error: updateError, isPending: updating } = useMutation<Cliente, Error, { id: number; patch: ClienteUpdate }>({
    mutationFn: ({ id, patch }) => updateClienteAPI(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const { mutate: deleteCliente, error: deleteError, isPending: deleting } = useMutation<{ ok: true }, Error, number>({
    mutationFn: (id) => deleteClienteAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  // WebSocket para atualização automática
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    console.log('📡 Conectando ao WebSocket de clientes...');

    ws.onopen = () => console.log('✅ WS cliente conectado');
    ws.onerror = (error) => console.error('❌ WS erro:', error);
    ws.onclose = () => console.log('🔌 WS cliente desconectado');

    ws.onmessage = (event) => {
      const msg = event.data;
      if (msg === 'update') {
        console.log('♻️ Atualização recebida via WS - clientes');
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
      }
    };

    return () => {
      ws.close();
    };
  }, [queryClient]);

  return {
    // dados
    clientes: clientesQuery.data?.data ?? [],
    page: clientesQuery.data?.page ?? page,
    totalPages: clientesQuery.data?.pages ?? 1,
    total: clientesQuery.data?.total ?? 0,

    // estados
    isLoading: clientesQuery.isLoading,
    isError: clientesQuery.isError,
    error: clientesQuery.error,

    // mutações
    createCliente,
    createError,
    creating,

    updateCliente,
    updateError,
    updating,

    deleteCliente,
    deleteError,
    deleting,

    // paginação/busca controladas
    pageState: { page, setPage, pageSize, setPageSize, q, setQ },

    // utilidades
    refetch: clientesQuery.refetch,
  };
}
