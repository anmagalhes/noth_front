export interface OperacaoItem {
  id: number;
  op_nome: string;
  op_grupo_processo: string;
  data_execucao: string;
}

export interface OperacaoRead {
  id: number;
  op_nome: string;
  op_grupo_processo: string;
  data_execucao: string;
}
