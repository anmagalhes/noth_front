import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiChevronRight } from 'react-icons/fi';
import { Product } from '@/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const ProductModal = ({ isOpen, onClose, onSelectProduct }: ProductModalProps) => {
  const [filter, setFilter] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Chamada simulada - substituir por chamada real
        const mockProducts: Product[] = [
          {
            id: '1',
            code: 'P001',
            name: 'Produto 1',
            description: 'Descrição detalhada do produto 1',
            operation: 'OP1',
            category: 'Categoria A',
            price: 29.99
          },
          {
            id: '2',
            code: 'P002',
            name: 'Produto 2',
            description: 'Descrição detalhada do produto 2',
            operation: 'OP2',
            category: 'Categoria B',
            price: 49.99
          },
        ];
        setProducts(mockProducts);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    if (isOpen) {
      fetchProducts();
      setFilter('');
    }
  }, [isOpen]);

  // Foco automático e gerenciamento de teclado
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Função de filtro corrigida
  const filteredProducts = products.filter(product => {
    const lowerFilter = filter.toLowerCase();
    return (
      product.code.toLowerCase().includes(lowerFilter) ||
      product.name.toLowerCase().includes(lowerFilter) ||
      (product.description?.toLowerCase() || '').includes(lowerFilter) ||
      (product.category?.toLowerCase() || '').includes(lowerFilter)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black bg-opacity-40 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[70vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out] sm:animate-[fadeIn_0.2s_ease-in]"
      >
        {/* Cabeçalho */}
        <div className="sticky top-0 p-4 border-b border-gray-200 flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Selecionar Produto</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <FiX size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Barra de busca */}
        <div className="sticky top-16 p-4 border-b border-gray-200 bg-white z-10">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar por código, nome, descrição ou categoria..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              aria-label="Campo de busca de produtos"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Limpar busca"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {filteredProducts.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-full text-left p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {product.code}
                        </span>
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {product.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        {product.category && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {product.category}
                          </span>
                        )}
                        {product.operation && (
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                            Operação: {product.operation}
                          </span>
                        )}
                        {product.price && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            R$ {product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400 flex-shrink-0 mt-2" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <FiSearch size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Nenhum produto encontrado</h3>
              <p className="text-gray-500 mt-1">
                {filter ? 'Tente ajustar sua busca' : 'A lista de produtos está vazia'}
              </p>
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Limpar busca
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilter('');
                inputRef.current?.focus();
              }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
