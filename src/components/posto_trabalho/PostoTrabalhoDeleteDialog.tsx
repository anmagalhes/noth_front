// src/components/posto-trabalho/PostoTrabalhoDeleteDialog.tsx
'use client';

import React from 'react';
import usePostosTrabalho from '@/hooks/usePostosTrabalhoWs';

export default function PostoTrabalhoDeleteDialog({
  id,
  open,
  onDeleted,
  onClose,
}: {
  id: number;
  open: boolean;
  onDeleted?: () => void;
  onClose: () => void;
}) {
  const { deletePosto, deleting } = usePostosTrabalho();

  function confirmDelete() {
    deletePosto(id, {
      onSuccess() {
        onDeleted?.();
        onClose();
      },
      onError(err: any) {
        alert(err?.message || 'Erro ao excluir posto de trabalho');
      },
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmar exclusão</h2>
        <p className="text-sm text-gray-600 mb-6">
          Tem certeza que deseja excluir este posto de trabalho? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-60"
          >
            {deleting ? 'Excluindo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
