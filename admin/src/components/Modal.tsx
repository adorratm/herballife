'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASS: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: Size;
  /** Üst sağ kapat — varsayılan true */
  showClose?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  /** Panel üstüne özel başlık (title yerine) */
  header?: ReactNode;
  labelledBy?: string;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  showClose = true,
  children,
  footer,
  header,
  labelledBy,
  className = '',
}: Props) {
  const autoId = useId();
  const titleId = labelledBy || (title ? `${autoId}-title` : undefined);
  const [mounted, setMounted] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open || !mounted) return null;

  function stop(e: MouseEvent) {
    e.stopPropagation();
  }

  return createPortal(
    <div
      className="admin-modal-root fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Kapat"
        className="dialog-backdrop admin-modal-backdrop absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={stop}
        className={`dialog-panel admin-modal-panel relative z-10 flex max-h-[min(92vh,880px)] w-full flex-col ${SIZE_CLASS[size]} ${className}`}
      >
        {header ? (
          header
        ) : title || showClose ? (
          <div className="admin-modal-header">
            <div className="min-w-0 flex-1">
              {title ? (
                <h3 id={titleId} className="admin-modal-title">
                  {title}
                </h3>
              ) : null}
              {description ? (
                <p className="admin-modal-desc">{description}</p>
              ) : null}
            </div>
            {showClose ? (
              <button
                type="button"
                onClick={onClose}
                className="admin-modal-close"
                aria-label="Kapat"
              >
                <CloseIcon />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="admin-modal-body">{children}</div>

        {footer ? <div className="admin-modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
