'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiEdit, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import ModalNotificacao from '@/components/ModalNotificacao'
import ProdutoInput from '@/components/produto/ProdutoInput'
import ProdutoModal from '@/components/produto/ProdutoModal'
import BotaoAcao from '@/components/botao/BotaoAcao'
import CameraComponent from '@/components/camera/CameraComponent'
import axios from 'axios'
import { useRef } from 'react';
import { useCallback } from 'react';
import type { Cliente } from '@/types/cliente'

import { getDataHoraSaoPaulo } from '../../../utils/DataHora'

import useProdutosWS from '@/hooks/useProdutosWS'
import useClientes from '@/hooks/useClientes'
import { isMobile, isIOS } from 'react-device-detect'


type ClienteFormatado = {
  id: number
  nome: string
}

export default function Recebimento() {
  const router = useRouter()


const inputFileRef = useRef<HTMLInputElement>(null)
const [isClient, setIsClient] = useState(false)
const [cameraSuportada, setCameraSuportada] = useState(true);


  // ===== ESTADOS DA CÂMERA =====
  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [tipoCamera, setTipoCamera] = useState<'user' | 'environment'>('environment')
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [cameraTentativas, setCameraTentativas] = useState(0);


  // ===== ESTADOS DO PWA =====
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [pwaInstalled, setPwaInstalled] = useState(false)


  // ===== ESTADOS DO FORMULÁRIO =====
 // const ordemOriginalRef = useRef<string | null>(null);
  const [tipoOrdem, setTipoOrdem] = useState<'NOVO' | 'NAO'>('NOVO')
  const [numeroControle, setNumeroControle] = useState('')

   //Ordem nova
  //const [ordemBase, setOrdemBase] = useState<string | null>(null)
 //const [numeroOrdem, setNumeroOrdem] = useState('');
  const [numeroOrdemFormatado, setNumeroOrdemFormatado] = useState('');

  const [dataRecebimento, setDataRecebimento] = useState('')
  const [horaRecebimento, setHoraRecebimento] = useState('')

  const [quantidade, setQuantidade] = useState('1')
  const [referencia, setReferencia] = useState("N/A");
  const [nfRemessa, setNfRemessa] = useState("N/A");
  const [observacao, setObservacao] = useState("N/A");

  // Fotos: armazenar array de arquivos
  const [fotos, setFotos] = useState<File[]>([])

  // Produto selecionado
  const [codigoProduto, setCodigoProduto] = useState('')
  const [nomeProduto, setNomeProduto] = useState('')
  const [produtoModalVisivel, setProdutoModalVisivel] = useState(false)

  // Modal notificação
  const [modalVisivel, setModalVisivel] = useState(false)
  const [tituloNotificacao, setTituloNotificacao] = useState('')
  const [mensagemNotificacao, setMensagemNotificacao] = useState('')
  const [numeroControleOriginal, setNumeroControleOriginal] = useState<string | null>(null);


  // Loading e erro para envio
  const [loading, setLoading] = useState(false)

  // Produtos e clientes mockados
  const { produtosQuery } = useProdutosWS();


  // Campo ativo para estilo
  const [campoAtivo, setCampoAtivo] = useState('')

  const [ordemNovoOriginal, setOrdemNovoOriginal] = useState<string | null>(null)


// Mapeia os dados para manter a mesma estrutura esperada
const produtos = (produtosQuery.data || []).map(prod => ({
  codigo: prod.cod_produto,   // ou prod.codigoProduto, se esse for o nome real
  nome: prod.produto_nome,       // ou prod.descricao/nomeProduto
}));


const { clientes } = useClientes()
const [clienteId, setClienteId] = useState<number | null>(null)
const [clienteNome, setClienteNome] = useState('')
const [mostrarListaClientes, setMostrarListaClientes] = useState(false)


const clientesFormatados = (clientes || []).map((cliente: Cliente) => ({
  id: Number(cliente.id),   // depende do que vem no hook
  nome: cliente.nome_cliente,
}));

 // ===== EFEITOS INICIAIS =====
  // ===== EFEITOS INICIAIS =====
  useEffect(() => {
    setIsClient(true)

    // Polyfill para Android antigo
  if (typeof window !== 'undefined') {

 }
    const checkPWAInstalled = () => {
      const isInstalled =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      setPwaInstalled(isInstalled)
    }

    checkPWAInstalled()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])


useEffect(() => {
   setIsClient(true)
  console.log('Clientes carregados:', clientes)
}, [clientes])

  // Setar data e hora na montagem
  useEffect(() => {
    const { data, hora } = getDataHoraSaoPaulo()
    setDataRecebimento(data)
    setHoraRecebimento(hora)
  }, [])

  // Selecionar produto do modal
  const handleProdutoSelecionado = (indice: number) => {
    const produtoSelecionado = produtos[indice]
    if (!produtoSelecionado) {
      console.warn('Produto não encontrado no índice:', indice)
      return
    }
    setCodigoProduto(produtoSelecionado.codigo)
    setNomeProduto(produtoSelecionado.nome)
    setProdutoModalVisivel(false)
  }

  // Adicionar fotos selecionadas (input file)
  const handleAddFotos = (files: FileList | null) => {
  if (!files) return
  const arquivos = Array.from(files)

  setFotos(prev => {
    if (prev.length + arquivos.length > 4) {
      alert('Você só pode adicionar até 4 fotos.')
      return prev
    }
    return [...prev, ...arquivos]
  })
}

const handleCapture = (file: File) => {
    setFotos(prev => {
      if (prev.length >= 4) {
        alert('Você só pode adicionar até 4 fotos.');
        return prev;
      }
      return [...prev, file];
    });
  };

  const handleCameraError = (error: string | null) => {
    if (error) {
      console.error('Erro detalhado na câmera:', {
        error,
        userAgent: navigator.userAgent,
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!navigator.mediaDevices?.getUserMedia,
        maxTouchPoints: navigator.maxTouchPoints,
        platform: navigator.platform
      });
    }

  // Tratamento especial para dispositivos não suportados
  if (error && (error.includes('não suporta') || error.includes('não implementado'))) {
    setCameraSuportada(false);
  }
};

useEffect(() => {
  // Polyfill global para Android muito antigo
  if (typeof window !== 'undefined') {
    if (!navigator.mediaDevices) {
      (navigator as any).mediaDevices = {};
    }

    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        return new Promise((resolve, reject) => {
          const getUserMedia =
            (navigator as any).webkitGetUserMedia ||
            (navigator as any).mozGetUserMedia;

          if (!getUserMedia) {
            return reject(new Error('getUserMedia não implementado'));
          }

          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
  }
}, []);

  // Função para enviar fotos e dados
    const enviarFotos = async () => {
      if (fotos.length === 0) {
        alert('Você precisa adicionar pelo menos uma foto.')
        return
      }
      setLoading(true)

      const formData = new FormData()
      formData.append('cliente', clienteId?.toString() ?? '');
      formData.append('numero_ordem', numeroControle)

      fotos.forEach((foto) => {
        formData.append('fotos', foto)
      })

      try {
        const response = await axios.post('http://localhost:8000/api/adicionarOrdem', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.status === 200) {
          const fileLinks = response.data.file_links
          console.log('Links das fotos:', fileLinks)

          // Espera salvar os links antes de seguir
          await salvarLinksFotosNaOrdem(numeroControle, fileLinks)
          alert('Fotos enviadas com sucesso!')

          // Resetar input de fotos e estado
          setFotos([])
          if (inputFileRef.current) {
            inputFileRef.current.value = '' // <-- limpa o input visualmente
          }

          setClienteId(null);
          setClienteNome('');
          setQuantidade('1');
          setCodigoProduto('');
          setNomeProduto('');
          setReferencia('N/A');
          setNfRemessa('N/A');
          setObservacao('N/A');

        // ✅ Resetar a página (refrescar componentes do App Router)
        router.refresh()

        } else {
          alert('Erro ao enviar as fotos');
        }
      } catch (error) {
        console.error('Erro ao enviar fotos:', error);
        alert('Erro ao enviar as fotos');
      } finally {
        setLoading(false);
      }
    };


  const salvarLinksFotosNaOrdem = async (numeroOrdem: string, linksFotos: string[]) => {
    try {
      const linksLimitados = linksFotos.slice(0, 4)

      const dadosAdicionais = {
        cliente_id: clienteId,
        tipoOrdem,
        numero_ordem: tipoOrdem === 'NOVO' ? numeroOrdemFormatado :'0',
        os_formatado: numeroOrdem,
        quantidade: Number(quantidade),
        referencia,
        nfRemessa,
        queixa_cliente: observacao,
        dataRecebimento,
        horaRecebimento,
        foto1: linksLimitados[0] || null,
        foto2: linksLimitados[1] || null,
        foto3: linksLimitados[2] || null,
        foto4: linksLimitados[3] || null,
      }

    console.log('Dados que serão enviados:', dadosAdicionais);

      const response = await axios.post('http://localhost:8000/api/salvarLinksFotos', dadosAdicionais)

      if (response.status === 200) {
        console.log('Links das fotos e dados adicionais salvos com sucesso!')
        alert('Links das fotos e dados salvos com sucesso!')
        setNumeroControleOriginal(null);
        setOrdemNovoOriginal(null);
        await fetchNumeroOrdem(true);
        router.refresh();

      } else {
        alert('Erro ao salvar os links das fotos e dados')
      }
    } catch (error) {
      console.error('Erro ao salvar os links das fotos e dados adicionais:', error)
      alert('Erro ao salvar os links')
    }
  }

  const handleNotificacao = (titulo: string, mensagem: string) => {
    setTituloNotificacao(titulo)
    setMensagemNotificacao(mensagem)
    setModalVisivel(true)
  }
const fetchNumeroOrdem = useCallback(async (forcarNovoNumero = false) => {
  try {
    const response = await fetch('http://localhost:8000/api/ordemnova');
    const data = await response.json();
    console.log('Número retornado pela API:', data);

    if (typeof data === 'number') {
      const ordemFormatada = data.toString().padStart(4, '0');
      const proxima = String(Number(ordemFormatada)).padStart(4, '0');
      const anoAtual = new Date().getFullYear().toString().slice(-2);
      const numeroCompleto = `${proxima}-${anoAtual}`;

      if (tipoOrdem === 'NOVO') {
        if (forcarNovoNumero || (!numeroControleOriginal && !ordemNovoOriginal)) {
          setNumeroControle(numeroCompleto);
          setNumeroControleOriginal(numeroCompleto);
          setOrdemNovoOriginal(proxima);
          setNumeroOrdemFormatado(proxima);
          console.log('✅ Número gerado:', numeroCompleto);
        } else {
          setNumeroControle(numeroControleOriginal!);
          setNumeroOrdemFormatado(ordemNovoOriginal!);
          console.log('♻️ Número reutilizado:', numeroControleOriginal);
        }
      }

      if (tipoOrdem === 'NAO') {
        setNumeroControle('');
        setNumeroOrdemFormatado('');
      }
    } else {
      console.error('Número de ordem inesperado:', data);
    }
  } catch (error) {
    console.error('Erro ao buscar número de ordem:', error);
  }
}, [tipoOrdem, numeroControleOriginal, ordemNovoOriginal]);

useEffect(() => {
  fetchNumeroOrdem();
}, [tipoOrdem, fetchNumeroOrdem]);

   // Instalar PWA
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
        setPwaInstalled(true);
      }
    }
  };


  return (
    <div className="min-h-screen bg-slate-100 m-0 p-0 w-screen">

       {/* Botão de instalação PWA */}
      {showInstallButton && !pwaInstalled && isClient && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleInstallClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-2"
          >
            <span>Instalar App</span>
          </button>
        </div>
      )}

      <div className="w-full py-6">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Cadastro de Nova Ordem
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mx-auto w-full max-w-[98%] min-h-[90vh] space-y-3">

          {/* Seção 1: Tipo de Ordem + Número + Data/Hora */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados da Ordem</h2>

            <div className="flex justify-center mb-6 gap-4 flex-wrap">
              {['NOVO', 'NAO'].map(tipo => (
                <button
                  key={tipo}
                  onClick={() => setTipoOrdem(tipo as 'NOVO' | 'NAO')}
                  className={`px-4 py-2 rounded-full transition-colors min-w-[100px] text-center ${
                    tipoOrdem === tipo
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Controle</label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded-mdbg-white
                     ${campoAtivo === 'numeroControle' ? 'ring-2 ring-blue-400 border-blue-400' : 'border-gray-300'
                  }`}
                  value={numeroControle}
                  onChange={e => setNumeroControle(e.target.value.toUpperCase())}
                  onFocus={() => setCampoAtivo('numeroControle')}
                  onBlur={() => setCampoAtivo('')}
                  placeholder="Número da ordem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Recebimento</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  value={dataRecebimento}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora Recebimento</label>
                <input
                  type="text"
                  className="w-32 p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  value={horaRecebimento}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Cliente + Produto + Referência + Quantidade */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Cliente e Produto</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <div className="relative">
                  <button
                    onClick={() => setMostrarListaClientes(!mostrarListaClientes)}
                    className="flex justify-between items-center w-full p-2 border border-gray-300 rounded-md bg-white"
                    type="button"
                  >
                     <span className={clienteNome ? 'text-gray-800' : 'text-gray-400'}>
                      {clienteNome || 'Selecione um cliente'}
                    </span>
                    {mostrarListaClientes ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                 {mostrarListaClientes && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                     {clientesFormatados.map((cliente: ClienteFormatado) => (
                      <button
                        key={cliente.id}
                        className={`block w-full text-left p-2 hover:bg-gray-100 ${
                          clienteId === cliente.id ? 'bg-green-50' : ''
                        }`}
                        onClick={() => {
                          setClienteId(cliente.id)
                          setClienteNome(cliente.nome)
                          setMostrarListaClientes(false)
                        }}
                        type="button"
                      >
                        {cliente.nome}
                      </button>
                    ))}
                  </div>
                )}
                </div>
              </div>

              {/* Produto (usando seu componente customizado) */}
              <div className="sm:col-span-2">
                <ProdutoInput
                  produtos={produtos}
                  codigoProduto={codigoProduto}
                  setCodigoProduto={setCodigoProduto}
                  nomeProduto={nomeProduto}
                  setNomeProduto={setNomeProduto}
                  abrirModal={() => setProdutoModalVisivel(true)}
                />
                <ProdutoModal
                  aberto={produtoModalVisivel}
                  onClose={() => setProdutoModalVisivel(false)}
                  produtos={produtos}
                  onSelect={handleProdutoSelecionado}
                />
              </div>

              {/* Referência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referência do Produto</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={referencia}
                  onChange={e => setReferencia(e.target.value)}
                />
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={quantidade}
                  onChange={e => setQuantidade(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Seção 3: NF + Observações */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Detalhes Adicionais</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NF Remessa</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={nfRemessa}
                  onChange={e => setNfRemessa(e.target.value.toUpperCase())}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>
          </div>

          {/* Seção 4: Upload de fotos com duas opções teste*/}
           {/* Seção 4: Câmera e Fotos */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Fotos (máximo 4)</h2>

          {/* Componente de Câmera */}
                  <CameraComponent
                    onCapture={handleCapture}
                    onCameraError={handleCameraError}
                    onCameraStatusChange={(isActive) => {
                    console.log('Status câmera:', isActive);
                    // Atualize o estado se a câmera não for suportada
                    if (!isActive) setCameraSuportada(false);
                  }}
                />

            {/* Upload tradicional (opcional) */}
            <input
              /*ref={inputFileRef} */
              type="file"
              accept="image/*"
              capture="environment" // Usa a câmera traseira quando disponível
              multiple
              onChange={e => handleAddFotos(e.target.files)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-700 file:text-white
                hover:file:bg-green-800
                cursor-pointer"
            />

            {/* Pré-visualização das fotos */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {fotos.map((foto, idx) => {
                const url = URL.createObjectURL(foto)
                return (
                  <div
                    key={idx}
                    className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-300 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => setFotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700"
                      title="Remover foto"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Seção 5: Botões de ação */}
          <div className="flex flex-wrap gap-4 mt-4">
            <button
              onClick={enviarFotos}
              disabled={loading}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-md disabled:opacity-60 transition"
            >
              {loading ? 'Enviando...' : 'Enviar Ordem Servico'}
            </button>

            <BotaoAcao
              label="Editar"
              cor="azul"
              icone={<FiEdit size={18} />}
              onPress={() => handleNotificacao('Editar', 'Você está editando esta ordem.')}
            />

            <BotaoAcao
              label="Deletar"
              cor="vermelho"
              icone={<FiTrash2 size={18} />}
              onPress={() => handleNotificacao('Excluir', 'Você está prestes a excluir uma ordem.')}
            />

            <button
              onClick={() => router.push('/')}
              className="flex-1 border border-gray-300 hover:bg-gray-100 rounded-md py-3 font-semibold"
            >
              Voltar
            </button>
          </div>
        </div>

        <ModalNotificacao
          visivel={modalVisivel}
          onFechar={() => setModalVisivel(false)}
          titulo={tituloNotificacao}
          mensagem={mensagemNotificacao}
        />
      </div>
    </div>
  )
}
