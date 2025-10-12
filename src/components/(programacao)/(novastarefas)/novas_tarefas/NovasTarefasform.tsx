// src/app/novas_tarefas/NovasTarefasform.tsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { fetchProducts, fetchProductDetails } from '@/lib/api';
import { Produto } from '@/types/produto'

// Schema de validação com Zod
const schema = z.object({
  numeroControle: z.string().min(1, 'Número de controle é obrigatório'),
  dataRecebimento: z.string().min(1, 'Data de recebimento é obrigatória'),
  clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
  dataLancamento: z.string().min(1, 'Data de lançamento é obrigatória'),
  quantidade: z.number().min(1, 'Quantidade deve ser pelo menos 1'),
  codigoProduto: z.string().min(1, 'Código do produto é obrigatório'),
  descricaoProduto: z.string().min(1, 'Descrição do produto é obrigatória'),
  operacao: z.string().min(1, 'Operação é obrigatória'),
  observacao: z.string(),
});

type FormData = z.infer<typeof schema>;

type FormTarefaProps = {
  onSubmit: (data: FormData) => void;
  initialData?: Partial<FormData>;
  isLoading?: boolean;
};

export default function FormTarefa({ onSubmit, initialData, isLoading }: FormTarefaProps) {
  // Lista completa de produtos
  const [products, setProducts] = useState<Produto[]>([]);
  // Controle para mostrar/ocultar lista de produtos
  const [showProductList, setShowProductList] = useState(false);
  // Estado para texto de filtro da lista de produtos
  const [filterText, setFilterText] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataLancamento: new Date().toISOString().split('T')[0],
      quantidade: 1,
      observacao: '-',
      ...initialData, // merge com dados iniciais caso existam
    },
  });

  // Quando initialData mudar, atualizar o formulário
  useEffect(() => {
    if (initialData) {
      reset({
        dataLancamento: new Date().toISOString().split('T')[0],
        quantidade: 1,
        observacao: '-',
        ...initialData,
      });
    }
  }, [initialData, reset]);

  // Busca produtos e mostra a lista
  const handleProductSearch = async () => {
    try {
      const produtos = await fetchProducts();
      setProducts(produtos);
      setShowProductList(true);
      setFilterText(''); // limpa filtro ao abrir lista
    } catch {
      toast.error('Erro ao buscar produtos');
    }
  };

  // Seleciona produto e preenche o formulário
  const handleSelectProduct = async (codigo: string) => {
  try {
    const product = await fetchProductDetails(codigo);

    if (!product.cod_produto || !product.produto_nome || !product.operacao_nome) {
      toast.error('Produto incompleto');
      return;
    }

    setValue('codigoProduto', product.cod_produto);
    setValue('descricaoProduto', product.produto_nome);
    setValue('operacao', product.operacao_nome);
    setShowProductList(false);
  } catch {
    toast.error('Erro ao buscar detalhes do produto');
  }
};

  // Filtra os produtos pela busca (código ou nome)
  const filteredProducts = products.filter((produto) => {
  const texto = filterText.toLowerCase();
  const codigo = produto.codigo || '';
  const nome = produto.nome || '';
  return codigo.toLowerCase().includes(texto) || nome.toLowerCase().includes(texto);
});

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-screen-xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Primeira linha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-6">
          {/* Número de Controle */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Número de controle:</label>
            <input
              {...register('numeroControle')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base"
              aria-invalid={errors.numeroControle ? 'true' : 'false'}
              disabled={isLoading}
            />
            {errors.numeroControle && (
              <p className="text-red-600 text-sm mt-1">{errors.numeroControle.message}</p>
            )}
          </div>

          {/* Data de Lançamento */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Data de Lançamento:</label>
            <input
              type="date"
              {...register('dataLancamento')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base"
              aria-invalid={errors.dataLancamento ? 'true' : 'false'}
              disabled={isLoading}
            />
            {errors.dataLancamento && (
              <p className="text-red-600 text-sm mt-1">{errors.dataLancamento.message}</p>
            )}
          </div>

          {/* Nome do Cliente */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Nome do Cliente:</label>
            <input
              {...register('clienteNome')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base"
              aria-invalid={errors.clienteNome ? 'true' : 'false'}
              disabled={isLoading}
            />
            {errors.clienteNome && (
              <p className="text-red-600 text-sm mt-1">{errors.clienteNome.message}</p>
            )}
          </div>
        </div>

        {/* Segunda linha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-6">
          {/* Quantidade */}
          <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Quantidade:</label>
            <input
              type="number"
              {...register('quantidade', { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base"
              aria-invalid={errors.quantidade ? 'true' : 'false'}
              min={1}
              disabled={isLoading}
            />
            {errors.quantidade && (
              <p className="text-red-600 text-sm mt-1">{errors.quantidade.message}</p>
            )}
          </div>

          {/* Código do Produto */}
          <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Código do produto:</label>
            <div className="flex">
              <input
                {...register('codigoProduto')}
                className="mt-1 block w-full border border-gray-300 rounded-l-md shadow-sm p-2 text-base"
                aria-invalid={errors.codigoProduto ? 'true' : 'false'}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleProductSearch}
                className="mt-1 bg-gray-200 px-4 rounded-r-md hover:bg-gray-300"
                aria-label="Buscar produtos"
                disabled={isLoading}
              >
                🔍
              </button>
            </div>
            {errors.codigoProduto && (
              <p className="text-red-600 text-sm mt-1">{errors.codigoProduto.message}</p>
            )}
          </div>

          {/* Descrição do Produto */}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 xl:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Descrição do Produto:</label>
            <input
              {...register('descricaoProduto')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base"
              aria-invalid={errors.descricaoProduto ? 'true' : 'false'}
              disabled={isLoading}
            />
            {errors.descricaoProduto && (
              <p className="text-red-600 text-sm mt-1">{errors.descricaoProduto.message}</p>
            )}
          </div>

          {/* Operação */}
          <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Operação:</label>
            <input
              {...register('operacao')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base"
              aria-invalid={errors.operacao ? 'true' : 'false'}
              disabled={isLoading}
            />
            {errors.operacao && (
              <p className="text-red-600 text-sm mt-1">{errors.operacao.message}</p>
            )}
          </div>
        </div>

        {/* Data de Recebimento (faltava no form, mas está no schema) */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Data de Recebimento:</label>
          <input
            type="date"
            {...register('dataRecebimento')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base"
            aria-invalid={errors.dataRecebimento ? 'true' : 'false'}
            disabled={isLoading}
          />
          {errors.dataRecebimento && (
            <p className="text-red-600 text-sm mt-1">{errors.dataRecebimento.message}</p>
          )}
        </div>

        {/* Observações */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Observações:</label>
          <textarea
            {...register('observacao')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-base"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Botões */}
        <div className="flex justify-between pt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 text-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Adicionar'}
          </button>
          <button
            type="button"
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 text-lg"
            onClick={() => toast('Função salvar não implementada')}
            disabled={isLoading}
          >
            Salvar
          </button>
        </div>
      </form>

      {/* Lista de produtos para seleção */}
      {showProductList && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md max-w-screen-xl mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar Produtos:</label>

          <input
            type="text"
            placeholder="Digite para filtrar..."
            className="w-full p-2 border rounded-md mb-3 text-base"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <div className="max-h-60 overflow-y-auto text-base">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((produto) => (
                <div
                  key={produto.codigo}
                  className="p-2 hover:bg-gray-200 cursor-pointer border-b"
                    onClick={() => {
                    if (produto.codigo) {
                      handleSelectProduct(produto.codigo);
                    }
                  }}
                >
                  <strong>{produto.codigo}</strong> - {produto.nome}
                </div>
              ))
            ) : (
              <p>Nenhum produto encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
