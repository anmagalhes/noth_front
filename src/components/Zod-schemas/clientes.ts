'use client';

import { z } from 'zod';
import { isValidCPF, isValidCNPJ } from '@/lib/cpfCnpj';

// Helper: trata '' como undefined (útil para campos opcionais)
const emptyToUndefined = <T extends string | null | undefined>(v: T) =>
  (typeof v === 'string' && v.trim() === '') ? undefined : (v === null ? undefined : v);

export const ClienteSchema = z
  .object({
    tipo_cliente: z.enum(['CPF', 'CNPJ'], {
      required_error: 'Selecione CPF ou CNPJ',
    }),

    nome_cliente: z.string().trim().min(3, 'Nome é obrigatório'),

    // Não coloque .min(11) aqui: vamos validar no superRefine, com os dígitos
    doc_cliente: z.string().trim(),

    endereco_cliente: z.string().optional().nullable().transform(emptyToUndefined),
    num_cliente: z.string().optional().nullable().transform(emptyToUndefined),
    bairro_cliente: z.string().optional().nullable().transform(emptyToUndefined),
    cidade_cliente: z.string().optional().nullable().transform(emptyToUndefined),

    uf_cliente: z
      .string()
      .max(2, 'UF deve ter 2 caracteres')
      .optional()
      .nullable()
      .transform((v) => (v ? v.toUpperCase() : v)),

    cep_cliente: z.string().optional().nullable().transform(emptyToUndefined),
    telefone_cliente: z.string().optional().nullable().transform(emptyToUndefined),
    telefone_rec_cliente: z.string().optional().nullable().transform(emptyToUndefined),
    whatsapp_cliente: z.string().optional().nullable().transform(emptyToUndefined),

    // Só valida e-mail quando houver valor (vazio passa)
    email_cliente: z
      .string()
      .optional()
      .nullable()
      .transform(emptyToUndefined)
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email inválido'),

    fornecedor_cliente_id: z.number().int().positive().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Validação do documento SEM máscara
    const digits = (data.doc_cliente ?? '').replace(/\D+/g, '');

    // Documento obrigatório
    if (!digits) {
      ctx.addIssue({
        code: 'custom',
        path: ['doc_cliente'],
        message: 'Documento obrigatório',
      });
      return;
    }

    if (data.tipo_cliente === 'CPF') {
      if (digits.length !== 11 || !isValidCPF(digits)) {
        ctx.addIssue({
          code: 'custom',
          path: ['doc_cliente'],
          message: 'CPF inválido',
        });
      }
    } else if (data.tipo_cliente === 'CNPJ') {
      if (digits.length !== 14 || !isValidCNPJ(digits)) {
        ctx.addIssue({
          code: 'custom',
          path: ['doc_cliente'],
          message: 'CNPJ inválido',
        });
      }
    } else {
      ctx.addIssue({
        code: 'custom',
        path: ['tipo_cliente'],
        message: 'Tipo de cliente inválido',
      });
    }
  });

export type ClienteFormValues = z.infer<typeof ClienteSchema>;
