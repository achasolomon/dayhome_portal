'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

let addToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function toast(toast: Omit<Toast, 'id'>) {
  addToast?.(toast);
}

const variantStyles = {
  error: {
    container: 'border-destructive/30 bg-destructive/5',
    icon: AlertCircle,
    iconColor: 'text-destructive',
    textColor: 'text-destructive',
  },
  success: {
    container: 'border-success/30 bg-success/5',
    icon: CheckCircle2,
    iconColor: 'text-success',
    textColor: 'text-success',
  },
  warning: {
    container: 'border-warning/30 bg-warning/5',
    icon: AlertTriangle,
    iconColor: 'text-warning',
    textColor: 'text-warning',
  },
  default: {
    container: 'border-primary/20 bg-primary/5',
    icon: Info,
    iconColor: 'text-primary',
    textColor: 'text-foreground',
  },
};

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
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2 sm:right-6 sm:top-6">
      {toasts.map((t) => {
        const style = variantStyles[t.variant ?? 'default'];
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            className={`animate-[slideIn_0.3s_ease] rounded-xl border px-4 py-3 shadow-lg ${style.container}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${style.textColor}`}>{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="shrink-0 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
