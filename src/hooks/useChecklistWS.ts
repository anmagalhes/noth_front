// src/hooks/useChecklistWS.ts
'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {Checklist } from '@/types/checklist'


const baseURL = 'http://localhost:8000/api';
const API_URL = `${baseURL}/checklist`;
const WS_URL = 'ws://localhost:8000/api/ws/checklist';

interface ChecklistResponse {
  data: Checklist[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Função para buscar os checklists com paginação
const fetchChecklists = async (
  page = 1,
  limit = 20,
  com_pdf: 'true' | 'false' | 'all' = 'all',
  sem_checklist: boolean = false
): Promise<ChecklistResponse> => {

  const res = await fetch(`${API_URL}?
    page=${page}&limit=${limit}&com_pdf=${com_pdf}&sem_checklist=${sem_checklist}`);
  if (!res.ok) throw new Error('Erro ao buscar checklists');
  return res.json();
};

export default function useChecklistWS(
  page = 1,
  limit = 30,
  com_pdf: 'true' | 'false' | 'all' = 'all',
  sem_checklist: boolean = false
) {
  const queryClient = useQueryClient();

  const checklistsQuery = useQuery({
    queryKey: ['checklists', page, limit, com_pdf, sem_checklist],
    queryFn: () => fetchChecklists(page, limit, com_pdf, sem_checklist),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    console.log('🔌 Conectando ao WS Checklist...');

    ws.onopen = () => console.log('✅ WebSocket Checklist conectado');

    ws.onclose = () => console.log('🔌 WebSocket Checklist desconectado');

    ws.onmessage = (event) => {
      const message = event.data;

      if (message === 'update') {
        debounceInvalidate();
      } else {
        console.log('Mensagem WS não tratada:', message);
      }
    };

    // debounce para evitar múltiplos invalidates seguidos
    let timeout: NodeJS.Timeout | null = null;
    const debounceInvalidate = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        queryClient.invalidateQueries({
        queryKey: ['checklists', page, limit, com_pdf],
      });
        timeout = null;
      }, 1000);
    };

    return () => {
      if (timeout) clearTimeout(timeout);
      ws.close();
    };
  }, [queryClient, page, limit, com_pdf]);

  return { checklistsQuery };
}
