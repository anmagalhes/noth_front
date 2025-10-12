import React, { useState, useEffect } from 'react'
import axios from 'axios'

type Recebimento = {
  id: string | number
  os_formatado: string
}

type Props = {
  onAddRecebimento: (recebimento: Recebimento) => Promise<void> // async
  recebimentosOptions: Recebimento[]
}

const RecebimentoSearchContainer: React.FC<Props> = ({ onAddRecebimento, recebimentosOptions }) => {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Recebimento[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Formata o input para o padrão AAAA-AA enquanto digita
  const formatOsInput = (value: string) => {
    const onlyAlnum = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const part1 = onlyAlnum.substring(0, 4)
    const part2 = onlyAlnum.substring(4, 6)
    return part2.length > 0 ? `${part1}-${part2}` : part1
  }

  // Validação exata do padrão AAAA-AA
  const isValidOsFormatado = (value: string) => {
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{2}$/
    return pattern.test(value)
  }

  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([])
      setErro('')
      return
    }

    if (!isValidOsFormatado(input)) {
      setSuggestions([])
      setErro('Formato inválido. Use o padrão AAAA-AA')
      return
    } else {
      setErro('')
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await axios.get(
          `http://localhost:8000/api/recebimentos?os_formatado=${encodeURIComponent(input.toLowerCase())}`
        )
        const recebimentos = response.data as Recebimento[]
        setSuggestions(recebimentos)
      } catch {
        setErro('Erro ao buscar recebimentos')
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [input])

  // handleSelect agora é async e aguarda onAddRecebimento
  const handleSelect = async (recebimento: Recebimento) => {
    const jaExiste = recebimentosOptions.some(r => r.os_formatado === recebimento.os_formatado)
    if (!jaExiste) {
      try {
        await onAddRecebimento(recebimento) // espera o async do pai
        setInput('')
        setSuggestions([])
        setErro('')
      } catch {
        setErro('Erro ao adicionar recebimento')
      }
    } else {
      setErro('Recebimento já está na lista')
    }
  }

  return (
    <div className="border p-4 rounded bg-white shadow-sm space-y-2 relative max-w-md">
      <h3 className="text-lg font-semibold text-gray-700">Nº de Controle</h3>
      <input
        type="text"
        className="border px-3 py-1 rounded w-full"
        placeholder="Digite OS (ex: 0001-25)"
        value={input}
        onChange={e => {
          const formatted = formatOsInput(e.target.value)
          setInput(formatted)
        }}
        maxLength={7}
      />
      {loading && <p className="text-gray-500 text-sm">Buscando...</p>}
      {erro && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded">{erro}</div>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-40 overflow-auto rounded mt-1">
          {suggestions.map(r => (
            <li
              key={r.id}
              className="px-3 py-2 hover:bg-green-100 cursor-pointer"
              onClick={() => handleSelect(r)}
            >
              {r.os_formatado}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RecebimentoSearchContainer
