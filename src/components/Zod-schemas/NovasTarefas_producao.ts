// schemas/NovasTarefas_producao.ts
import { z } from 'zod';

export const formSchema = z.object({
  controlNumber: z.string().optional(),
  receiptDate: z.string().optional(),
  releaseDate: z.string().min(1, "Data de lançamento é obrigatória"),
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  quantity: z.number().min(1, "Quantidade mínima é 1"),
  productCode: z.string().min(1, "Código do produto é obrigatório"),
  productDescription: z.string().min(1, "Descrição do produto é obrigatória"),
  operation: z.string().min(1, "Operação é obrigatória"),
  notes: z.string().optional(),

  // ✅ Campo ID da tarefa
  id: z.number().optional(),

   // ✅ Adicione os campos de ID aqui
  clientId: z.string().optional(),
  productId: z.string().optional(),
  operationId: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

// Tipo para enviar ao backend, com nomes em snake_case
export interface BackendFormData {
  id: number;
  control_number?: string;
  receipt_date?: string;
  data_lancamento: string;
  nome_cliente: string;
  idCliente?: string;
  quantidade: number;
  idProduto?: string;
  codigo_produto: string;
  descricao_produto: string;
  operacao: string;
  notas?: string;
}

// Função que converte dados do backend para o formulário
export const mapFromBackend = (data: any): FormData => ({
  id: data.id,
  controlNumber: data?.recebimento?.os_formatado ?? '',
  receiptDate: data?.data_rec_ordem?.split('T')[0] ?? '',
  releaseDate: data?.data_lancamento?.split('T')[0] ?? new Date().toISOString().split('T')[0],
  clientName: data?.recebimento?.cliente?.nome_cliente?.toUpperCase() ?? '',

  quantity: data?.qtde_servico ?? 1,
  productCode: data?.referencia_produto ?? '',
  productDescription: data?.desc_servico_produto ?? '',
  operation: data?.id_operacao != null ? data.id_operacao.toString() : '',
  notes: data?.nota_interna ?? '',

    // ✅ Novos campos retornados
  clientId: data?.recebimento?.cliente?.id?.toString() ?? '',
  productId: data?.id_produto?.toString() ?? '',
  operationId: data?.id_operacao?.toString() ?? '',

});

export const mapTableRowToBackendPayload = (row: any) => ({
  id_tarefa_original: Number(row?.tarefaId) || 0,
  os_formatado: String(row?.controlNumber || ''),
  id_cliente: Number(row?.clientId) || 0,
  id_produto: Number(row?.productId) || 0,
  data_lancamento: row?.date || '', // já em formato YYYY-MM-DD
  nome_cliente: row?.clientName || '',
  quantidade: Number(row?.quantity) || 0,
  codigo_produto: row?.productCode || '',
  descricao_produto: row?.productDescription || '',
  operacao: row?.operation || '',
  notas: row?.notes || '',
  clientId: row?.clientId || '',
  productId: row?.productId || '',
  operationId: row?.operationId || '',
});


// LEVAR OS DADOS PARA O BACKEND
export const mapToItemTarefaCreatePayload = (row: any) => {
  if (!row?.date || isNaN(Date.parse(row.date))) {
    throw new Error(`Data inválida na tarefa ID ${row?.tarefaId ?? 'desconhecida'}`);
  }

  return {
    tarefa_id: Number(row?.tarefaId),
    data_tarefa: new Date(row.date).toISOString(),
    qtde_servico: Number(row?.quantity),
    id_servico: Number(row?.productId),
    id_servico2: null,
    id_operacao: Number(row?.operationId),
    desc_servico_produto: row?.productDescription || null,
    obs: row?.notes || null,
    status: "AGUARDANDO_APROVACAO",
    id_cliente: Number(row?.clientId),
  };
};

export  const rowSchema = z.object({
  id: z.string(),
  tarefaId: z.number().optional(),
  date: z.string().optional().nullable(),
  controlNumber: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  quantity: z.number().optional().nullable(),
  productCode: z.string().optional().nullable(),
  productDescription: z.string().optional().nullable(),
  operation: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
