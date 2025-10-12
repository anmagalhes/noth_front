"use client";
import { useState } from "react";
import {
  FiMenu,
  FiHome,
  FiTruck,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiTool,
  FiCode,
} from "react-icons/fi";
import Link from "next/link";
import { AiOutlineFileSearch } from "react-icons/ai";

// Tipagem dos itens do menu
type MenuItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  subItems?: MenuItem[];
};

// Dados do menu
const menuItems: MenuItem[] = [
  {
    label: "Cadastro",
    icon: <FiHome />,
    subItems: [
      { label: "Usuario", href: "/usuario" },
      { label: "Grupo Responsável", href: "/funcao" },
      { label: "Funcionario", href: "/funcionario" },
      { label: "Vendedor", href: "/vendedor" },
      { label: "Setor", href: "/setor" },
      { label: "Serviço", href: "/servico" },
      { label: "Tarefas",href: "/produto_tarefa" },
      { label: "Produto", href: "/produto" },
      { label: "Posto Trabalho", href: "/posto_trabalho" },
      { label: "Operação", href: "/operacao" },
      { label: "Defeitos", href: "/defeito" },
      { label: "Componente", href: "/componente" },
    ],
  },
  { label: "Recebimento",
    href: "/recebimento",
    icon: <FiTruck />
  },
  {
    label: "Desmontagem",
    href: "/desmontagem",
    icon: <FiTool />,
    subItems: [
      { label: "Checklist", href: "/checklist" },
    ]
  },
    {
    label: "Programação",
    href: "/programacao",
    icon: <FiCode />, // Ícone representando código/programação
    subItems: [
       { label: "Apontamento Tarefas", href: "/novatarefas_aprontamento" },
       //{ label: "", href: "/nova" },
      //{ label: "Ordens", href: "/programacao/ordens" },
    ]
  },
    {
      label: "Laudo Técnico",
      href: "/laudo-tecnico",
      icon: <AiOutlineFileSearch />,  // ou <AiOutlineFileSearch /> ou <MdAssignment />
      subItems: [
         { label: "Checklist", href: "/checklist" },
      ]
    },

  { label: "Configurações", href: "/configuracoes", icon: <FiSettings /> },
];

// Componente de link do menu
function SidebarLink({
  href,
  icon,
  label,
  onClick,
  nested = false,
}: {
  href: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  nested?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${
        nested ? "pl-6 text-sm" : ""
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// Componente Sidebar principal
export default function Sidebar({
  setExpanded,
}: {
  setExpanded: (val: boolean) => void;
}) {
  const [open, setOpen] = useState(false); // mobile
  const [expanded, _setExpanded] = useState(true); // desktop
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleExpand = () => {
    const newValue = !expanded;
    _setExpanded(newValue);
    setExpanded(newValue);
  };

  return (
    <>
      {/* Botão Mobile (menu flutuante) */}
      <button
        className="p-2 fixed top-6 left-6 z-50 bg-green-600 text-white rounded-full shadow sm:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Abrir menu"
      >
        <FiMenu size={20} />
      </button>

      {/* Drawer Mobile */}
      {open && (
        <aside className="fixed top-0 left-0 w-2/3 h-full bg-white shadow-lg p-6 z-40 sm:hidden flex flex-col gap-4 overflow-y-auto">
          {menuItems.map((item) =>
            item.subItems ? (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className="flex items-center gap-2 p-2 w-full rounded hover:bg-gray-100"
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {openSubmenus[item.label] ? <FiChevronDown /> : <FiChevronRight />}
                </button>
                {openSubmenus[item.label] &&
                  item.subItems.map((sub) => (
                    <SidebarLink
                      key={sub.href}
                      href={sub.href!}
                      label={sub.label}
                      onClick={() => setOpen(false)}
                      nested
                    />
                  ))}
              </div>
            ) : (
              <SidebarLink
                key={item.href}
                href={item.href!}
                icon={item.icon}
                label={item.label}
                onClick={() => setOpen(false)}
              />
            )
          )}
        </aside>
      )}

      {/* Sidebar Desktop */}
      <div
        className={`${
          expanded ? "w-64" : "w-20"
        } hidden sm:block h-full bg-white shadow-lg p-4 fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out overflow-y-auto`}
      >
        {/* Botão de expandir/recolher */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleExpand}
            className="bg-green-600 text-white p-2 rounded-full shadow"
            aria-label="Expandir/Recolher menu"
          >
            {expanded ? <FiChevronLeft /> : <FiMenu />}
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) =>
            item.subItems ? (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-100"
                >
                  {item.icon}
                  {expanded && <span>{item.label}</span>}
                  {expanded &&
                    (openSubmenus[item.label] ? (
                      <FiChevronDown className="ml-auto" />
                    ) : (
                      <FiChevronRight className="ml-auto" />
                    ))}
                </button>
                {openSubmenus[item.label] &&
                  item.subItems.map((sub) => (
                    <SidebarLink
                      key={sub.href}
                      href={sub.href!}
                      label={sub.label}
                      nested
                    />
                  ))}
              </div>
            ) : (
              <SidebarLink
                key={item.href}
                href={item.href!}
                icon={item.icon}
                label={expanded ? item.label : ""}
              />
            )
          )}
        </nav>
      </div>
    </>
  );
}
