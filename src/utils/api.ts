import { Tarefa } from '@/types/tarefas';
import { Produto } from '@/types/produto';

type NewTarefa = Omit<Tarefa, 'id'>;

export const fetchInitialData = async (): Promise<Partial<Tarefa>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        dataLancamento: new Date().toISOString().split('T')[0],
        numeroControle: 'CTRL-001',
        clienteNome: 'João',
        quantidade: 10,
        codigoProduto: 'PRD001',
        descricaoProduto: 'Produto A',
        operacao: 'Montagem',
        observacao: 'Urgente',
      });
    }, 500);
  });
};

export const fetchProducts = async (): Promise<Produto[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          cod_produto: '001',
          produto_nome: 'Produto 1',
          componente_id: 10,
          operacao_id: 20,
          posto_trabalho_id: 30,
          componente_nome: 'Componente Exemplo',
          operacao_nome: 'Operação Exemplo',
          posto_trabalho_nome: 'Posto Exemplo',
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
          componente_id: 11,
          operacao_id: 21,
          posto_trabalho_id: 31,
          componente_nome: 'Componente Exemplo 2',
          operacao_nome: 'Operação Exemplo 2',
          posto_trabalho_nome: 'Posto Exemplo 2',
          und_servicos: 'UN',
          grupo_id: 'SERVIÇO',
          tipo_produto: 2,
          codigo: '002',
          nome: 'Produto 2',
          componente: null,
        },
      ]);
    }, 500);
  });
};

export const fetchProductDetails = async (codigo: string): Promise<Produto> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 3,
        cod_produto: codigo,
        produto_nome: `Produto ${codigo}`,
        componente_id: 12,
        operacao_id: 22,
        posto_trabalho_id: 32,
        componente_nome: 'Componente Detalhe',
        operacao_nome: 'Operação Detalhe',
        posto_trabalho_nome: 'Posto Detalhe',
        und_servicos: 'UN',
        grupo_id: 'PRODUTO',
        tipo_produto: 1,
        codigo,
        nome: `Produto ${codigo}`,
        componente: null,
      });
    }, 300);
  });
};

export const saveTarefa = async (data: NewTarefa): Promise<Tarefa> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        ...data,
      });
    }, 500);
  });
};

export const deleteTarefas = async (_ids: number[]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500);
  });
};
