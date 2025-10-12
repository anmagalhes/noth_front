import { useState } from 'react';
import Image from 'next/image';

interface Foto {
  id: string;
  uri: string;
  base64: string;
}

interface Props {
  nomeCliente: string;
  numeroOrdem: string;
  onAddFoto: (fotos: Foto[]) => void;
}

const gerarNomeFoto = (
  ordemIndex: number,
  nomeCliente: string,
  numeroOrdem: string
): string => {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = String(hoje.getFullYear()).slice(-2);
  const nomeFormatado = nomeCliente.replace(/\s/g, '');
  return `foto_Ordem${numeroOrdem}_${nomeFormatado}_${dia}-${mes}-${ano}_${ordemIndex + 1}.jpg`;
};

export default function FotoPicker({ nomeCliente, numeroOrdem, onAddFoto }: Props) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [fotoTemp, setFotoTemp] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Função para escolher a foto
  const handleFotoEscolher = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && fotos.length < 4) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const novaFoto: Foto = {
          id: gerarNomeFoto(fotos.length, nomeCliente, numeroOrdem), // usa a função pra gerar id/nome
          uri: base64,
          base64,
        };
        const novasFotos = [...fotos, novaFoto];
        setFotos(novasFotos);
        onAddFoto(novasFotos);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Você atingiu o limite de 4 fotos ou não selecionou nenhuma imagem.');
    }
  };

  // Função para remover uma foto
  const handleRemoverFoto = (id: string) => {
    setFotos(fotos.filter((foto) => foto.id !== id));
  };

  // Função para abrir a foto no modal
  const openModal = (uri: string) => {
    setFotoTemp(uri);
    setModalVisible(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setModalVisible(false);
    setFotoTemp(null);
  };

  return (
    <div className="foto-picker">
      <label>Fotos (até 4)</label>
      <div className="fotos-container">
        {fotos.map((foto) => (
          <div key={foto.id} className="foto-item">
            <Image
              src={foto.uri}
              alt={`Foto ${foto.id}`}
              className="foto-imagem"
              width={96}
              height={96}
              onClick={() => openModal(foto.uri)}
              style={{ cursor: 'pointer', borderRadius: '0.375rem', objectFit: 'cover' }}
            />
            <button onClick={() => handleRemoverFoto(foto.id)} className="remover-foto">
              X
            </button>
          </div>
        ))}
        {fotos.length < 4 && (
          <div className="opcoes-foto">
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoEscolher}
              className="input-foto"
              id="input-foto"
            />
            <button
              onClick={() => document.getElementById('input-foto')?.click()}
              className="tirar-foto"
            >
              Escolher Foto
            </button>
          </div>
        )}
        {fotos.length === 4 && (
          <span className="limite-fotos">Você atingiu o limite de 4 fotos</span>
        )}
      </div>
      {modalVisible && fotoTemp && (
        <div className="modal">
          <div className="overlay" onClick={closeModal}></div>
          <div className="modal-content">
            <Image
              src={fotoTemp}
              alt="Foto ampliada"
              className="foto-ampliada"
              width={320}
              height={320}
              style={{ objectFit: 'contain' }}
            />
            <button onClick={closeModal} className="fechar-modal">
              Fechar
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        .foto-picker {
          margin-bottom: 1.5rem;
        }
        .fotos-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .foto-item {
          position: relative;
          width: 6rem;
          height: 6rem;
        }
        .remover-foto {
          position: absolute;
          top: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .opcoes-foto {
          display: flex;
          gap: 1rem;
        }
        .input-foto {
          display: none;
        }
        .tirar-foto {
          background-color: #e2e8f0;
          border: none;
          border-radius: 0.375rem;
          padding: 0.5rem;
          cursor: pointer;
        }
        .limite-fotos {
          font-size: 0.875rem;
          color: #e53e3e;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.5);
        }
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          cursor: pointer;
        }
        .modal-content {
          position: relative;
          background-color: white;
          padding: 1rem;
          border-radius: 0.375rem;
        }
        .fechar-modal {
          position: absolute;
          top: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .foto-item {
            width: 4rem;
            height: 4rem;
          }
          .foto-ampliada {
            width: 15rem;
            height: 15rem;
          }
        }
      `}</style>
    </div>
  );
}
