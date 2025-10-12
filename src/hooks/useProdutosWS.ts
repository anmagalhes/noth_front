// src/hooks/useProdutoWS.ts
'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProdutoCompleto } from '@/types/produto'

const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/produto`;
const WS_URL = 'ws://localhost:8000/api/ws/produtos';

const fetchProdutos = async (): Promise<ProdutoCompleto[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Erro ao buscar produtos');
  return res.json();
};

export default function useProdutosWS() {
  const queryClient = useQueryClient();

  const produtosQuery = useQuery<ProdutoCompleto[], Error>({
    queryKey: ['produtos'],
    queryFn: fetchProdutos,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    // Função para debounce
    const debounceInvalidate = () => {
      const timeoutId = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['produtos'] });
      }, 1000);
      return () => clearTimeout(timeoutId);
    };

    ws.onopen = () => console.log('✅ WebSocket Produtos conectado');

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }

      if (Array.isArray(data)) {
        const dadosAtuais = queryClient.getQueryData<ProdutoCompleto[]>(['produtos']);
        if (JSON.stringify(dadosAtuais) !== JSON.stringify(data)) {
          queryClient.setQueryData(['produtos'], data);
        }
      } else if (data === 'update') {
        debounceInvalidate();
      }
    };

    ws.onerror = (error) => console.error('❌ Erro WebSocket:', error);
    ws.onclose = () => console.log('🔌 WebSocket desconectado');

    return () => {
      ws.close();
    };
  }, [queryClient]);

  return { produtosQuery };
}
