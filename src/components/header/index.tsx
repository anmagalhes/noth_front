"use client";

import { IoMenu } from "react-icons/io5";

const Header: React.FC<{ openDrawer: () => void }> = ({ openDrawer }) => {
  return (
    <header className="w-full flex items-center justify-between bg-white shadow-md px-4 py-2 sm:py-3">
      {/* Botão do menu hamburger */}
      <button
        onClick={openDrawer}
        className="w-10 h-10 flex justify-center items-center rounded-full bg-white sm:w-12 sm:h-12"
        aria-label="Abrir Menu"
      >
        <IoMenu size={24} className="text-gray-800" />
      </button>

      {/* Nome da empresa centralizado, verde, e com altura reduzida */}
      <h1 className="flex-grow text-center text-green-600 font-bold text-lg sm:text-xl select-none leading-tight">
        NORTHCROMO - CONTROLE DE SISTEMA INTERNO
      </h1>

      {/* Espaço vazio para balancear layout */}
      <div className="w-10 h-10 sm:w-12 sm:h-12" />
    </header>
  );
};

export default Header;
