import { TableRow } from '@/types/types';

// Simulação de dados
const mockData: TableRow[] = [
  {
    id: 1,
    dataEntrada: '2023-10-01',
    orcamento: 'ORC-001',
    pedido: 'PED-001',
    numeroControle: 'CTRL-001',
    seq: '1',
    cliente: 'Cliente A',
    codigo: 'COD-001',
    quantidade: '100',
    operacao: 'CORTE',
    descricao: 'Descrição do produto',
    observacao: 'Urgente',
    notaFiscal: 'NF-001',
    dataProducao: '2023-10-05',
    prazoEntrega: '2023-10-10',
    status: 'ANDAMENTO',
    idnovastarefas: 'TASK-001',
    idPCP: 'PCP-001',
    selected: false
  },
  // ... mais dados
];

export const fetchTableData = async (): Promise<TableRow[]> => {
  // Simulação de requisição
  return new Promise(resolve => {
    setTimeout(() => resolve(mockData), 500);
  });
};

export const saveTableData = async (data: TableRow[]): Promise<void> => {
  // Simulação de salvamento
  return new Promise(resolve => {
    console.log('Dados salvos:', data);
    setTimeout(resolve, 500);
  });
};
