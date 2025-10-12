// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20 bg-gray-50 text-gray-900">
      {/* Logo */}
      <Image
        src="/logo-northcromo.svg"
        alt="Logo da Northcromo"
        width={180}
        height={50}
        priority
      />

      {/* Título e descrição */}
      <main className="mt-10 text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
          Bem-vindo à Northcromo
        </h1>
        <p className="text-gray-700 text-base sm:text-lg max-w-xl mx-auto">
          Sistema controle de ordem manutenção e acompanhamento PCP
        </p>
      </main>

      {/* Botões de ação */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/recebimento"
          aria-label="Criar nova ordem de serviço"
          className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 transition text-center"
        >
          Nova Ordem de Serviço
        </Link>
        <Link
          href="/veiculos"
          aria-label="Ver veículos"
          className="border border-gray-300 px-6 py-3 rounded hover:bg-gray-100 transition text-center"
        >
          Ver Veículos
        </Link>
      </div>
    </div>
  );
}
