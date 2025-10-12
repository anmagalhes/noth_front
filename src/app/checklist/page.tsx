'use client'

import React, { useState, useMemo, useEffect } from 'react'
import ChecklistForm from '@/components/checklist/ChecklistForm'
import ChecklistTable from '@/components/checklist/ChecklistTable'
import ModalNotificacao from '@/components/ModalNotificacao'
import RecebimentoSearchContainer from '@/components/checklist/RecebimentoSearchContainer'
import useChecklistWS from '@/hooks/useChecklistWS'
import axios from 'axios'
import { Checklist } from '@/types/checklist'
import 'react-datepicker/dist/react-datepicker.css'

export default function ChecklistPage() {
  // 🧾 Estados principais
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [comPdfFilter, setComPdfFilter] = useState<'true' | 'false' | 'all'>('false')
  const [recebimentoIdFilter, setRecebimentoIdFilter] = useState<string>('')

  const { checklistsQuery } = useChecklistWS(page, limit, comPdfFilter)
  const checklists = useMemo(() => checklistsQuery.data?.data || [], [checklistsQuery.data])

  // 🧾 Formulário
  const [recebimentoIdForm, setRecebimentoIdForm] = useState<string>('')
  const [descricao, setDescricao] = useState('')
  const [temPdf, setTemPdf] = useState(false)

  // 📦 Estados auxiliares
  const [erro, setErro] = useState<string>('')
  const [modalVisivel, setModalVisivel] = useState(false)
  const [tituloNotificacao, setTituloNotificacao] = useState('')
  const [mensagemNotificacao, setMensagemNotificacao] = useState('')
  const [loading, setLoading] = useState(false)

  const [selecionados, setSelecionados] = useState<number[]>([])
  const [idEditar, setIdEditar] = useState<number | null>(null)
  const [modoEdicaoMultipla, setModoEdicaoMultipla] = useState(false)
  const [editaveis, setEditaveis] = useState<Checklist[]>([])

  // 📌 Recebimentos Options iniciais
  const [recebimentosOptions, setRecebimentosOptions] = useState<{ id: string; os_formatado: string }[]>([])

  useEffect(() => {
    const mapa = new Map<string, string>()
    checklists.forEach(c => {
      const id = String(c.recebimento_id)
      const os = c.recebimento?.os_formatado || ''
      if (id && os && !mapa.has(id)) {
        mapa.set(id, os)
      }
    })
    setRecebimentosOptions(Array.from(mapa, ([id, os_formatado]) => ({ id, os_formatado })))
  }, [checklists])

  // ✅ Filtros aplicados
  const checklistsFiltrados = useMemo(() => {
    if (recebimentoIdFilter) {
      return checklists.filter(c => String(c.recebimento_id) === recebimentoIdFilter)
    }
    return checklists
  }, [checklists, recebimentoIdFilter])

  const todosSelecionados =
    selecionados.length === checklistsFiltrados.length && checklistsFiltrados.length > 0

  // ✅ Manipulação do formulário
  const limparCampos = () => {
    setRecebimentoIdForm('')
    setDescricao('')
    setTemPdf(false)
    setErro('')
  }

  const mostrarNotificacao = (titulo: string, mensagem: string) => {
    setTituloNotificacao(titulo)
    setMensagemNotificacao(mensagem)
    setModalVisivel(true)
  }

  const handleEnviar = async () => {
    if (!recebimentoIdForm || !descricao) {
      setErro('Preencha todos os campos')
      return
    }
    setLoading(true)
    setErro('')
    try {
      await axios.post('http://localhost:8000/api/checklist', {
        recebimento_id: recebimentoIdForm,
        descricao,
        tem_pdf: temPdf,
      })
      limparCampos()
      mostrarNotificacao('Sucesso', 'Checklist cadastrado com sucesso!')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErro(err.response?.data?.message || 'Erro ao salvar checklist')
      } else {
        setErro('Erro inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdicionarRecebimento = (novo: { id: string; os_formatado: string }) => {
    setRecebimentosOptions(prev => [...prev, novo])
  }

  const handleEdit = (item: Checklist) => {
    setIdEditar(item.id)
    setEditaveis([item])
    setModoEdicaoMultipla(false)
    setSelecionados([])
    setErro('')
  }

  const handleSalvarEdicao = async (editado: Checklist) => {
    setLoading(true)
    setErro('')
    try {
      await axios.put(`http://localhost:8000/api/checklist/${editado.id}`, editado)
      setIdEditar(null)
      setEditaveis([])
      mostrarNotificacao('Sucesso', 'Checklist editado com sucesso!')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErro(err.response?.data?.message || 'Erro ao salvar edição')
      } else {
        setErro('Erro inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelarEdicao = () => {
    setIdEditar(null)
    setEditaveis([])
    setErro('')
  }

  const handleDelete = async (id: number) => {
    setErro('')
    try {
      await axios.delete(`http://localhost:8000/api/checklist/${id}`)
      mostrarNotificacao('Sucesso', 'Checklist excluído com sucesso!')
    } catch (err: unknown) {
      setErro('Erro ao excluir checklist')
    }
  }

  const excluirChecklistEmMassa = async (ids: number[]) => {
    setErro('')
    try {
      await Promise.all(ids.map(id => axios.delete(`http://localhost:8000/api/checklist/${id}`)))
      setSelecionados([])
      setModoEdicaoMultipla(false)
      mostrarNotificacao('Sucesso', 'Checklists excluídos com sucesso!')
    } catch {
      setErro('Erro ao excluir checklists')
    }
  }

  const handleEditarEmMassa = async (itensEditados: Checklist[]) => {
    setLoading(true)
    setErro('')
    try {
      await Promise.all(itensEditados.map(item =>
        axios.put(`http://localhost:8000/api/checklist/${item.id}`, item)
      ))
      setSelecionados([])
      setModoEdicaoMultipla(false)
      setEditaveis([])
      mostrarNotificacao('Sucesso', 'Checklists editados com sucesso!')
    } catch {
      setErro('Erro ao editar checklists em massa')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelecionado = (id: number) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      setSelecionados([])
    } else {
      setSelecionados(checklistsFiltrados.map(c => c.id))
    }
  }

  const renderPageButtons = () => {
    if (!checklistsQuery.data) return null
    const totalPages = checklistsQuery.data.pages
    const maxButtons = 7
    let startPage = Math.max(page - 3, 1)
    const endPage = Math.min(startPage + maxButtons - 1, totalPages)
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(endPage - maxButtons + 1, 1)
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
      const num = startPage + i
      return (
        <button
          key={num}
          onClick={() => setPage(num)}
          className={`px-3 py-1 rounded border font-medium transition ${
            num === page
              ? 'bg-green-600 text-white'
              : 'bg-white hover:bg-green-100 text-gray-700'
          }`}
        >
          {num}
        </button>
      )
    })
  }

  return (
    <div className="min-h-screen bg-slate-100 w-screen">
      <div className="w-full py-6">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Cadastro de Checklist
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full max-w-[98%] min-h-[90vh] space-y-6">

          {/* Formulário */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Filtros</h2>

            {/* Remova ou comente esta parte */}
            {/* <ChecklistForm
              recebimentoId={recebimentoIdForm}
              setRecebimentoId={setRecebimentoIdForm}
              loading={loading}
              onSave={handleEnviar}
              recebimentosOptions={recebimentosOptions}
            /> */}

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <label className="mr-2 font-medium">Filtro PDF:</label>
              <select
                className="border px-2 py-1 rounded"
                value={comPdfFilter}
                onChange={e => {
                  setComPdfFilter(e.target.value as 'true' | 'false' | 'all')
                  setPage(1)
                  setErro('')
                }}
              >
                <option value="all">Todos</option>
                <option value="true">Com PDF</option>
                <option value="false">Sem PDF</option>
              </select>
            </div>

            <div>
              <label className="mr-2 font-medium">Filtro Recebimento:</label>
              <select
                className="border px-2 py-1 rounded"
                value={recebimentoIdFilter}
                onChange={e => {
                  setRecebimentoIdFilter(e.target.value)
                  setPage(1)
                  setErro('')
                }}
              >
                <option value="">Todos</option>
                {recebimentosOptions.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.os_formatado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mr-2 font-medium">Itens por página:</label>
              <select
                className="border px-2 py-1 rounded"
                value={limit}
                onChange={e => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                  setErro('')
                }}
              >
                {[1, 5, 10, 20].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>


        <div className="border rounded-md p-4 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Relatório</h2>

        {/* Tabela */}
          <ChecklistTable
            checklists={checklistsFiltrados.map(item => ({
              ...item,
              recebimento_id:
                item.recebimento_id !== null && item.recebimento_id !== undefined
                  ? String(item.recebimento_id)
                  : '',
            }))}
            loading={loading || checklistsQuery.isLoading}
            selecionados={selecionados}
            toggleSelecionado={toggleSelecionado}
            toggleSelecionarTodos={toggleSelecionarTodos}
            todosSelecionados={todosSelecionados}
            idEditar={idEditar}
            modoEdicaoMultipla={modoEdicaoMultipla}
            setModoEdicaoMultipla={setModoEdicaoMultipla}
            editaveis={editaveis}
            setEditaveis={setEditaveis}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSalvarEdicao={handleSalvarEdicao}
            onCancelarEdicao={handleCancelarEdicao}
            onDeleteEmMassa={excluirChecklistEmMassa}
            onEditarEmMassa={handleEditarEmMassa}
          />

          {/* Paginação */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className={`flex items-center gap-1 px-3 py-1 rounded border transition ${
                page === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-green-100 text-gray-800'
              }`}
            >
              <span>⬅️</span>
              <span>Anterior</span>
            </button>

            {renderPageButtons()}

            <button
              onClick={() =>
                setPage(prev =>
                  checklistsQuery.data && prev < checklistsQuery.data.pages ? prev + 1 : prev
                )
              }
              disabled={checklistsQuery.data && page >= checklistsQuery.data.pages}
              className={`flex items-center gap-1 px-3 py-1 rounded border transition ${
                checklistsQuery.data && page >= checklistsQuery.data.pages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-green-100 text-gray-800'
              }`}
            >
              <span>Próxima</span>
              <span>➡️</span>
            </button>
          </div>

          {/* Modal de notificação */}
          <ModalNotificacao
            visivel={modalVisivel}
            onFechar={() => setModalVisivel(false)}
            titulo={tituloNotificacao}
            mensagem={mensagemNotificacao}
          />
        </div>
      </div>
    </div>
  </div>
  )
}
