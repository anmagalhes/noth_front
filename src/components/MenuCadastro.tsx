'use client'

import { useState } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'

interface ComponenteProps {
  idComponente: string
  nomeComponente: string
  setnomeComponente: (nome: string) => void
}

export default function Componente({
  idComponente,
  nomeComponente,
  setnomeComponente,
}: ComponenteProps) {
  const [ativo, setAtivo] = useState(false)

  const handleAdicionar = () => {
    alert('Adicionar componente')
  }

  const handleEditar = () => {
    alert('Editar componente')
  }

  const handleDeletar = () => {
    alert('Deletar componente')
  }

  return (
    <div className="space-y-6">
      {/* Campos do formulário */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campo ID - apenas leitura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID
          </label>
          <input
            type="text"
            value={idComponente}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Campo Nome - editável, tudo maiúsculo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Componente
          </label>
          <input
            type="text"
            value={nomeComponente}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setnomeComponente(e.target.value.toUpperCase())
            }
            onFocus={() => setAtivo(true)}
            onBlur={() => setAtivo(false)}
            className={`w-full p-2 border rounded-md transition-all ${
              ativo ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
            }`}
            placeholder="Digite o nome do componente"
          />
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-between gap-4 mt-6">
        <button
          type="button"
          onClick={handleAdicionar}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        >
          <FaPlus size={16} />
          Adicionar
        </button>

        <button
          type="button"
          onClick={handleEditar}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          <FaEdit size={16} />
          Editar
        </button>

        <button
          type="button"
          onClick={handleDeletar}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-red-600 text-white rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
        >
          <FaTrash size={16} />
          Deletar
        </button>
      </div>
    </div>
  )
}
