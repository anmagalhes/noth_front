// src/components/ui/Cliente_ConfirmDialog.tsx
'use client';

import React from 'react';
import Modal from '@/components/ui/Cliente_Modal';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
};

export default function ConfirmDialog({
  open, title = 'Confirmar', description,
  confirmText = 'Confirmar', cancelText = 'Cancelar',
  onConfirm, onClose, loading
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      {description && <p className="mb-4 text-sm text-gray-700">{description}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-2 rounded border"> {cancelText} </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-60"
        >
          {loading ? 'Aguarde...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
