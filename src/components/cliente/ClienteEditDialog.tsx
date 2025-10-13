'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Cliente_Modal';
import ClienteForm from '@/components/cliente/ClienteForm';
import useClientes from '@/hooks/useClientes';
import type { Cliente, ClienteCreate } from '@/types/cliente';

export default function ClienteEditDialog({
  cliente,
  open,
  onUpdated,
  onClose,
}: {
  cliente: Cliente;
  open: boolean;
  onUpdated?: () => void;
  onClose: () => void;
}) {
  const [error, setError] = useState<string>('');
  const { updateCliente, updating } = useClientes();

  useEffect(() => {
    if (open) setError('');
  }, [open]);

  function handleSubmit(payload: ClienteCreate) {
    setError('');
    updateCliente(
      { id: cliente.id, patch: payload },
      {
        onSuccess() {
          onUpdated?.();
          onClose();
        },
        onError(err: any) {
          const msg = err?.message || 'Erro ao atualizar cliente';
          if (/duplicad|unique|exists/i.test(msg)) {
            setError('Documento já cadastrado para outro cliente.');
          } else {
            setError(msg);
          }
        },
      }
    );
  }

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Editar Cliente" size="5xl" fullScreenOnMobile>
      {!!error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <ClienteForm defaultValues={cliente} onSubmit={handleSubmit} submitting={updating} />
    </Modal>
  );
}