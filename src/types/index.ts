export interface TableRow {
  id: string;              // id único da linha, ex: id da ordem/pedido
  date: string;
  controlNumber: string;
  clientName: string;      // só pra mostrar na tabela (nome do cliente)
  idCliente?: string;      // id do cliente para backend (oculto na UI)
  quantity: number;
  productCode: string;     // código do produto para mostrar
  idProduto?: string;      // id do produto para backend (oculto)
  productDescription: string;
  operation: string;
  notes: string;
  selected?: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  operation: string;
}
