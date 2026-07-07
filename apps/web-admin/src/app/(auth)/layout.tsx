import { Check } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-[#4B3377] p-12 lg:flex">
        {/* Decorative blobs */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-white/[0.03] blur-2xl" />

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white backdrop-blur-sm">
              S
            </div>
            <span className="text-lg font-semibold text-white">Spiced Dayhome</span>
          </div>

          {/* Emoji row */}
          <div className="mb-8 flex gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-sm">🧸</span>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-sm">🎨</span>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-sm">🌈</span>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-sm">📚</span>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-sm">⭐</span>
          </div>

          <h2 className="text-3xl font-bold leading-tight text-white">
            Welcome to Spiced Dayhome
          </h2>

          <p className="mt-4 text-base leading-relaxed text-white/70">
            Your complete childcare management platform. Nurturing little minds and simplifying your day &mdash; all in one place.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Check className="h-4 w-4 shrink-0 text-white/40" />
              Attendance tracking &amp; check-in/check-out
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Check className="h-4 w-4 shrink-0 text-white/40" />
              Billing, invoicing &amp; subsidy management
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Check className="h-4 w-4 shrink-0 text-white/40" />
              Family communication &amp; daily reports
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              S
            </div>
            <span className="text-base font-semibold text-foreground">Spiced Dayhome</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
