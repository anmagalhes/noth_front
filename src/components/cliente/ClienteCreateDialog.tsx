// src/components/cliente/ClienteCreateDialog.tsx
'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Cliente_Modal';
import ClienteForm from '@/components/cliente/ClienteForm';
import useClientes from '@/hooks/useClientes';
import type { ClienteCreate } from '@/types/cliente';

export default function ClienteCreateDialog({
  onCreated,
  buttonLabel = 'Novo Cliente',
}: {
  onCreated?: () => void;
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const { createCliente, creating } = useClientes(); // usa mutate do hook

  function handleSubmit(payload: ClienteCreate) {
    setError('');
    createCliente(payload, {
      onSuccess() {
        onCreated?.();
        setOpen(false);
      },
      onError(err: any) {
        const msg = err?.message || 'Erro ao criar cliente';
        // trata duplicidade, se vier do backend
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
      <button onClick={() => setOpen(true)} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
        {buttonLabel}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo Cliente" size="5xl" fullScreenOnMobile>
        {!!error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <ClienteForm onSubmit={handleSubmit} submitting={creating} />
      </Modal>
    </>
  );
}
