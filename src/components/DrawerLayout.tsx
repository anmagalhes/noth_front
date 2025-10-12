"use client";

import { useEffect } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";

interface DrawerLayoutProps {
  isOpen: boolean;
  closeDrawer: () => void;
}

const DrawerLayout = ({ isOpen, closeDrawer }: DrawerLayoutProps) => {
  // Evitar rolagem e mudar fundo quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.backgroundColor = "#1F2937";
    } else {
      document.body.style.overflow = "";
      document.body.style.backgroundColor = "";
    }
    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = "";
      document.body.style.backgroundColor = "";
    };
  }, [isOpen]);

  // Não renderiza nada se fechado
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-50 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Northcromo</h2>
          <button onClick={closeDrawer} aria-label="Fechar menu" className="text-white">
            <MdClose size={24} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex flex-col gap-4">
          <Link href="/" onClick={closeDrawer} className="hover:bg-green-700 p-2 rounded">
            Início
          </Link>
          <Link href="/recebimento" onClick={closeDrawer} className="hover:bg-green-700 p-2 rounded">
            Recebimento
          </Link>
          <Link href="/configuracoes" onClick={closeDrawer} className="hover:bg-green-700 p-2 rounded">
            Configurações
          </Link>
        </nav>
      </div>
    </>
  );
};

export default DrawerLayout;
