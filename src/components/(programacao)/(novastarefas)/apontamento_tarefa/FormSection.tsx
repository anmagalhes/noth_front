import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormData } from '@/components/Zod-schemas/NovasTarefas_producao';
import { Product } from '@/types';
import ProductModal from '@/components/produto/ProductModal_novastarefa';
import { FiSearch, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { mapFromBackend } from '@/components/Zod-schemas/NovasTarefas_producao';

const InputField = ({ label, error, children }: { label: string; error?: any; children: React.ReactNode }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
    {children}
    {error && (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
        {error.message}
      </p>
    )}
  </div>
);

interface FormSectionProps {
  onAddRow: (row: FormData & { id: string; date: string }) => void;
  tarefaSelecionada?: Partial<FormData>;
}

const FormSection = ({ onAddRow, tarefaSelecionada }: FormSectionProps) => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      releaseDate: new Date().toISOString().split('T')[0],
    },
  });

  // Preencher formulário com dados da tarefa (quando mudar tarefaSelecionada)
 useEffect(() => {
  if (tarefaSelecionada) {
    console.log('Preenchendo campos com:', tarefaSelecionada);

    const mapped = mapFromBackend(tarefaSelecionada);
    console.log('Preenchendo campos  mapped :', mapped );

    // Preenche somente os campos necessários
    setValue('id', mapped.id);
    setValue('controlNumber', mapped.controlNumber);
    setValue('receiptDate', mapped.receiptDate);
    setValue('releaseDate', mapped.releaseDate);
    setValue('clientName', mapped.clientName);
    setValue('quantity', mapped.quantity);
    setValue('productCode', mapped.productCode);
    setValue('productDescription', mapped.productDescription);
    setValue('operation', mapped.operation);
    setValue('notes', mapped.notes || '');
    setValue('clientId', mapped.clientId);
    setValue('productId', mapped.productId);
    setValue('operationId', mapped.operationId);
  }
}, [tarefaSelecionada, setValue]);

  // Auto preencher produto via código digitado
  const productCode = watch('productCode');
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (productCode && productCode.length >= 2) {
        const foundProduct = allProducts.find(
          (p) => p.code.toLowerCase() === productCode.toLowerCase()
        );

        if (foundProduct) {
          setValue('productDescription', foundProduct.description || '');
          setValue('operation', foundProduct.operation || '');
          trigger(['productDescription', 'operation']);
        }
      }
    }, 300);
    return () => clearTimeout(timerId);
  }, [productCode, allProducts, setValue, trigger]);

  const handleProductSelect = useCallback(
    (product: Product) => {
      setValue('productCode', product.code);
      setValue('productDescription', product.description || '');
      setValue('operation', product.operation || '');
      setIsProductModalOpen(false);
      trigger(['productCode', 'productDescription', 'operation']);
    },
    [setValue, trigger]
  );

  const onSubmit = (data: FormData) => {
  const tarefaId = data.id ? Number(data.id) : 0;

  const newRow = {
    ...data,
    id: Date.now().toString(),
    date: data.releaseDate,
    tarefaId: tarefaId,
  };

  console.log("newrow teste")
  console.log(newRow)

  onAddRow(newRow);

  // Limpar apenas os campos desejados
  setValue('productCode', '');
  setValue('productDescription', '');
  setValue('operation', '');
  setValue('notes', '');
  setValue('quantity', 1);

  setSubmitSuccess(true);
  setTimeout(() => setSubmitSuccess(false), 3000);
};

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
        Adicionar Nova Tarefa de Produção
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Gerais */}

          {/* Campos ocultos para IDs */}
        <input type="hidden" {...register('clientId')}  readOnly />
        <input type="hidden" {...register('productId')} readOnly />
        <input type="hidden" {...register('id')} readOnly />

        <fieldset className="border border-gray-200 p-4 rounded-lg">
          <legend className="text-lg font-medium px-2">Informações Gerais</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField label="Número de Controle" error={errors.controlNumber}>
              <input
                id="controlNumber"
                type="text"
                readOnly
                className={`w-full rounded-lg border p-3 ${
                  errors.controlNumber ? 'border-red-500' : 'border-gray-300'
                } focus:ring-blue-500 focus:border-blue-500`}
                placeholder="CTRL-001"
                {...register('controlNumber')}
              />
            </InputField>

            <InputField label="Data de Lançamento" error={errors.releaseDate}>
              <input
                id="releaseDate"
                type="date"
                className={`w-full rounded-lg border p-3 ${
                  errors.releaseDate ? 'border-red-500' : 'border-gray-300'
                } focus:ring-blue-500 focus:border-blue-500`}
                {...register('releaseDate')}
              />
            </InputField>

            <InputField label="Nome do Cliente" error={errors.clientName}>
              <input
                id="clientName"
                type="text"
                className={`w-full rounded-lg border p-3 ${
                  errors.clientName ? 'border-red-500' : 'border-gray-300'
                } focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Nome do cliente"
                {...register('clientName')}
                onChange={(e) => setValue('clientName', e.target.value.toUpperCase())}
              />
            </InputField>
          </div>
        </fieldset>

        {/* Detalhes do Produto */}
        <fieldset className="border border-gray-200 p-4 rounded-lg">
          <legend className="text-lg font-medium px-2">Detalhes do Produto</legend>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-2">
              <InputField label="Quantidade" error={errors.quantity}>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="quantity"
                      type="number"
                      className={`w-full rounded-lg border p-3 ${
                        errors.quantity ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-blue-500 focus:border-blue-500`}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={1}
                    />
                  )}
                />
              </InputField>
            </div>

            <div className="md:col-span-3">
              <InputField label="Código do Produto" error={errors.productCode}>
                <div className="flex">
                  <input
                    id="productCode"
                    type="text"
                    className={`flex-1 rounded-l-lg border p-3 ${
                      errors.productCode ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Digite o código"
                    {...register('productCode')}
                  />
                  <button
                    type="button"
                    className="rounded-r-lg bg-blue-100 px-4 hover:bg-blue-200 transition flex items-center justify-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onClick={() => setIsProductModalOpen(true)}
                  >
                    <FiSearch className="text-blue-600 text-lg" />
                  </button>
                </div>
              </InputField>
            </div>

            <div className="md:col-span-5">
              <InputField label="Descrição do Produto" error={errors.productDescription}>
                <textarea
                  id="productDescription"
                  className={`w-full rounded-lg border p-3 ${
                    errors.productDescription ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                  rows={3}
                  placeholder="Descrição detalhada"
                  {...register('productDescription')}
                  onChange={(e) => setValue('productDescription', e.target.value.toUpperCase())}
                />
              </InputField>
            </div>

            <div className="md:col-span-2">
              <InputField label="Operação" error={errors.operation}>
                <input
                  id="operation"
                  type="text"
                  className={`w-full rounded-lg border p-3 ${
                    errors.operation ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Código operação"
                  {...register('operation')}
                  onChange={(e) => setValue('operation', e.target.value.toUpperCase())}
                />
              </InputField>
            </div>
          </div>
        </fieldset>

        {/* Observações */}
        <fieldset className="border border-gray-200 p-4 rounded-lg">
          <legend className="text-lg font-medium px-2">Observações</legend>
          <InputField label="Notas Adicionais" error={errors.notes}>
            <textarea
              id="notes"
              className={`w-full rounded-lg border p-3 ${
                errors.notes ? 'border-red-500' : 'border-gray-300'
              } focus:ring-blue-500 focus:border-blue-500`}
              rows={3}
              placeholder="Informações relevantes sobre a tarefa"
              {...register('notes')}
              onChange={(e) => setValue('notes', e.target.value.toUpperCase())}
            />
          </InputField>
        </fieldset>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 transition shadow-md hover:shadow-lg"
          >
            <FiPlus className="text-lg" />
            Adicionar Tarefa
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-300 transition"
          >
            <FiX className="text-lg" />
            Limpar Campos
          </button>
        </div>

        {submitSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
            <FiCheck className="mr-2 text-green-600" />
            Tarefa adicionada com sucesso!
          </div>
        )}
      </form>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={handleProductSelect}
        products={allProducts}
      />
    </div>
  );
};

export default FormSection;
