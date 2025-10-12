// components/camera/CameraComponent.tsx
'use client'

import 'webrtc-adapter';
import { useRef, useState, useCallback, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

interface CameraComponentProps {
  onCapture: (file: File) => void;
  onCameraError: (error: string | null) => void;
  onCameraStatusChange: (isActive: boolean) => void;
}

export default function CameraComponent({
  onCapture,
  onCameraError,
  onCameraStatusChange
}: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [tipoCamera, setTipoCamera] = useState<'user' | 'environment'>('environment');
  const [carregando, setCarregando] = useState(false);
  const [cameraSuportada, setCameraSuportada] = useState(true);

  // Verificar suporte à API de câmera de forma segura
  useEffect(() => {
    const checkCameraSupport = () => {
      try {
        // Verificação correta sem acessar prototype diretamente
        const isSupported = !!(
          navigator.mediaDevices &&
          typeof navigator.mediaDevices.getUserMedia === 'function' &&
          'srcObject' in HTMLVideoElement.prototype
        );

        setCameraSuportada(isSupported);
        if (!isSupported) {
          const errorMsg = 'Seu dispositivo não suporta acesso à câmera. Use o botão abaixo para adicionar fotos.';
          setCameraError(errorMsg);
          onCameraError(errorMsg);
        }
      } catch (error) {
        console.error('Erro ao verificar suporte à câmera:', error);
        setCameraSuportada(false);
        const errorMsg = 'Erro ao verificar suporte à câmera.';
        setCameraError(errorMsg);
        onCameraError(errorMsg);
      }
    };

    // Verificar apenas no cliente
    if (typeof window !== 'undefined') {
      checkCameraSupport();
    }
  }, [onCameraError]);

  // Propagate camera status changes to parent
  useEffect(() => {
    onCameraStatusChange(cameraAtiva);
  }, [cameraAtiva, onCameraStatusChange]);

  // Propagate errors to parent - apenas quando houver erro real
  useEffect(() => {
    if (cameraError !== null) {
      onCameraError(cameraError);
    }
  }, [cameraError, onCameraError]);

  // Cleanup resources on unmount
  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      pararCamera();
    };
  }, []);

  const iniciarCamera = useCallback(async () => {
    if (!cameraSuportada) {
      setCameraError('A câmera não é suportada neste dispositivo.');
      return;
    }

    setCarregando(true);
    setCameraError(null);

    try {
      // Limpar stream anterior se existir
      if (mediaStreamRef.current) {
        pararCamera();
      }

      // Configurações simplificadas para maior compatibilidade
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: tipoCamera,
          ...(isMobile ? {} : {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 15 }
          })
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        if ('srcObject' in videoRef.current) {
          videoRef.current.srcObject = stream;
        } else {
          (videoRef.current as any).srcObject = stream;
        }
        setCameraAtiva(true);

        const tryPlayVideo = () => {
          if (!videoRef.current) return;

          videoRef.current.play().catch(error => {
            console.error('Falha ao iniciar vídeo:', error);

            setTimeout(() => {
              videoRef.current?.play().catch(e => {
                console.error('Tentativa secundária falhou:', e);
                setCarregando(false);
                setCameraError('Falha ao iniciar o vídeo da câmera');
              });
            }, 300);
          });
        };

        videoRef.current.onloadedmetadata = tryPlayVideo;

        playTimeoutRef.current = setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 1) {
            tryPlayVideo();
          } else {
            setCarregando(false);
            setCameraError('O vídeo não carregou dentro do tempo esperado.');
          }
        }, 5000);  // <-- Certifique-se que esse } fecha o setTimeout

      } // <-- Fecha o if (videoRef.current)

    } catch (err: any) {
      console.error('Erro na câmera:', err);
      setCarregando(false);


  const errorMap: Record<string, string> = {
        'NotAllowedError': 'Permissão de câmera negada. Habilite nas configurações do navegador.',
        'NotFoundError': 'Nenhuma câmera encontrada.',
        'OverconstrainedError': 'Configuração solicitada não suportada. Tente trocar de câmera.',
        'NotReadableError': 'Câmera já em uso por outro aplicativo.',
        'AbortError': 'Acesso à câmera foi abortado.',
        'SecurityError': 'Acesso à câmera bloqueado por questões de segurança.',
        'TypeError': 'Tipo de mídia inválido.'
      };

      let errorMsg = errorMap[err.name] || `Erro técnico: ${err.message || 'Tente novamente'}`;

      // Tratamento especial para Android antigo
      if (isMobile && !errorMap[err.name]) {
        errorMsg = 'Erro ao acessar a câmera. Tente: 1) Reiniciar o navegador; 2) Atualizar o sistema; 3) Usar outro navegador (Chrome).';
      }

      setCameraError(errorMsg);
      setCameraAtiva(false);
    }
  }, [tipoCamera, cameraSuportada]);

  const pararCamera = useCallback(() => {
    setCarregando(false);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      if ('srcObject' in videoRef.current) {
        videoRef.current.srcObject = null;
      } else {
        // Fallback para navegadores antigos
        (videoRef.current as any).src = '';
      }
      videoRef.current.onloadedmetadata = null;
    }
    setCameraAtiva(false);
  }, []);

  const alternarCamera = useCallback(() => {
    pararCamera();
    setTipoCamera(prev => prev === 'user' ? 'environment' : 'user');
    iniciarCamera();
  }, [pararCamera, iniciarCamera]);

  const tirarFoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0) return;

    // Correção de orientação para mobile
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;

    if (isMobile && isPortrait) {
      canvas.width = video.videoHeight;
      canvas.height = video.videoWidth;
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(Math.PI / 2);
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      context.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob(blob => {
      if (blob) {
        onCapture(new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' }));
      }
    }, 'image/jpeg', 0.80); // Reduzir qualidade para compatibilidade
  }, [onCapture]);

  // Se a câmera não for suportada, mostrar mensagem
  if (!cameraSuportada) {
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-700">
          Seu dispositivo não suporta acesso à câmera. Use o botão abaixo para adicionar fotos.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={cameraAtiva ? pararCamera : iniciarCamera}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          disabled={carregando}
        >
          {carregando ? (
            <span>Carregando câmera...</span>
          ) : cameraAtiva ? (
            'Desativar Câmera'
          ) : (
            'Ativar Câmera'
          )}
        </button>

        {cameraAtiva && (
          <>
            <button
              onClick={alternarCamera}
              className="px-4 py-2 bg-purple-600 text-white rounded-md"
            >
              {tipoCamera === 'user' ? 'Câmera Traseira' : 'Câmera Frontal'}
            </button>

            <button
              onClick={tirarFoto}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Capturar Foto
            </button>
          </>
        )}
      </div>

      {/* Mensagens de status */}
      {!cameraAtiva && !carregando && (
        <div className="mb-4 p-4 bg-gray-100 rounded-md text-center">
          <p>Clique em "Ativar Câmera" para iniciar a visualização</p>
        </div>
      )}

      {cameraError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-700 whitespace-pre-line">
            {cameraError}
            <div className="mt-3">
              <button
                onClick={() => {
                  setCameraError(null);
                  iniciarCamera();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Tentar Novamente
              </button>

              {isMobile && (
                <button
                  onClick={() => {
                    setTipoCamera(tipoCamera === 'user' ? 'environment' : 'user');
                    setCameraError(null);
                    iniciarCamera();
                  }}
                  className="ml-2 px-4 py-2 bg-orange-600 text-white rounded-md"
                >
                  Tentar {tipoCamera === 'user' ? 'Câmera Traseira' : 'Câmera Frontal'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Área de preview */}
      <div className="relative mb-4 min-h-[200px] bg-black rounded-md flex items-center justify-center">
        {carregando && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-md z-10">
            <div className="text-white text-lg">Iniciando câmera...</div>
          </div>
        )}

        {!cameraAtiva && !carregando && !cameraError && (
          <div className="text-white p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p>Câmera desativada</p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-auto max-h-[70vh] object-contain ${cameraAtiva ? 'block' : 'hidden'}`}
          onCanPlay={() => setCarregando(false)}
          onError={() => setCameraError('Falha ao carregar transmissão de vídeo')}
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
