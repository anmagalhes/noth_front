'use client';
import useOperacoes from '@/hooks/useOperacoesWS';

type Props = {
  id: number | null;
  open?: boolean;
  onDeleted?: () => void;
  onClose?: () => void;
};

export default function OperacaoDeleteDialog({ id, open = false, onDeleted, onClose }: Props) {
  const { deleteOperacao, deleting } = useOperacoes();

  if (!open || id == null) return null;

  function close() {
    onClose?.();
  }

  function confirm() {
    if (id == null) return;
    deleteOperacao(id, {
      onSuccess: () => {
        onDeleted?.();
        close();
      },
      onError: (err) => alert(err.message),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !deleting && close()}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">Excluir operação</h3>
        <p className="mt-2 text-sm text-slate-600">
          Tem certeza que deseja excluir esta operação? Esta ação não pode ser desfeita.
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            disabled={deleting}
            onClick={close}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            disabled={deleting}
            onClick={confirm}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}
