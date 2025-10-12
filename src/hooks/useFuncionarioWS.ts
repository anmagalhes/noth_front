'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/funcionario`;
const WS_URL = 'ws://localhost:8000/api/ws/funcionario';
import { Funcionario } from '@/types/funcionario'

const fetchFuncionarios = async (): Promise<Funcionario[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export default function useFuncionarioWS() {
  const queryClient = useQueryClient();

  const funcionariosQuery = useQuery({
    queryKey: ['funcionarios'],
    queryFn: fetchFuncionarios,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log('✅ WebSocket Funcionários conectado');

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }

      if (Array.isArray(data)) {
        // Atualiza cache apenas se os dados forem diferentes
        const dadosAtuais = queryClient.getQueryData<Funcionario[]>(['funcionarios']);
        if (JSON.stringify(dadosAtuais) !== JSON.stringify(data)) {
          queryClient.setQueryData(['funcionarios'], data);
          console.log('Cache funcionários atualizado pelo WS');
        }
      } else if (typeof data === 'string' && data === 'update') {
        debounceInvalidate();
      } else {
        console.log('Mensagem WS não tratada:', data);
      }
    };

    ws.onerror = (error) => console.error('❌ Erro WebSocket Funcionários:', error);
    ws.onclose = () => console.log('🔌 WebSocket Funcionários desconectado');

    // Debounce para evitar chamadas repetidas rápidas à invalidateQueries
    let invalidateTimeout: NodeJS.Timeout | null = null;
    const debounceInvalidate = () => {
      if (invalidateTimeout) return;
      invalidateTimeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
        invalidateTimeout = null;
      }, 1000);
    };

    // Cleanup na desmontagem do componente
    return () => {
      if (invalidateTimeout) clearTimeout(invalidateTimeout);
      ws.close();
    };
  }, [queryClient]);

  return { funcionariosQuery };
}
