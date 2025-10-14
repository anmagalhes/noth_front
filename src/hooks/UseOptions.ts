'use client';

import { useQuery } from '@tanstack/react-query';

type Option = { id: number; nome: string };

export function useOptions(endpoint: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

  return useQuery<Option[], Error>({
    queryKey: ['options', endpoint],
    queryFn: async () => {
      const res = await fetch(`${base}${endpoint}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Erro ao carregar opções');

      const raw = await res.json();

      return raw.map((item: any) => ({
        id: item.id,
        nome: item.nome ?? item.componente_nome ?? item.op_nome ?? item.posto_nome,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
}
