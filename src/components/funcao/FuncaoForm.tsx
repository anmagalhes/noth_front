// src/app/components/componente/FuncaoForm.tsx

import React, { useState, useEffect } from 'react';

interface FuncaoFormProps {
  funcaoId?: number;
  nomeInicial?: string;
  onSave: (nome: string, dataCadastro: string) => void;
  onCancel?: () => void;
}

export default function FuncaoForm({
  funcaoId,
  nomeInicial = '',
  onSave,
  onCancel,
}: FuncaoFormProps) {
  const [nome, setNome] = useState(nomeInicial);
  const [erroNome, setErroNome] = useState<string | null>(null);

  useEffect(() => {
    setNome(nomeInicial);
  }, [nomeInicial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErroNome('Nome do cargo é obrigatório');
      return;
    }

    setErroNome(null);

    // Cria data atual no formato ISO (exemplo: '2025-06-21T15:20:30.000Z')
    const dataCadastro = new Date().toISOString();

    onSave(nome.trim().toUpperCase(), dataCadastro);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6">
      <input
        type="text"
        value={funcaoId ?? ''}
        disabled
        placeholder="ID"
        className="sm:col-span-3 w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-center"
      />

      <div className="sm:col-span-6">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do Cargo"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {erroNome && <p className="text-red-500 text-sm mt-1">{erroNome}</p>}
      </div>

      <div className="sm:col-span-3 flex gap-2">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition w-full"
        >
          {funcaoId ? 'Atualizar' : 'Adicionar'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition w-full"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
