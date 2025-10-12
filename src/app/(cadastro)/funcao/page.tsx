'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FuncaoForm from '@/components/funcao/FuncaoForm'
import FuncaoTable from '@/components/funcao/FuncaoTable'
import ModalNotificacao from '@/components/ModalNotificacao'
import { Funcao } from '@/types/funcao'

export default function FuncoesPage() {
  const [editando, setEditando] = useState<Funcao | null>(null)
  const queryClient = useQueryClient()
  const [modalVisivel, setModalVisivel] = useState(false)
  const [tituloNotificacao, setTituloNotificacao] = useState('')
  const [mensagemNotificacao, setMensagemNotificacao] = useState('')

  // Estados para seleção e edição múltipla
  const [selecionados, setSelecionados] = useState<number[]>([])
  const [todosSelecionados, setTodosSelecionados] = useState(false)
  const [idEditar, setIdEditar] = useState<number | null>(null)
  const [modoEdicaoMultipla, setModoEdicaoMultipla] = useState(false)
  const [editaveis, setEditaveis] = useState<Funcao[]>([])

  // Busca funções
  const { data: funcoes = [], isLoading } = useQuery<Funcao[]>({
    queryKey: ['funcoes'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8000/api/funcoes')
      return res.data
    },
  })

  // Atualiza lista de editaveis quando entra no modo edição múltipla ou selecionados mudam
  useEffect(() => {
  if (modoEdicaoMultipla) {
    const selecionadasParaEditar = funcoes.filter(f => selecionados.includes(f.id))
    setEditaveis(selecionadasParaEditar)
  } else {
    if (editaveis.length > 0) {
      setEditaveis([])
    }
    if (selecionados.length > 0) {
      setSelecionados([])
    }
    if (todosSelecionados) {
      setTodosSelecionados(false)
    }
  }
}, [modoEdicaoMultipla, selecionados, funcoes, editaveis.length, todosSelecionados])


  // Mutação para criar ou atualizar função
  const salvarFuncao = useMutation<
    void,
    unknown,
    { nome: string; dataCadastro: string; editando: Funcao | null }
  >({
    mutationFn: async ({ nome, dataCadastro, editando }) => {
      if (editando) {
        await axios.put(`http://localhost:8000/api/funcoes/${editando.id}`, { funcao_nome: nome })
      } else {
        await axios.post('http://localhost:8000/api/funcoes', {
          funcao_nome: nome,
          data_cadastro: dataCadastro,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcoes'] })
      setEditando(null)
      setTituloNotificacao('Sucesso')
      setMensagemNotificacao('Função salva com sucesso!')
      setModalVisivel(true)
    },
    onError: () => {
      setTituloNotificacao('Erro')
      setMensagemNotificacao('Falha ao salvar função.')
      setModalVisivel(true)
    },
  })

  // Mutação para deletar função
  const deletarFuncao = useMutation<void, unknown, number>({
    mutationFn: async (id: number) => {
      await axios.delete(`http://localhost:8000/api/funcoes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcoes'] })
      setTituloNotificacao('Sucesso')
      setMensagemNotificacao('Função deletada com sucesso!')
      setModalVisivel(true)
    },
    onError: () => {
      setTituloNotificacao('Erro')
      setMensagemNotificacao('Falha ao deletar função.')
      setModalVisivel(true)
    },
  })

  // Toggle seleção individual
  function toggleSelecionado(id: number) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Toggle seleção geral
  function toggleSelecionarTodos() {
    if (todosSelecionados) {
      setSelecionados([])
      setTodosSelecionados(false)
    } else {
      setSelecionados(funcoes.map((f) => f.id))
      setTodosSelecionados(true)
    }
  }

  // Edita um item (recebe só o ID)
  function onEdit(id: number) {
    const item = funcoes.find(f => f.id === id)
    if (item) {
      setEditando(item)
      setIdEditar(item.id)
    }
  }

  // Deleta um item
  function onDelete(id: number) {
    deletarFuncao.mutate(id)
  }

  // Salvar edição individual
  function onSalvarEdicao(item: Funcao) {
    setEditando(item)
    salvarFuncao.mutate({
      nome: item.funcao_nome,
      dataCadastro: item.data_cadastro,
      editando: item,
    })
    setIdEditar(null) // resetar edição individual
  }

  // Cancelar edição individual
  function onCancelarEdicao() {
    setEditando(null)
    setIdEditar(null)
  }

  // Deletar em massa
  function onDeleteEmMassa(ids: number[]) {
    ids.forEach((id) => deletarFuncao.mutate(id))
    setSelecionados([])
    setTodosSelecionados(false)
  }

  // Salvar edição em massa
  function onEditarEmMassa(editaveis: Funcao[]) {
    editaveis.forEach((item) => {
      salvarFuncao.mutate({
        nome: item.funcao_nome,
        dataCadastro: item.data_cadastro,
        editando: item,
      })
    })
    setModoEdicaoMultipla(false)
    setEditaveis([])
    setSelecionados([])
  }

  if (isLoading) {
    return <p className="text-center py-6">Carregando funções...</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6 text-center">Cadastro de Funções</h1>

      <FuncaoForm
        funcaoId={editando?.id}
        nomeInicial={editando?.funcao_nome || ''}
        onSave={(nome, dataCadastro) =>
          salvarFuncao.mutate({ nome, dataCadastro, editando })
        }
        onCancel={() => setEditando(null)}
      />

      {selecionados.length > 0 && !modoEdicaoMultipla && (
        <button
          onClick={() => setModoEdicaoMultipla(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
        >
          Editar Selecionados ({selecionados.length})
        </button>
      )}

      {modoEdicaoMultipla && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onEditarEmMassa(editaveis)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Salvar Edição Múltipla ({editaveis.length})
          </button>
          <button
            onClick={() => {
              setModoEdicaoMultipla(false)
              setEditaveis([])
              setSelecionados([])
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar Edição Múltipla
          </button>
        </div>
      )}

      <FuncaoTable
        funcoes={funcoes}
        selecionados={selecionados}
        toggleSelecionado={toggleSelecionado}
        toggleSelecionarTodos={toggleSelecionarTodos}
        todosSelecionados={todosSelecionados}
        idEditar={idEditar}
        modoEdicaoMultipla={modoEdicaoMultipla}
        editaveis={editaveis}
        setEditaveis={setEditaveis}
        onEdit={onEdit}
        onDelete={onDelete}
        onSalvarEdicao={onSalvarEdicao}
        onCancelarEdicao={onCancelarEdicao}
        grupos={[]} // opcional
        onDeleteEmMassa={onDeleteEmMassa}
        onEditarEmMassa={onEditarEmMassa}
      />

      <ModalNotificacao
        visivel={modalVisivel}
        onFechar={() => setModalVisivel(false)}
        titulo={tituloNotificacao}
        mensagem={mensagemNotificacao}
      />
    </div>
  )
}
