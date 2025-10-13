'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { IMaskInput } from 'react-imask'; // ✅ novo
import { Cliente, ClienteCreate } from '@/types/cliente';
import { ClienteSchema, ClienteFormValues } from '@/components/Zod-schemas/clientes';
import { onlyDigits } from '@/lib/string';

export default function ClienteForm({
  defaultValues,
  onSubmit,
  submitting,
}: {
  defaultValues?: Partial<Cliente>;                     // recebe Cliente completo se edição
  onSubmit: (data: ClienteCreate) => Promise<void> | void; // envia payload de create/update
  submitting?: boolean;
}) {
  const [tipo, setTipo] = useState<'CPF' | 'CNPJ'>(
    (defaultValues?.tipo_cliente as 'CPF' | 'CNPJ') ?? 'CPF'
  );

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(ClienteSchema),
    defaultValues: {
      tipo_cliente: (defaultValues?.tipo_cliente as any) ?? 'CPF',
      nome_cliente: defaultValues?.nome_cliente ?? '',
      doc_cliente: defaultValues?.doc_cliente ?? '',
      endereco_cliente: defaultValues?.endereco_cliente ?? '',
      num_cliente: defaultValues?.num_cliente ?? '',
      bairro_cliente: defaultValues?.bairro_cliente ?? '',
      cidade_cliente: defaultValues?.cidade_cliente ?? '',
      uf_cliente: defaultValues?.uf_cliente ?? '',
      cep_cliente: defaultValues?.cep_cliente ?? '',
      telefone_cliente: defaultValues?.telefone_cliente ?? '',
      telefone_rec_cliente: defaultValues?.telefone_rec_cliente ?? '',
      whatsapp_cliente: defaultValues?.whatsapp_cliente ?? '',
      email_cliente: defaultValues?.email_cliente ?? '',
      fornecedor_cliente_id: defaultValues?.fornecedor_cliente_id ?? undefined,
    },
    mode: 'onBlur',
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form;

  useEffect(() => {
    if (defaultValues) reset({ ...defaultValues } as any);
  }, [defaultValues, reset]);

  // Para IMask, use '0' no padrão (não '9'):
  const mask = useMemo(
    () => (tipo === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'),
    [tipo]
  );

  const submit = handleSubmit(async (values) => {
    const payload: ClienteCreate = {
      ...values,
      doc_cliente: onlyDigits(values.doc_cliente),
      cep_cliente: values.cep_cliente ? onlyDigits(values.cep_cliente) : undefined,
      telefone_cliente: values.telefone_cliente ? onlyDigits(values.telefone_cliente) : undefined,
      telefone_rec_cliente: values.telefone_rec_cliente ? onlyDigits(values.telefone_rec_cliente) : undefined,
      whatsapp_cliente: values.whatsapp_cliente ? onlyDigits(values.whatsapp_cliente) : undefined,
    };
    await onSubmit(payload);
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Tipo + Nome */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Tipo de Cliente</label>
          <select
            {...register('tipo_cliente')}
            onChange={(e) => setTipo(e.target.value as 'CPF' | 'CNPJ')}
            className={clsx('mt-1 w-full border rounded p-2', errors.tipo_cliente && 'border-red-500')}
          >
            <option value="CPF">CPF</option>
            <option value="CNPJ">CNPJ</option>
          </select>
          {errors.tipo_cliente && <p className="text-red-600 text-sm">{errors.tipo_cliente.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Nome</label>
          <input
            {...register('nome_cliente')}
            className={clsx('mt-1 w-full border rounded p-2', errors.nome_cliente && 'border-red-500')}
            placeholder="Nome do cliente"
          />
          {errors.nome_cliente && <p className="text-red-600 text-sm">{errors.nome_cliente.message}</p>}
        </div>
      </div>

      {/* Documento */}
      <div>
        <label className="block text-sm font-medium">Documento ({tipo})</label>
        <IMaskInput
          mask={mask}
          value={watch('doc_cliente') ?? ''}
          onAccept={(val: string) => setValue('doc_cliente', val, { shouldValidate: true })}
          inputMode="numeric"
          placeholder={tipo === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
          className={clsx('mt-1 w-full border rounded p-2', errors.doc_cliente && 'border-red-500')}
        />
        {errors.doc_cliente && <p className="text-red-600 text-sm">{errors.doc_cliente.message}</p>}
      </div>

      {/* CEP + UF */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">CEP</label>
          <IMaskInput
            mask="00000-000"
            value={watch('cep_cliente') ?? ''}
            onAccept={(val: string) => setValue('cep_cliente', val)}
            inputMode="numeric"
            placeholder="00000-000"
            className="mt-1 w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">UF</label>
          <input
            {...register('uf_cliente')}
            maxLength={2}
            className="mt-1 w-full border rounded p-2"
            placeholder="CE"
          />
          {errors.uf_cliente && <p className="text-red-600 text-sm">{errors.uf_cliente.message}</p>}
        </div>
      </div>

      {/* Endereço / Número / Bairro / Cidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Endereço</label>
          <input {...register('endereco_cliente')} className="mt-1 w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Número</label>
          <input {...register('num_cliente')} className="mt-1 w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Bairro</label>
          <input {...register('bairro_cliente')} className="mt-1 w-full border rounded p-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Cidade</label>
          <input {...register('cidade_cliente')} className="mt-1 w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Telefone</label>
          <IMaskInput
            mask="(00) 0000-0000"
            value={watch('telefone_cliente') ?? ''}
            onAccept={(val: string) => setValue('telefone_cliente', val)}
            inputMode="numeric"
            placeholder="(85) 3333-3333"
            className="mt-1 w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">WhatsApp</label>
          <IMaskInput
            mask="(00) 0 0000-0000"
            value={watch('whatsapp_cliente') ?? ''}
            onAccept={(val: string) => setValue('whatsapp_cliente', val)}
            inputMode="numeric"
            placeholder="(85) 9 9999-9999"
            className="mt-1 w-full border rounded p-2"
          />
        </div>
      </div>

      {/* Email + Fornecedor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Email</label>
          <input
            {...register('email_cliente')}
            className={clsx('mt-1 w-full border rounded p-2', errors.email_cliente && 'border-red-500')}
            placeholder="email@dominio.com"
          />
          {errors.email_cliente && <p className="text-red-600 text-sm">{errors.email_cliente.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Fornecedor (ID)</label>
          <input
            type="number"
            {...register('fornecedor_cliente_id', { valueAsNumber: true })}
            className="mt-1 w-full border rounded p-2"
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {submitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}