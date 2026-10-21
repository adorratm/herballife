"use client";

type Props = {
  open: boolean;
  title: string;
  body?: string;
  onClose: () => void;
  primaryLabel?: string;
};

export function SuccessModal({
  open,
  title,
  body,
  onClose,
  primaryLabel = "Tamam",
}: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      onClick={onClose}
    >
      <div
        className="animate-fade-up w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-2xl text-primary">
          ✓
        </div>
        <h2
          id="success-modal-title"
          className="font-display text-xl text-on-surface"
        >
          {title}
        </h2>
        {body ? (
          <p className="mt-2 text-sm text-on-surface-variant">{body}</p>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="btn-cta mt-6 w-full py-3"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
