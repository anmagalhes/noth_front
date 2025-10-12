import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm }: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-11/12 max-w-md rounded-lg bg-white shadow-xl">
        <div className="rounded-t-lg bg-green-600 p-4 text-white">
          <h3 className="text-lg font-medium">Confirmação</h3>
        </div>

        <div className="p-4">
          <p>Você tem certeza que quer fechar a página?</p>
        </div>

        <div className="flex justify-end space-x-2 p-4">
          <button
            className="rounded bg-gray-300 px-4 py-2"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded bg-blue-500 px-4 py-2 text-white"
            onClick={onConfirm}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
