export interface TableRow {
  id: number;
  dataEntrada: string;
  orcamento: string;
  pedido: string;
  numeroControle: string;
  seq: string;
  cliente: string;
  codigo: string;
  quantidade: string;
  operacao: string;
  descricao: string;
  observacao: string;
  notaFiscal: string;
  dataProducao: string;
  prazoEntrega: string;
  status: string;
  idnovastarefas: string;
  idPCP: string;
  selected: boolean;
}

export type TableColumn = keyof Omit<TableRow, 'id' | 'selected'>;
