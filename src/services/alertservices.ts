// src/services/alertService.ts
import Swal from 'sweetalert2';

const AlertService = {
  showAlert: (message: string) => {
    Swal.fire({
      title: "Atenção!",
      text: message,
      icon: "warning",
      background: "#f9fafb",
      customClass: {
        container: 'font-sans',
        popup: 'rounded-xl shadow-lg border border-gray-200',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-gray-700',
        confirmButton: 'bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-sm hover:shadow-md'
      }
    });
  },

  showConfirmation: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }) => {
    return Swal.fire({
      title: options.title,
      html: `<div class="text-left">
               <p class="text-gray-700">${options.message}</p>
             </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: options.confirmText || "Confirmar",
      cancelButtonText: options.cancelText || "Cancelar",
      background: "#f9fafb",
      customClass: {
        popup: 'rounded-xl shadow-lg border border-gray-200',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-gray-700',
        confirmButton: 'bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-lg transition duration-200 shadow-sm hover:shadow-md mr-2',
        cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition duration-200 border border-gray-300'
      },
      focusCancel: true,
      reverseButtons: true
    });
  },

  showSuccess: (message: string) => {
    Swal.fire({
      title: "Sucesso!",
      text: message,
      icon: "success",
      background: "#f9fafb",
      customClass: {
        popup: 'rounded-xl shadow-lg border border-gray-200',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-gray-700',
        confirmButton: 'bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-lg transition duration-200 shadow-sm hover:shadow-md'
      }
    });
  },

  showLoading: (message: string = "Processando...") => {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      background: "#f9fafb",
      customClass: {
        popup: 'rounded-xl shadow-lg border border-gray-200',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-gray-700',
      },
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  closeAlerts: () => {
    Swal.close();
  },

  // Método adicional para erros
  showError: (message: string) => {
    Swal.fire({
      title: "Ocorreu um erro",
      text: message,
      icon: "error",
      background: "#f9fafb",
      customClass: {
        popup: 'rounded-xl shadow-lg border border-gray-200',
        title: 'text-xl font-bold text-gray-900',
        htmlContainer: 'text-gray-700',
        confirmButton: 'bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-lg transition duration-200 shadow-sm hover:shadow-md'
      }
    });
  }
};

export default AlertService;
