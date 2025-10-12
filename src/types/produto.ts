import {Componente } from '@/types/componente'
import { OperacaoItem } from '@/types/operacao'
import {PostoTrabalhoRead } from '@/types/posto_trabalho'

export interface Produto {
  id: number;
  cod_produto: string;
  produto_nome: string;
  data?: string;
  componente_id: number;
  operacao_id: number;
  posto_trabalho_id: number;
  componente_nome?: string;
  operacao_nome?: string;
  posto_trabalho_nome?: string;
  und_servicos?: string;
  grupo_id?: string;
  tipo_produto?: number;
  codigo?: string;
  nome?: string;
  componente?: Componente | null;
}

export interface ProdutoCompleto {
  id: number;
  cod_produto: string;
  produto_nome: string;
  und_servicos: string;
  grupo_id: 'PRODUTO' | 'SERVIÇO';
  tipo_produto: number;
  componente_id: number;
  operacao_id: number;
  posto_trabalho_id: number;
  componente?: Componente | null;
  operacao?:  OperacaoItem | null;
  posto_trabalho?: PostoTrabalhoRead | null;
  codigo: string;
  nome: string;
}
export interface ProdutoTabela {
  id: number;
  cod_produto: string;
  produto_nome: string;
  tipo_produto: number;
  componente_id: number;
  operacao_id: number;
  posto_trabalho_id: number;
  componente?: {
    id: number;
    componente_nome: string;
  } | null;
  operacao?: {
    id: number;
    op_nome: string;
  } | null;
  posto_trabalho?: {
    id: number;
    posto_trabalho_nome: string;
  } | null;
}

export type ProdutoNovo = Omit<Produto, 'id'>
