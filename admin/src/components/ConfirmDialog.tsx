'use client';

import { Modal } from '@/components/Modal';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Sil',
  cancelLabel = 'Vazgeç',
  danger = true,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      showClose={!loading}
      labelledBy="confirm-dialog-title"
      className="admin-confirm-modal"
      header={
        <div className="admin-modal-header admin-confirm-header">
          <div
            className={`admin-confirm-icon ${
              danger ? 'admin-confirm-icon-danger' : 'admin-confirm-icon-accent'
            }`}
            aria-hidden
          >
            {danger ? '!' : '✓'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="confirm-dialog-title" className="admin-modal-title">
              {title}
            </h3>
            {description ? (
              <p className="admin-modal-desc">{description}</p>
            ) : null}
          </div>
          {!loading ? (
            <button
              type="button"
              onClick={onCancel}
              className="admin-modal-close"
              aria-label="Kapat"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="admin-btn admin-btn-ghost disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`admin-btn admin-btn-primary disabled:opacity-50 ${
              danger ? 'admin-btn-danger' : ''
            }`}
          >
            {loading ? 'İşleniyor…' : confirmLabel}
          </button>
        </>
      }
    >
      <></>
    </Modal>
  );
}
