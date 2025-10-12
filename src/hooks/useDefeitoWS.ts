// src/hooks/useDefeitoWS.ts
'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Defeito } from '@/types/defeito'

const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/defeito`;
const WS_URL = 'ws://localhost:8000/api/ws/defeito';

const fetchDefeitos = async (): Promise<Defeito[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Erro ao buscar defeitos');
  return res.json();
};

export default function useDefeitoWS() {
  const queryClient = useQueryClient();

  const defeitosQuery = useQuery({
    queryKey: ['defeitos'],
    queryFn: fetchDefeitos,
    refetchOnWindowFocus: false, // desativa refetch automático para evitar loops
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log('✅ WebSocket Defeitos conectado');

    ws.onmessage = (event) => {
  let data;

  try {
    data = JSON.parse(event.data);
  } catch {
    // Se não for JSON válido, usa o dado bruto (string)
    data = event.data;
  }

  // Aqui espera que o WS envie o array atualizado ou itens atualizados
  if (Array.isArray(data)) {
    // Pega dados atuais do cache
    const dadosAtuais = queryClient.getQueryData<Defeito[]>(['defeitos']);

    // Compara string JSON para simplicidade
    if (JSON.stringify(dadosAtuais) !== JSON.stringify(data)) {
      // Atualiza cache direto, evita re-fetch
      queryClient.setQueryData(['defeitos'], data);
      console.log('Cache defeitos atualizado pelo WS');
    } else {
      console.log('Dados recebidos iguais ao cache, sem atualização');
    }
  } else if (typeof data === 'string' && data === 'update') {
    // Se o backend só manda 'update', invalida com debounce para evitar loop
    debounceInvalidate();
  } else {
    console.log('Mensagem WS não tratada:', data);
  }
};

    ws.onerror = (error) => console.error('❌ Erro WebSocket Defeitos:', error);
    ws.onclose = () => console.log('🔌 WebSocket Defeitos desconectado');

    // Função para evitar múltiplos invalidate seguidos
    let invalidateTimeout: NodeJS.Timeout | null = null;
    const debounceInvalidate = () => {
      if (invalidateTimeout) return;
      invalidateTimeout = setTimeout(() => {
        queryClient.invalidateQueries(['defeitos']);
        invalidateTimeout = null;
      }, 1000); // 1 segundo de debounce
    };

    return () => {
      if (invalidateTimeout) clearTimeout(invalidateTimeout);
      ws.close();
    };
  }, [queryClient]);

  return { defeitosQuery };
}
