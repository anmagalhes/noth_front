export interface PostoTrabalhoRead {
  id: number
  nome: string
  codigo?: string
}

// types/posto_trabalho.ts
export type ProdutoItem = {
  id: number;
  nome: string;
  // ...outros campos que você já tem no Produto
  posto_trabalho_id?: number | null;
};

export type PostoTrabalhoItem = {
  id: number;
  posto_trabalho_nome: string;
  data_execucao: string; // ISO string
  produtos?: ProdutoItem[];
};

export type PostoTrabalhoCreate = {
  posto_trabalho_nome: string;
  // opcional: vincular produtos na criação
  produto_ids?: number[];
};

export type PostoTrabalhoUpdate = Partial<
  Omit<PostoTrabalhoItem, 'id' | 'data_execucao'>
> & {
  // se quiser atualizar vinculação de produtos
  produto_ids?: number[] | null;
};
