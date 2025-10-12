import React from 'react';

const ProdutoInput = ({
  codigoProduto,
  setCodigoProduto,
  nomeProduto,
  setNomeProduto,
  abrirModal
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
            Código do Produto
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              id="codigo"
              value={codigoProduto}
              onChange={(e) => setCodigoProduto(e.target.value)}
              className="block w-full pr-10 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              placeholder="Digite o código"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={abrirModal}
            className="h-[34px] inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Buscar
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome do Produto
        </label>
        <input
          type="text"
          id="nome"
          value={nomeProduto}
          onChange={(e) => setNomeProduto(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Nome do produto"
          readOnly
        />
      </div>
    </div>
  );
};

export default ProdutoInput;
