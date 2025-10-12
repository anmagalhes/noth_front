// src/components/cliente/ClienteEditDialog.tsx
'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Cliente_Modal';
import ClienteForm from '@/components/cliente/ClienteForm';
import useClientes from '@/hooks/useClientes';
import type { Cliente, ClienteCreate } from '@/types/cliente';

export default function ClienteEditDialog({
  cliente,
  onUpdated,
  buttonLabel = 'Editar',
}: {
  cliente: Cliente;
  onUpdated?: () => void;
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const { updateCliente, updating } = useClientes();

  function handleSubmit(payload: ClienteCreate) {
    setError('');
    updateCliente({ id: cliente.id, patch: payload }, {
      onSuccess() {
        onUpdated?.();
        setOpen(false);
      },
      onError(err: any) {
        const msg = err?.message || 'Erro ao atualizar cliente';
        if (/duplicad|unique|exists/i.test(msg)) {
          setError('Documento já cadastrado para outro cliente.');
        } else {
          setError(msg);
        }
      },
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-3 py-2 rounded border hover:bg-gray-50">
        {buttonLabel}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar Cliente" size="5xl" fullScreenOnMobile>
        {!!error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <ClienteForm defaultValues={cliente} onSubmit={handleSubmit} submitting={updating} />
      </Modal>
    </>
  );
}
