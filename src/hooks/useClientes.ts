'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Cliente, ClientesResponse } from '@/types/cliente';


const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/clientes`;
const WS_URL = 'ws://localhost:8000/api/ws/cliente';


async function fetchClientes(): Promise<ClientesResponse> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Erro ao buscar clientes');
  return response.json();
}

async function createCliente(novoCliente: Omit<Cliente, 'id'>): Promise<Cliente> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoCliente),
  });
  if (!response.ok) throw new Error('Erro ao criar cliente');
  return response.json();
}

export default function useClientes() {
  const queryClient = useQueryClient();

  const clientesQuery = useQuery<ClientesResponse, Error>({
    queryKey: ['clientes'],
    queryFn: fetchClientes,
    staleTime: 1000 * 60 * 10,
  });

  const {
    mutate: createClienteMutate,
    error: createError,
  } = useMutation<Cliente, Error, Omit<Cliente, 'id'>>({
    mutationFn: createCliente,
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
    clientes: clientesQuery.data?.data ?? [],   // <-- array de clientes
    isLoading: clientesQuery.isLoading,
    isError: clientesQuery.isError,
    error: clientesQuery.error,
    createCliente: createClienteMutate,
    createError,
    page: clientesQuery.data?.page ?? 1,
    totalPages: clientesQuery.data?.pages ?? 1,
    total: clientesQuery.data?.total ?? 0,
  };
}
