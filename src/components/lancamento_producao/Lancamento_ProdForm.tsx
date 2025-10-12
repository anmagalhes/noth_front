'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ordemTarefaFormSchema, OrdemTarefaFormData } from '@/components/Zod-schemas/Lanc_producao_tarefa';
import { useState } from 'react';
import { FiSearch, FiPlus, FiX, FiCheck } from 'react-icons/fi';

const OrdemTarefaForm = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<OrdemTarefaFormData>({
    resolver: zodResolver(ordemTarefaFormSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const onSubmit = (data: OrdemTarefaFormData) => {
    console.log('Form enviado:', data);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-xl shadow-md">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block mb-1 font-medium">Número de Controle</label>
          <input {...register('controlNumber')} className="form-input w-full" />
          {errors.controlNumber && <p className="text-red-500 text-sm">{errors.controlNumber.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Data de Recebimento</label>
          <input type="date" {...register('receiptDate')} className="form-input w-full" />
          {errors.receiptDate && <p className="text-red-500 text-sm">{errors.receiptDate.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Data de Lançamento</label>
          <input type="date" {...register('releaseDate')} className="form-input w-full" />
          {errors.releaseDate && <p className="text-red-500 text-sm">{errors.releaseDate.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Nome do Cliente</label>
          <input {...register('clientName')} className="form-input w-full" />
          {errors.clientName && <p className="text-red-500 text-sm">{errors.clientName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium">Quantidade</label>
          <Controller
            control={control}
            name="quantity"
            render={({ field }) => (
              <input type="number" {...field} className="form-input w-full" min={1} />
            )}
          />
          {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Código do Produto</label>
          <div className="flex">
            <input {...register('productCode')} className="form-input w-full rounded-r-none" />
            <button type="button" className="bg-gray-200 px-3 rounded-r" title="Buscar Produto">
              <FiSearch />
            </button>
          </div>
          {errors.productCode && <p className="text-red-500 text-sm">{errors.productCode.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Operação</label>
          <input {...register('operation')} className="form-input w-full" />
          {errors.operation && <p className="text-red-500 text-sm">{errors.operation.message}</p>}
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">Descrição do Produto</label>
        <textarea {...register('productDescription')} className="form-textarea w-full" rows={3}></textarea>
        {errors.productDescription && <p className="text-red-500 text-sm">{errors.productDescription.message}</p>}
      </div>

      <div>
        <label className="block mb-1 font-medium">Observações</label>
        <textarea {...register('notes')} className="form-textarea w-full" rows={2}></textarea>
      </div>

      {/* Campos ocultos */}
      <input type="hidden" {...register('ordemId')} />
      <input type="hidden" {...register('productId')} />
      <input type="hidden" {...register('input1')} />
      <input type="hidden" {...register('input2')} />
      <input type="hidden" {...register('input3')} />
      <input type="hidden" {...register('resultValue')} />

      <div className="flex gap-4">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded flex gap-2 items-center">
          <FiPlus />
          Adicionar
        </button>
        <button type="button" onClick={() => reset()} className="bg-gray-200 px-4 py-2 rounded">
          <FiX />
          Limpar
        </button>
      </div>

      {submitSuccess && (
        <div className="bg-green-100 text-green-700 p-3 rounded mt-4 flex items-center gap-2">
          <FiCheck />
          Tarefa adicionada com sucesso!
        </div>
      )}
    </form>
  );
};

export default OrdemTarefaForm;
