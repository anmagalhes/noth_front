// src/components/funcao/FuncaoTable.tsx
import React from 'react'
import { Funcao } from '@/types/funcao'
import { FiEdit, FiTrash2 } from 'react-icons/fi'

interface Props {
  funcoes: Funcao[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  selecionados: number[]
  toggleSelecionado: (id: number) => void
  toggleSelecionarTodos: () => void
  todosSelecionados: boolean
  idEditar: number | null
  editaveis: Funcao[]
  setEditaveis: React.Dispatch<React.SetStateAction<Funcao[]>>
  onSalvarEdicao: (item: Funcao) => void
  onCancelarEdicao?: () => void
  onDeleteEmMassa?: (ids: number[]) => void
  onEditarEmMassa?: (editaveis: Funcao[]) => void
  grupos?: any[]
  modoEdicaoMultipla?: boolean
}

export default function FuncaoTable({
  funcoes,
  onEdit,
  onDelete,
  selecionados,
  toggleSelecionado,
  toggleSelecionarTodos,
  todosSelecionados,
  idEditar,
  editaveis,
  setEditaveis,
  onSalvarEdicao,
  modoEdicaoMultipla, // recebe prop
}: Props) {

  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <table className="w-full table-auto border border-gray-200 rounded-md shadow-sm">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Nome da Função</th>
            <th className="px-4 py-2 text-left">Ações</th>
            <th className="px-4 py-2 text-center">
              <input
                type="checkbox"
                checked={todosSelecionados}
                onChange={toggleSelecionarTodos}
                className="accent-green-600 w-5 h-5 rounded"
                disabled={modoEdicaoMultipla} // exemplo: desabilita selecionar todos no modo edição múltipla
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {funcoes.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4">
                Nenhuma função cadastrada.
              </td>
            </tr>
          ) : (
            funcoes.map((item) => {
              const estaEditando = idEditar === item.id
              const editavelItem = editaveis.find((e) => e.id === item.id)

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 border-t border-gray-200 ${
                    estaEditando ? 'bg-yellow-100' : ''
                  }`}
                >
                  <td className="px-4 py-2">{item.id}</td>

                  {/* Campo funcao_nome */}
                  <td className="px-4 py-2">
                    {modoEdicaoMultipla ? (
                      <input
                        type="text"
                        value={editavelItem?.funcao_nome || ''}
                        onChange={(e) => {
                          const novoValor = e.target.value
                          setEditaveis((prev) =>
                            prev.map((el) =>
                              el.id === item.id
                                ? { ...el, funcao_nome: novoValor }
                                : el
                            )
                          )
                        }}
                      />
                    ) : estaEditando ? (
                      <input
                        type="text"
                        value={editavelItem?.funcao_nome || ''}
                        onChange={(e) => {
                          const novoValor = e.target.value
                          setEditaveis((prev) =>
                            prev.map((el) =>
                              el.id === item.id
                                ? { ...el, funcao_nome: novoValor }
                                : el
                            )
                          )
                        }}
                        onBlur={() => {
                          const editItem = editaveis.find((el) => el.id === item.id)
                          if (editItem) onSalvarEdicao(editItem)
                        }}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      item.funcao_nome
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-2 flex gap-3">
                    {!modoEdicaoMultipla && (
                      <>
                        <button
                          onClick={() => onEdit(item.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                          type="button"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir"
                          type="button"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </td>

                  {/* Checkbox seleção */}
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selecionados.includes(item.id)}
                      onChange={() => toggleSelecionado(item.id)}
                      className="accent-green-600 w-5 h-5 rounded"
                      disabled={modoEdicaoMultipla} // opcional: desabilita checkbox no modo edição múltipla
                    />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
