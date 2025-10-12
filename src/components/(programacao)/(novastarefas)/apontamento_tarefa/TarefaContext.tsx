// src/components/novas_tarefas/TarefaContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tarefa } from '@/types/tarefas';

interface TarefaContextType {
  tarefaSelecionada: Tarefa | null;
  setTarefaSelecionada: (tarefa: Tarefa | null) => void;
}

const TarefaContext = createContext<TarefaContextType | undefined>(undefined);

export const TarefaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);

  return (
    <TarefaContext.Provider value={{ tarefaSelecionada, setTarefaSelecionada }}>
      {children}
    </TarefaContext.Provider>
  );
};

export const useTarefa = () => {
  const context = useContext(TarefaContext);
  if (!context) {
    throw new Error('useTarefa must be used within a TarefaProvider');
  }
  return context;
};
