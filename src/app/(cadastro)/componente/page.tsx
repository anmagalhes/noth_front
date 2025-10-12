'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ComponenteForm from '@/components/componente/ComponenteForm'
import ComponenteTable from '@/components/componente/ComponenteTable'
import useComponentesWS from '@/hooks/useComponentesWS'
import { ComponenteItem } from '@/types/componente'

// Função simples para substituir alert por toast (troque pela sua lib preferida)
const toast = (msg: string) => {
  // Exemplo básico, você pode usar react-toastify, radix, etc.
  console.log('Toast:', msg)
  alert(msg)
}

export default function ComponentePage() {
  const router = useRouter()
  const { componentesQuery } = useComponentesWS()

  // Lista de componentes memorizada para evitar re-renderizações desnecessárias
  const listaComponentes = useMemo(() => componentesQuery.data || [], [componentesQuery.data])

  // Estados
  const [idEditar, setIdEditar] = useState<number | null>(null)
  const [nomeEditar, setNomeEditar] = useState('')
  const [selecionados, setSelecionados] = useState<number[]>([])
  const [modoEdicaoMultipla, setModoEdicaoMultipla] = useState(false)
  const [editaveis, setEditaveis] = useState<ComponenteItem[]>([])
  const [loadingSalvar, setLoadingSalvar] = useState(false)
  const [loadingDeletar, setLoadingDeletar] = useState(false)
  const [loadingLote, setLoadingLote] = useState(false)

  const baseURL = 'http://localhost:8000/api'

  // Atualiza os editáveis quando entra no modo edição múltipla
  useEffect(() => {
    if (modoEdicaoMultipla) {
      const selecionadosEditaveis = listaComponentes.filter(c => selecionados.includes(c.id))
      setEditaveis(selecionadosEditaveis)
    } else {
      setEditaveis([])
    }
  }, [modoEdicaoMultipla, selecionados, listaComponentes])

  // Funções memoizadas para performance
  const salvarComponente = useCallback(async (nome: string) => {
    setLoadingSalvar(true)
    const corpo = {
      componente_nome: nome,
      data_recebimento: new Date().toISOString(),
    }

    try {
      const metodo = idEditar ? 'PUT' : 'POST'
      const url = idEditar ? `${baseURL}/componente/${idEditar}` : `${baseURL}/componente`

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      })

      const data = await res.json()

      if (res.ok) {
        toast(idEditar ? 'Componente atualizado!' : 'Componente adicionado!')
        setIdEditar(null)
        setNomeEditar('')
      } else {
        toast(data.detail || 'Erro ao salvar.')
      }
    } catch {
      toast('Erro de conexão.')
    } finally {
      setLoadingSalvar(false)
    }
  }, [idEditar])

  const deletarComponente = useCallback(async (id: number) => {
    if (!confirm('Deseja realmente excluir este componente?')) return

    setLoadingDeletar(true)
    try {
      const res = await fetch(`${baseURL}/componente/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast('Componente excluído.')
      setSelecionados(prev => prev.filter(x => x !== id))
    } catch {
      toast('Erro ao excluir.')
    } finally {
      setLoadingDeletar(false)
    }
  }, [])

  const deletarSelecionados = useCallback(async () => {
    if (selecionados.length === 0) {
      toast('Nenhum componente selecionado.')
      return
    }

    if (!confirm(`Deseja excluir ${selecionados.length} componente(s)?`)) return

    setLoadingLote(true)
    try {
      // Executa deletes em paralelo para otimizar
      await Promise.all(selecionados.map(id => fetch(`${baseURL}/componente/${id}`, { method: 'DELETE' })))
      toast('Componentes selecionados excluídos com sucesso.')
      setSelecionados([])
    } catch {
      toast('Erro ao excluir componentes selecionados.')
    } finally {
      setLoadingLote(false)
    }
  }, [selecionados])

  const atualizarEmLote = useCallback(async () => {
    setLoadingLote(true)
    try {
      // Atualiza componentes editáveis em paralelo
      await Promise.all(editaveis.map(item => fetch(`${baseURL}/componente/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })))

      toast('Componentes atualizados com sucesso.')
      setModoEdicaoMultipla(false)
      setSelecionados([])
      setEditaveis([])
    } catch {
      toast('Erro ao atualizar componentes.')
    } finally {
      setLoadingLote(false)
    }
  }, [editaveis])

  const editarComponente = useCallback((item: ComponenteItem) => {
    setIdEditar(item.id)
    setNomeEditar(item.componente_nome)
  }, [])

  const cancelarEdicao = useCallback(() => {
    setIdEditar(null)
    setNomeEditar('')
  }, [])

  const toggleSelecionado = useCallback((id: number) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])

  const toggleSelecionarTodos = useCallback(() => {
    setSelecionados(prev =>
      prev.length === listaComponentes.length
        ? []
        : listaComponentes.map(item => item.id)
    )
  }, [listaComponentes])

  const salvarEdicao = useCallback(async (itemEditado: ComponenteItem) => {
    try {
      const res = await fetch(`${baseURL}/componente/${itemEditado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemEditado),
      })
      if (!res.ok) {
        const data = await res.json()
        toast(data.detail || 'Erro ao salvar edição.')
      } else {
        toast('Componente atualizado automaticamente.')
      }
    } catch {
      toast('Erro de conexão ao salvar edição.')
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 m-0 p-0 w-screen">
      <div className="w-full py-6">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Cadastro de Componentes
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full max-w-[98%] min-h-[90vh] space-y-3">

          {/* Formulário */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Formulário</h2>

            <ComponenteForm
              componenteId={idEditar ? String(idEditar) : undefined}
              componenteNome={nomeEditar}
              onSave={salvarComponente}
              onCancel={idEditar ? cancelarEdicao : undefined}
              loading={loadingSalvar}
            />
          </div>

          {/* Ações múltiplas */}
          {selecionados.length > 0 && !modoEdicaoMultipla && (
            <div className="border rounded-md p-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Ações em Lote</h2>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => setModoEdicaoMultipla(true)}
                  disabled={loadingLote}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Editar Selecionados ({selecionados.length})
                </button>
                <button
                  onClick={deletarSelecionados}
                  disabled={loadingLote}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
                >
                  Excluir Selecionados ({selecionados.length})
                </button>
              </div>
            </div>
          )}

          {/* Tabela */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Lista de Componentes</h2>

            <ComponenteTable
              componentes={listaComponentes}
              onEdit={editarComponente}
              onDelete={deletarComponente}
              selecionados={selecionados}
              toggleSelecionado={toggleSelecionado}
              toggleSelecionarTodos={toggleSelecionarTodos}
              todosSelecionados={selecionados.length === listaComponentes.length}
              idEditar={idEditar}
              modoEdicaoMultipla={modoEdicaoMultipla}
              editaveis={editaveis}
              setEditaveis={setEditaveis}
              onSalvarMultiplos={atualizarEmLote}
              onCancelarMultiplos={() => {
                setModoEdicaoMultipla(false)
                setEditaveis([])
              }}
              onSalvarEdicao={salvarEdicao}
              loadingDeletar={loadingDeletar}
              loadingLote={loadingLote}
            />
          </div>

          {/* Botão de voltar */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => router.push('/')}
              className="border border-gray-300 hover:bg-gray-100 rounded-md py-3 px-6 font-semibold"
            >
              Voltar
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
