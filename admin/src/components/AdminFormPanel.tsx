'use client';

import type { ReactNode } from 'react';
import { Modal } from '@/components/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Düzenleme / oluşturma formları — üst katman modal panel */
export function AdminFormPanel({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={title}
      description={description}
      className="admin-form-panel z-60"
      footer={footer}
      children={children}
    />
  );
}
