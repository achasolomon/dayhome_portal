'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function WelcomeToast() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 800);
    const hide = setTimeout(() => setVisible(false), 5000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-full left-1/2 z-30 mb-3 -translate-x-1/2 animate-[fadeIn_0.5s_ease] sm:mb-4">
      <div className="relative max-w-[260px] rounded-xl bg-white px-4 py-2.5 shadow-lg ring-1 ring-primary/20 sm:max-w-xs sm:px-5 sm:py-3">
        <p className="text-xs leading-relaxed text-foreground/70 sm:text-sm">
          {t('auth.welcome', { name: t('app.name') })}
        </p>
        <div className="absolute -bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-primary/20" />
      </div>
    </div>
  );
}
