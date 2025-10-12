// src/lib/api.ts
import { Tarefa } from '@/types/tarefas';
import { Produto } from '@/types/produto';

// Funções simuladas - substitua por chamadas reais à sua API

export const fetchInitialData = async (): Promise<Partial<Tarefa>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        dataLancamento: new Date().toISOString().split('T')[0],
        numeroControle: 'CTRL-003',
        clienteNome: 'Cliente Exemplo',
      });
    }, 500);
  });
};



// Mock de produtos compatível com seu tipo Produto
export const fetchProducts = async (): Promise<Produto[]> => {
  return [
    {
      id: 1,
      cod_produto: '001',
      produto_nome: 'Produto 1',
      componente_id: 100,
      operacao_id: 200,
      posto_trabalho_id: 300,
      componente_nome: 'Componente 1',
      operacao_nome: 'Operação 1',
      posto_trabalho_nome: 'Posto 1',
      und_servicos: 'UN',
      grupo_id: 'PRODUTO',
      tipo_produto: 1,
      codigo: '001',
      nome: 'Produto 1',
      componente: null,
    },
    {
      id: 2,
      cod_produto: '002',
      produto_nome: 'Produto 2',
      componente_id: 101,
      operacao_id: 201,
      posto_trabalho_id: 301,
      componente_nome: 'Componente 2',
      operacao_nome: 'Operação 2',
      posto_trabalho_nome: 'Posto 2',
      und_servicos: 'UN',
      grupo_id: 'SERVIÇO',
      tipo_produto: 2,
      codigo: '002',
      nome: 'Produto 2',
      componente: null,
    },
  ];
};

// Mock para detalhes do produto
export const fetchProductDetails = async (codigo: string): Promise<Produto> => {
  return {
    id: 3,
    cod_produto: codigo,
    produto_nome: `Produto ${codigo}`,
    componente_id: 102,
    operacao_id: 202,
    posto_trabalho_id: 302,
    componente_nome: 'Componente Detalhe',
    operacao_nome: 'Operação Detalhe',
    posto_trabalho_nome: 'Posto Detalhe',
    und_servicos: 'UN',
    grupo_id: 'PRODUTO',
    tipo_produto: 1,
    codigo,
    nome: `Produto ${codigo}`,
    componente: null,
  };
};

// Salvar tarefa (mock)
export const saveTarefa = async (data: Omit<Tarefa, 'id'>): Promise<Tarefa> => {
  return {
    id: Date.now(),
    ...data,
  } as Tarefa;
};

// Deletar tarefas (mock)
export const deleteTarefas = async (ids: number[]): Promise<void> => {
  console.log('Tarefas excluídas:', ids);
};

// Mock para buscar tarefas salvas (lista para a tabela)
export const fetchSavedTarefas = async (): Promise<Tarefa[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          dataLancamento: '2023-10-15',
          numeroControle: 'CTRL-001',
          clienteNome: 'Cliente Exemplo',
          quantidade: 5,
          codigoProduto: 'PROD-123',
          descricaoProduto: 'Produto de exemplo',
          operacao: 'OP-456',
          observacao: 'Observação de teste',
        },
        {
          id: 2,
          dataLancamento: '2023-10-16',
          numeroControle: 'CTRL-002',
          clienteNome: 'Outro Cliente',
          quantidade: 3,
          codigoProduto: 'PROD-456',
          descricaoProduto: 'Outro produto',
          operacao: 'OP-789',
          observacao: 'Mais uma observação',
        },
      ]);
    }, 500);
  });
};

// Simulação de chamadas API - implementar com axios/fetch
export const ApiService = {
  fetchProducts: async (): Promise<Product[]> => {
    // Implementar chamada real
    return [];
  },

  saveTask: async (taskData: any): Promise<boolean> => {
    // Implementar chamada real
    return true;
  },

  deleteTasks: async (ids: string[]): Promise<boolean> => {
    // Implementar chamada real
    return true;
  }
};

export type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  operation: string;
};
