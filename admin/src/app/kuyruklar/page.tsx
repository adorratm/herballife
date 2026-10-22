'use client';

import { useEffect, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { API_URL } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function QueuesPage() {
  const [boardUrl, setBoardUrl] = useState(`${API_URL}/admin/queues`);

  useEffect(() => {
    const token = getToken();
    setBoardUrl(
      token
        ? `${API_URL}/admin/queues?token=${encodeURIComponent(token)}`
        : `${API_URL}/admin/queues`,
    );
  }, []);

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h2 className="text-lg font-semibold">Kuyruklar</h2>
          <p className="text-sm text-muted">
            Bildirim ve kargo kuyruk işlerini izleyin. Erişim yönetici oturumu
            ile korunur; bağlantıyı yeni sekmede açın.
          </p>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <a
          href={boardUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-motion inline-block bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
        >
          Kuyruk panelini aç
        </a>
      </Reveal>
      <Reveal delay={140} variant="fade">
        <p className="text-xs text-muted">
          Token yoksa admin olarak tekrar giriş yapın, sonra bu sayfayı yenileyin.
        </p>
      </Reveal>
    </div>
  );
}
