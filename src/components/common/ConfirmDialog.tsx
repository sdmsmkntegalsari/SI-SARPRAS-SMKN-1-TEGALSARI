import React, { useState } from 'react';
import { Modal } from './Modal.tsx';
import { AlertCircle, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (catatan: string) => Promise<void> | void;
  title: string;
  message: string;
  type?: 'approve' | 'reject' | 'cancel' | 'complete' | 'delete';
  confirmText?: string;
  requireNote?: boolean;
  notePlaceholder?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'approve',
  confirmText,
  requireNote = false,
  notePlaceholder = 'Tambahkan catatan jika diperlukan...',
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requireNote && !note.trim()) {
      setError('Catatan wajib diisi untuk tindakan ini.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onConfirm(note);
      setNote('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses tindakan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = {
    approve: {
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      bg: 'bg-emerald-50',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      defaultBtnText: 'Setujui Pengajuan',
    },
    reject: {
      icon: <XCircle className="h-6 w-6 text-rose-600" />,
      bg: 'bg-rose-50',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
      defaultBtnText: 'Tolak Pengajuan',
    },
    cancel: {
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
      bg: 'bg-amber-50',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      defaultBtnText: 'Batalkan Pengajuan',
    },
    complete: {
      icon: <CheckCircle2 className="h-6 w-6 text-sky-600" />,
      bg: 'bg-sky-50',
      btn: 'bg-sky-600 hover:bg-sky-700 text-white',
      defaultBtnText: 'Selesaikan Kegiatan',
    },
    delete: {
      icon: <AlertCircle className="h-6 w-6 text-rose-600" />,
      bg: 'bg-rose-50',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
      defaultBtnText: 'Hapus Data',
    },
  }[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-full ${config.bg} shrink-0`}>
            {config.icon}
          </div>
          <div>
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan / Alasan {requireNote && <span className="text-rose-500">*</span>}
          </label>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError('');
            }}
            placeholder={notePlaceholder}
            rows={3}
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none"
          />
          {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 ${config.btn} ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Memproses...' : confirmText || config.defaultBtnText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
