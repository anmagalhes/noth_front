'use client';

import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

interface Produto {
  codigo: string;
  nome: string;
}

interface ProdutoInputProps {
  produtos: Produto[];
  codigoProduto: string;
  setCodigoProduto: (codigo: string) => void;
  nomeProduto: string;
  setNomeProduto: (nome: string) => void;
  abrirModal: () => void;
}

export default function ProdutoInput({
  produtos,
  codigoProduto,
  setCodigoProduto,
  nomeProduto,
  setNomeProduto,
  abrirModal,
}: ProdutoInputProps) {
  const [query, setQuery] = useState('');
  const [sugestoes, setSugestoes] = useState<Produto[]>([]);

  useEffect(() => {
    if (!query) {
      setSugestoes([]);
      return;
    }

    const filtrados = produtos.filter(
      (p) =>
        p.codigo.toLowerCase().includes(query.toLowerCase()) ||
        p.nome.toLowerCase().includes(query.toLowerCase())
    );

    setSugestoes(filtrados);
  }, [query, produtos]);

  const selecionarProduto = (produto: Produto) => {
    setCodigoProduto(produto.codigo);
    setNomeProduto(produto.nome);
    setQuery('');
    setSugestoes([]);
  };

  return (
    <div className="mb-6 w-full max-w-xl">
      {/* Código do Produto */}
      <label className="text-gray-700 mb-1 block">Código do Produto</label>
      <div className="flex items-center border border-gray-300 rounded px-3 py-2 w-full">
        <input
          className="flex-1 mr-2 outline-none w-full"
          type="text"
          placeholder="Digite código ou nome"
          value={query || codigoProduto}
          onChange={(e) => {
            setQuery(e.target.value);
            setCodigoProduto(e.target.value);
          }}
        />
        <button type="button" onClick={abrirModal}>
          <FiSearch size={20} color="#555" />
        </button>
      </div>

      {/* Sugestões */}
      {sugestoes.length > 0 && (
        <div className="border border-gray-300 rounded mt-1 bg-white shadow-md max-h-[160px] overflow-y-auto w-full">
          {sugestoes.map((item) => (
            <button
              key={item.codigo}
              className="w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-100"
              onClick={() => selecionarProduto(item)}
            >
              {item.codigo} - {item.nome}
            </button>
          ))}
        </div>
      )}

      {/* Nome do Produto */}
      <label className="text-gray-700 mt-4 mb-1 block">Nome do Produto</label>
      <input
        className="border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-700 w-full"
        type="text"
        value={nomeProduto}
        readOnly
      />
    </div>
  );
}
