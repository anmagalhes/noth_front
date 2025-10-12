'use client'

import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useState } from 'react'

interface ClienteSelectProps {
  cliente: string
  setCliente: (nome: string) => void
  clientes: string[]
}

export default function ClienteSelect({ cliente, setCliente, clientes }: ClienteSelectProps) {
  const [mostrarLista, setMostrarLista] = useState(false)

  const selecionarCliente = (nome: string) => {
    setCliente(nome)
    setMostrarLista(false)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Cliente
      </label>
      <div className="relative">
        <button
          onClick={() => setMostrarLista(prev => !prev)}
          className="flex justify-between items-center w-full p-2 border border-gray-300 rounded-md bg-white"
          type="button"
        >
          <span className={cliente ? 'text-gray-800' : 'text-gray-400'}>
            {cliente || 'Selecione um cliente'}
          </span>
          {mostrarLista ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {mostrarLista && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
            {clientes.map(nome => (
              <button
                key={nome}
                className={`block w-full text-left p-2 hover:bg-gray-100 ${
                  cliente === nome ? 'bg-green-50' : ''
                }`}
                onClick={() => selecionarCliente(nome)}
                type="button"
              >
                {nome}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
