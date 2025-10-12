// src//types/tarefas.ts
import { RecebimentoRead } from './recebimento'
import { ComponenteRead } from './componente'
import { OperacaoRead } from './operacao'
import { PostoTrabalhoRead } from './posto_trabalho'
import { Produto } from './produto'
import { Cliente } from './cliente'


export type Tarefa = {
  id: number;
  dataLancamento: string;
  numeroControle: string;
  clienteNome: string;
  quantidade: number;
  codigoProduto: string;
  descricaoProduto: string;
  observacao: string;            // id único da linha, ex: id da ordem/pedido
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

  recebimento?: RecebimentoRead | null
  componente?: ComponenteRead | null
  operacao?: OperacaoRead | null
  posto_trabalho?: PostoTrabalhoRead | null
  produto?: Produto | null
  cliente?: Cliente | null
}


export type Produto = {
  codigo: string;
  nome: string;
  descricao: string;
  operacao: string;
}

export type Cliente = {
  id: number;
  nome: string;
}

export type Ordem = {
  id: number;
  controlNumber: string;
  receiptDate: string;
  clientName: string;
}

export type NewTarefa = Omit<Tarefa, 'id'>;


export interface TarefaCompleta {
  id: number;
  id_ordem: string; // ID_Ordem - Recebimento
  dataRec_OrdemServicos: string; // Data de recebimento
  id_cliente: string; // ID do cliente
  nome_cliente?: string; // opcional, populado por join
  qtde_servico: number;
  id_servico: string;
  nome_servico?: string;
  id_servico2?: string;
  nome_servico2?: string;
  id_operacao: string;
  nome_operacao?: string;
  desc_servico_produto: string;
  observacao: string;
  status_item: 'PENDENTE' | 'EM ANDAMENTO' | 'CONCLUIDO' | 'NAO INICIADO'; // ou string comum
  data_lancamento: string;
  referencia_produto: string;
  nota_interna?: string;
  dataChecklist_OrdemServicos?: string;
}

export type TableRow = {
  id: string; // ID único para a linha
  descricao?: string;
  quantidade: number;
  data: string;
  tarefaId?: number;

  // Adicione mais campos conforme necessário:
  codigoProduto?: string;
  descricaoProduto?: string;
  clienteNome?: string;
  observacao?: string;

  recebimento?: RecebimentoRead | null
  componente?: ComponenteRead | null
  operacao?: OperacaoRead | null
  posto_trabalho?: PostoTrabalhoRead | null
  produto?: Produto | null
  cliente?: Cliente | null
};

export interface TarefaAPI {
  id: number;
  id_ordem: string; // ID_Ordem - Recebimento
  dataRec_OrdemServicos: string; // Data de recebimento
  id_cliente: string; // ID do cliente
  nome_cliente?: string; // opcional, populado por join
  qtde_servico: number;
  id_servico: string;
  nome_servico?: string;
  id_servico2?: string;
  nome_servico2?: string;
  id_operacao: string;
  nome_operacao?: string;
  desc_servico_produto: string;
  observacao: string;
  status_item: 'PENDENTE' | 'EM ANDAMENTO' | 'CONCLUIDO' | 'NAO INICIADO'; // ou string comum
  data_lancamento: string;
  referencia_produto: string;
  nota_interna?: string;
  dataChecklist_OrdemServicos?: string;
}


export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  operation: string;
}

export interface TarefaItem {
  id: number;
  id_tarefa: number;
  descricao: string;
  quantidade: number;
  codigoProduto: string;
  descricaoProduto?: string;
  status_item: 'PENDENTE' | 'EM ANDAMENTO' | 'CONCLUIDO' | 'NAO INICIADO';
  observacao?: string;
  dataCriacao: string;
  idProduto?: string;
  idCliente?: string;
}

export interface TarefaItemResponse {
  data: TarefaItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

