import React, { useState } from 'react';
import { MdCloudDownload } from 'react-icons/md';
import { FaPrint, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

type ButtonGerarPDFsProps = {
  tipo: 'com_pdf' | 'sem_pdf';
  selecionados: number[];
  checklists: {
    id: number;
    recebimento_id: string;
    descricao: string;
    tem_pdf: boolean;

    // Campos derivados do recebimento
    recebimento: {
      os_formatado: string;
      nome_cliente: string;
      produto_nome: string;
      quantidade: number;
    };
  }[];
  onGenerate?: () => void;
};

const ButtonGerarPDFs: React.FC<ButtonGerarPDFsProps> = ({
  tipo,
  selecionados,
  checklists,
  onGenerate,
}) => {
  const [pdfLinks, setPdfLinks] = useState<{ id: number; url: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  /** Invalida todas as variações da lista de checklists e revalida Server Components (se houver) */
  const refreshChecklist = async () => {
    await queryClient.invalidateQueries({ queryKey: ['checklists'], exact: false });
    // Opcional: se sua página tem SSR/Server Components:
    try {
      router.refresh();
    } catch {}
  };

  /** Aguarda o fim da impressão/fechamento do popup (com timeout de segurança) */
  const waitForPrintEnd = (win: Window): Promise<void> =>
    new Promise((resolve) => {
      let resolved = false;

      const done = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve();
        }
      };

      const onAfterPrint = () => done();
      const onBeforeUnload = () => done();

      let interval: ReturnType<typeof setInterval> | null = setInterval(() => {
        if (win.closed) {
          done();
        }
      }, 300);

      const cleanup = () => {
        if (interval) clearInterval(interval);
        interval = null;
        try {
          // Alguns navegadores suportam afterprint no popup
          win.removeEventListener('afterprint', onAfterPrint as any);
          win.removeEventListener('beforeunload', onBeforeUnload as any);
        } catch {}
      };

      try {
        win.addEventListener('afterprint', onAfterPrint as any);
        win.addEventListener('beforeunload', onBeforeUnload as any);
      } catch {}

      // Fallback: se nada disparar em 30s, seguimos em frente
      setTimeout(done, 30_000);
    });

  const handleClick = async () => {
    if (selecionados.length === 0) return;

    setLoading(true);
    const linksGerados: { id: number; url: string }[] = [];

    const checklistsFiltrados = checklists.filter(
      (c) => selecionados.includes(c.id) && (tipo === 'com_pdf' ? c.tem_pdf : !c.tem_pdf)
    );

    console.log(`📄 Iniciando geração de PDFs (${tipo}):`, checklistsFiltrados);

    try {
      if (tipo === 'sem_pdf') {
        for (const checklist of checklistsFiltrados) {
          try {
            // LEVAR OS DADOS PARA O BACKEND ( CHECKLIST)
            const params = new URLSearchParams({
              cl: checklist.recebimento.nome_cliente,
              doc_cl: 'checklist.doc_cl',
              produto: checklist.recebimento.os_formatado,
              qtd: String(checklist.recebimento.quantidade),
              orcamento: 'checklist.orcamento',
              o: 'checklist.o',
              a: 'checklist.a',
              b: 'checklist.b',
            });

            console.log('🔗 Parâmetros da URL:', params.toString());

            const res = await axios.get(
              `http://localhost:8000/api/checklist/${checklist.recebimento_id}?${params.toString()}`
            );

            const url = res.data?.link_pdf;
            if (url) {
              linksGerados.push({ id: checklist.id, url });
              console.log(`✅ PDF gerado: ${url}`);
            } else {
              console.warn(`⚠️ Resposta sem link_pdf para ${checklist.recebimento_id}`);
            }
          } catch (err) {
            console.error(`❌ Erro ao gerar PDF para ${checklist.recebimento_id}:`, err);
          }
        }
      } else {
        // Simula PDFs já existentes
        for (const checklist of checklistsFiltrados) {
          linksGerados.push({
            id: checklist.id,
            url: `http://localhost:8000/storage/pdfs/${checklist.recebimento_id}.pdf`,
          });
        }
      }

      setPdfLinks(linksGerados);

      // ❌ NÃO atualizamos aqui — só depois que o usuário mandar imprimir.
      onGenerate?.();
    } finally {
      setLoading(false);
    }
  };

  /** Agora atualizamos a lista SÓ após o usuário mandar imprimir */
  const imprimir = async (url: string) => {
    const win = window.open(url, '_blank');
    if (win) {
      // Ao carregar, dispara a impressão
      win.onload = () => {
        try {
          win.print();
        } catch {}
      };

      // Aguarda o fim da impressão/fechamento
      await waitForPrintEnd(win);

      // ✅ Agora sim, atualiza a lista
      await refreshChecklist();
    } else {
      alert('Não foi possível abrir o PDF. Verifique se o bloqueador de pop-ups está ativo.');
    }
  };

  const imprimirTodos = async () => {
    // Abre/Imprime sequencialmente e espera cada um terminar
    for (let i = 0; i < pdfLinks.length; i++) {
      const link = pdfLinks[i];
      const win = window.open(link.url, '_blank');
      if (win) {
        await new Promise<void>((resolve) => {
          // Dispara print ao carregar
          win.onload = () => {
            try {
              win.print();
            } catch {}
            // Pequeno atraso para browsers que não disparam 'afterprint' corretamente
            setTimeout(resolve, 500);
          };
          // Fallbacks:
          win.addEventListener('afterprint', () => resolve());
          const id = setInterval(() => {
            if (win.closed) {
              clearInterval(id);
              resolve();
            }
          }, 300);
          // Timeout de segurança por item
          setTimeout(() => resolve(), 30_000);
        });
      }
    }

    // ✅ Atualiza a lista UMA VEZ ao final
    await refreshChecklist();
  };

  const idsString = pdfLinks.map((l) => l.id).join(',');

  const imprimirDireto = async (url: string) => {
    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
      win.onload = () => {
        try {
          win.print();
        } catch {}
        setTimeout(() => {
          try {
            win.close();
          } catch {}
        }, 2000);
      };

      // Espera finalização e atualiza
      await waitForPrintEnd(win);
      await refreshChecklist();
    } else {
      alert('Não foi possível abrir o PDF. Verifique se o bloqueador de pop-ups está ativo.');
    }
  };

  return (
    <div className="my-2 w-full">
      <button
        onClick={handleClick}
        disabled={loading || selecionados.length === 0}
        className="flex items-center justify-center
          bg-green-600 text-white rounded px-4 py-2 gap-2
          hover:bg-green-700 disabled:bg-green-300
          disabled:cursor-not-allowed transition-colors duration-300
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        "
      >
        <MdCloudDownload className="text-xl" />
        {loading ? 'GERANDO...' : `GERAR PDFs (${tipo === 'com_pdf' ? 'com PDF' : 'sem PDF'})`}
      </button>

      {pdfLinks.length > 0 && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow-sm">
          <p className="font-semibold text-sm mb-2">PDFs Gerados:</p>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {pdfLinks.map((link, index) => (
              <li
                key={index}
                className="flex justify-between items-center text-sm border-b pb-1"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  📄 PDF do checklist #{link.id}
                </a>
                <div className="flex gap-3">
                  <button
                    onClick={async () => await imprimir(link.url)} // ⬅️ agora async
                    title="Imprimir"
                    className="text-green-600 hover:text-green-800"
                  >
                    <FaPrint />
                  </button>
                  <a
                    href={link.url}
                    download
                    className="text-blue-600 hover:text-blue-800"
                    title="Baixar"
                  >
                    <FaDownload />
                  </a>
                </div>
              </li>
            ))}
          </ul>

          {/* Imprimir todos */}
          <button
            onClick={imprimirTodos} // ⬅️ atualiza ao final
            className="mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
          >
            🖨️ Imprimir Todos
          </button>

          {/* Baixar todos em ZIP (opcional, ative se sua API permitir) */}
          {/* <a
            href={`http://localhost:8000/api/zip-pdfs?ids=${idsString}`}
            download
            className="ml-4 inline-block text-white bg-blue-700 px-4 py-2 rounded hover:bg-blue-800 text-sm"
          >
            📦 Baixar Todos (ZIP)
          </a> */}
        </div>
      )}
    </div>
  );
};

export default ButtonGerarPDFs;
