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

// ✅ Resposta paginada genérica
export interface ProdutosResponse<T = ProdutoTabela> {
  data: T[];
  page: number;
  pages: number;
  total: number;
}

// ✅ Payloads para API (alinhados ao seu model/CRUD)
export type GrupoIdAPI = 'PRODUTO' | 'SERVICO';    // transporta SEM acento
export type GrupoIdUI  = 'PRODUTO' | 'SERVIÇO';    // exibição (opcional)

// Create/Update payloads (o backend espera isto)
export interface ProdutoCreatePayload {
  cod_produto: string;
  produto_nome: string;
  und_servicos: string;
  grupo_id: GrupoIdAPI;         // PRODUTO | SERVICO
  tipo_produto: 1 | 2;          // 1 = Produto, 2 = Tarefa
  componente_id: number;
  operacao_id: number;
  posto_trabalho_id: number;
  // fornecedor_ids?: number[]; // adicione se já tiver essa associação no backend
}

export type ProdutoUpdatePayload = Partial<ProdutoCreatePayload>;

// ✅ Helpers para mapear acento do grupo (UI ⇄ API)
export function toApiGrupoId(g: GrupoIdUI | GrupoIdAPI): GrupoIdAPI {
  return g === 'SERVIÇO' ? 'SERVICO' : g;
}
export function toUiGrupoId(g: GrupoIdAPI | string): GrupoIdUI {
  return g === 'SERVICO' ? 'SERVIÇO' : 'PRODUTO';
}

export type ProdutoCreate = {
  cod_produto: string;
  produto_nome: string;
  und_servicos: string;
  grupo_id: 'PRODUTO' | 'SERVICO';
  tipo_produto: 1 | 2;
  componente_id: number;
  operacao_id: number;
  posto_trabalho_id: number;
  fornecedor_ids: number[];
};
