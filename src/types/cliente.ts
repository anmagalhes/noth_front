// src/types/cliente.ts

export interface Cliente {
  id: number;
  tipo_cliente: string;
  nome_cliente: string;
  doc_cliente: string;
  endereco_cliente?: string;
  num_cliente?: string;
  bairro_cliente?: string;
  cidade_cliente?: string;
  uf_cliente?: string;
  cep_cliente?: string;
  telefone_cliente?: string;
  telefone_rec_cliente?: string;
  whatsapp_cliente?: string;
  email_cliente?: string;
  fornecedor_cliente_id?: number;
  data_cadastro_cliente: string;
  created_at: string;
  updated_at: string;
}

export type ClienteFormatado = {
  id: number;
  nome: string;
};


// ⚠️ Derivados para criar/editar (não mudam seu type original)
export type ClienteCreate = Omit<
  Cliente,
  'id' | 'created_at' | 'updated_at' | 'data_cadastro_cliente'
>;


export type ClienteUpdate = Partial<ClienteCreate>;

// ✅ Adicione isso:
export interface ClientesResponse {
  data: Cliente[];      // lista de clientes
  page: number;         // página atual
  pages: number;        // total de páginas
  total: number;        // total de registros
}
