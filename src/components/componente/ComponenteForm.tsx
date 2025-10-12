'use client'
import React, { useState, useEffect } from 'react'
import {
  CheckCircleIcon,
  PencilSquareIcon,
  XCircleIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid'

interface Props {
  componenteId?: string
  componenteNome?: string
  onSave: (nome: string) => void
  onCancel?: () => void
}

export default function ComponenteForm({
  componenteId,
  componenteNome = '',
  onSave,
  onCancel
}: Props) {
  const [nome, setNome] = useState(componenteNome)

  useEffect(() => {
    setNome(componenteNome)
  }, [componenteNome])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      alert('Digite o nome do componente')
      return
    }
    onSave(nome.toUpperCase())
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6 items-end"
    >
      {/* ID */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
        <input
          type="text"
          value={componenteId || ''}
          disabled
          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-center text-sm"
        />
      </div>

      {/* Nome do componente */}
      <div className="sm:col-span-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Componente</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value.toUpperCase())}
          placeholder="Digite o nome"
          className="w-full p-2 border border-gray-300 rounded-md uppercase text-sm"
        />
      </div>

      {/* Botões */}
      <div className="sm:col-span-6 flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition text-sm font-medium w-full sm:w-auto"
        >
          {componenteId ? (
            <>
              <ArrowPathIcon className="w-5 h-5" />
              Atualizar
            </>
          ) : (
            <>
              <PlusIcon className="w-5 h-5" />
              Adicionar
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition text-sm font-medium w-full sm:w-auto"
          >
            <XCircleIcon className="w-5 h-5" />
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
