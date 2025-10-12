// src/components/cliente/ClienteDeleteDialog.tsx
'use client';

import React, { useState } from 'react';
import useClientes from '@/hooks/useClientes';

export default function ClienteDeleteDialog({
  id,
  onDeleted,
  label = 'Excluir',
}: {
  id: number;
  onDeleted?: () => void;
  label?: string;
}) {
  const { deleteCliente, deleting } = useClientes();

  function confirmDelete() {
    if (!confirm('Excluir este cliente?')) return;
    deleteCliente(id, {
      onSuccess() {
        onDeleted?.();
      },
      onError(err: any) {
        alert(err?.message || 'Erro ao excluir cliente');
      },
    });
  }

  return (
    <button
      onClick={confirmDelete}
      disabled={deleting}
      className="px-3 py-2 rounded border border-red-600 text-red-700 hover:bg-red-50 disabled:opacity-60"
    >
      {deleting ? 'Excluindo...' : label}
    </button>
  );
}
