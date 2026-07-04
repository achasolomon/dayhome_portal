'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

let addToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function toast(toast: Omit<Toast, 'id'>) {
  addToast?.(toast);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToast = (t) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 5000);
    };
    return () => { addToast = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg border px-4 py-3 shadow-lg ${
            t.variant === 'error'
              ? 'border-error bg-error-50 text-error'
              : t.variant === 'success'
                ? 'border-success bg-success-50 text-success'
                : 'border-border bg-background text-foreground'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{t.title}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {t.description && <p className="mt-1 text-xs opacity-80">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
