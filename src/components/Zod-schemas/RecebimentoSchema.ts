// schemas/recebimentoSchema.ts
import { z } from 'zod';

export const recebimentoSchema = z.object({
  tipoOrdem: z.enum(['NOVO', 'NAO'], {
    required_error: 'Tipo de ordem é obrigatório'
  }),
  numeroControle: z.string().min(1, 'Número de controle é obrigatório'),
  dataRecebimento: z.string().min(1, 'Data é obrigatória'),
  horaRecebimento: z.string().min(1, 'Hora é obrigatória'),
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  quantidade: z.string()
    .min(1, 'Quantidade é obrigatória')
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Quantidade deve ser um número positivo'
    }),
  codigoProduto: z.string().min(1, 'Código do produto é obrigatório'),
  nomeProduto: z.string().min(1, 'Nome do produto é obrigatório'),
  referencia: z.string().optional(),
  nfRemessa: z.string().optional(),
  observacao: z.string().optional(),
});

export type RecebimentoFormData = z.infer<typeof recebimentoSchema>;
