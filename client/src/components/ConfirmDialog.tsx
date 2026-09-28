import { useEffect, useRef } from 'react';
import { Spinner } from './Feedback';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible confirm dialog built on the native <dialog> element */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl p-0 shadow-xl backdrop:bg-slate-900/40"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading && <Spinner className="h-4 w-4" />} {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
