// src/components/ProdutoModal.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { FiX, FiSearch, FiChevronRight } from 'react-icons/fi'

interface Produto {
  codigo: string
  nome: string
  categoria?: string
}

interface ProdutoModalProps {
  aberto: boolean
  onClose: () => void
  onSelect: (indice: number) => void
  produtos: Produto[]
}

export default function ProdutoModal({
  aberto,
  onClose,
  onSelect,
  produtos
}: ProdutoModalProps) {
  const [busca, setBusca] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Foco automático e gerenciamento de teclado
  useEffect(() => {
    if (aberto && inputRef.current) {
      inputRef.current.focus()

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [aberto, onClose])

  // Fechar ao clicar fora (melhorado para touch devices)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (aberto) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [aberto, onClose])

  const produtosFiltrados = produtos.filter(produto =>
  (produto.nome?.toLowerCase() || '').includes(busca.toLowerCase()) ||
  (produto.codigo?.toLowerCase() || '').includes(busca.toLowerCase()) ||
  (produto.categoria?.toLowerCase() || '').includes(busca.toLowerCase())
)

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black bg-opacity-40 backdrop-blur-sm">
      {/* Container principal - Animações e tamanhos responsivos */}
      <div
        ref={modalRef}
        className={`
          w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[70vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col
          animate-[slideUp_0.3s_ease-out] sm:animate-[fadeIn_0.2s_ease-in]
        `}
      >
        {/* Cabeçalho sticky */}
        <div className="sticky top-0 p-4 border-b border-gray-200 flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Selecione um Produto</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar modal"
          >
            <FiX size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Barra de busca sticky */}
        <div className="sticky top-16 p-4 border-b border-gray-200 bg-white z-10">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar por nome, código ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              aria-label="Campo de busca de produtos"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Limpar busca"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Lista de produtos - Área rolável com otimização para performance */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {produtosFiltrados.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {produtosFiltrados.map((produto) => {
                const indexOriginal = produtos.findIndex(p => p.codigo === produto.codigo)
                return (
                  <li key={produto.codigo}>
                    <button
                      onClick={() => {
                        onSelect(indexOriginal)
                        onClose()
                        setBusca('')
                      }}
                      className="w-full text-left p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{produto.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {produto.codigo}
                          </span>
                          {produto.categoria && (
                            <span className="text-xs text-gray-500 truncate">
                              {produto.categoria}
                            </span>
                          )}
                        </div>
                      </div>
                      <FiChevronRight className="text-gray-400 flex-shrink-0" />
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <FiSearch size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Nenhum produto encontrado</h3>
              <p className="text-gray-500 mt-1">
                {busca ? 'Tente ajustar sua busca' : 'A lista de produtos está vazia'}
              </p>
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Limpar busca
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rodapé sticky com contador e ações */}
        <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'item' : 'itens'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setBusca('')
                inputRef.current?.focus()
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
  )
}
