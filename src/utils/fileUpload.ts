import axios, { AxiosResponse } from 'axios';

// Tipo para o retorno da API
interface UploadResponse {
  message: string;
  file_id: string;
  error?: string;
}

// Função de upload de fotos para a API
// Recebe um array de arquivos do tipo File (ex: input type="file")
export const uploadFotosParaAPI = async (
  fotos: File[],
  apiUrl: string = 'http://<BACKEND_URL>/upload/'
): Promise<void> => {
  const formData = new FormData();

  // Adiciona cada arquivo ao FormData
  fotos.forEach((file) => {
    formData.append('file', file, file.name);
  });

  try {
    const response: AxiosResponse<UploadResponse> = await axios.post(apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.message === 'Upload successful') {
      alert(`Fotos enviadas com sucesso! ID: ${response.data.file_id}`);
    } else {
      alert(`Erro ao enviar: ${response.data.error || 'Tente novamente.'}`);
    }
  } catch (error) {
    console.error('Erro ao enviar as fotos:', error);
    alert('Não foi possível enviar as fotos. Tente novamente.');
  }
};
