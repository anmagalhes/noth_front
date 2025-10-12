// components/BotaoAcao.tsx
import { ReactNode } from 'react'

interface BotaoAcaoProps {
  label: string
  cor: 'azul' | 'vermelho' | 'verde' | 'cinza'
  icone: ReactNode
  onPress: () => void
}

export default function BotaoAcao({ label, cor, icone, onPress }: BotaoAcaoProps) {
  const cores = {
    azul: 'bg-blue-600 hover:bg-blue-700',
    vermelho: 'bg-red-600 hover:bg-red-700',
    verde: 'bg-green-600 hover:bg-green-700',
    cinza: 'bg-gray-600 hover:bg-gray-700'
  }

  return (
    <button
      onClick={onPress}
      className={`flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-md transition ${cores[cor]}`}
    >
      {icone}
      {label}
    </button>
  )
}
