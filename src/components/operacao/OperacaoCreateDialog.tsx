import { useState } from 'react';
import useOperacoes from '@/hooks/useOperacoesWS';
import type { OperacaoCreate } from '@/types/operacao';

type Props = {
  onCreated?: () => void;
  trigger?: React.ReactNode;
};

export default function OperacaoCreateDialog({ onCreated, trigger }: Props) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<OperacaoCreate>({
    op_grupo_processo: '',
    op_nome: '',
  });

  const { createOperacao } = useOperacoes();

  const handleChange = (field: keyof OperacaoCreate, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await createOperacao(form);
      if (onCreated) onCreated();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar operação:', error);
    }
  };

  return (
    <div>
      {trigger && (
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Nova Operação</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-700">Grupo de Processo</label>
                <input
                  type="text"
                  value={form.op_grupo_processo}
                  onChange={(e) => handleChange('op_grupo_processo', e.target.value.toUpperCase().slice(0, 3))}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  maxLength={3}
                  placeholder="Ex: GRP"
                />
              </div>

              <div>
                <label className="text-sm text-slate-700">Nome da Operação</label>
                <input
                  type="text"
                  value={form.op_nome}
                  onChange={(e) => handleChange('op_nome', e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  maxLength={150}
                  placeholder="Ex: Corte de chapa"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded bg-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
