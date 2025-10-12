// src/types.ts
export interface Defeito {
  id: number;
  def_nome: string;
  data: string; // ISO string, pode ser convertido com dayjs, date-fns etc.
  componente_id: number;
  componente_nome?: string; // pode ser undefined se o backend não enviar
}

export interface DefeitoCreate {
  def_nome: string;
  data: string;
  componente_id: number;
  componente_nome?: string;
}

