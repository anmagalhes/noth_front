// src/components/ui/Modal.tsx
'use client';

import React from 'react';
import clsx from 'clsx';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;        // ex: 'max-w-5xl'
  bodyClassName?: string;   // ⬅️ novo
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',    // padrão antigo
  bodyClassName,             // ⬅️ novo
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={clsx(
        'relative mx-auto mt-6 bg-white rounded shadow w-[95%]',
        maxWidth
      )}>
        <div className="flex items-center justify-between border-b px-4 py-3 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        {/* ⬇️ faz o corpo rolar e limita a altura do modal */}
        <div className={clsx('p-4 max-h-[80vh] overflow-y-auto', bodyClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
