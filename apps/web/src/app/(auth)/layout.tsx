import { ReactNode } from 'react';
import Link from 'next/link';
import WelcomeToast from '@/components/welcome-toast';
import {
  BookIcon,
  PencilIcon,
  BlocksIcon,
  CrayonIcon,
  StarIcon,
  RulerIcon,
} from '@/components/icon';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      {/* Subtle background pattern – adds texture */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/subtle-dots.svg')] bg-repeat opacity-10" aria-hidden="true" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10 lg:py-6">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.png"
            alt="SPICE'd"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="text-base font-light fontStyle-italic leading-tight text-primary lg:text-lg">
              SPICE&apos;d Childcare
            </h1>
            <hr className="mt-0.5 w-8 border-t-2 border-primary/30 lg:w-10" />
          </div>
        </div>
        <Link
          href="/contact"
          className="hidden rounded text-sm font-medium text-muted-foreground/70 transition-colors hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 lg:block"
        >
          Need help? Contact us
        </Link>
      </header>

      {/* Decorative Illustrations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Background photo accents — ultra subtle, like watermarks */}
        <div className="absolute -left-12 top-1/4 hidden h-64 w-64 -rotate-12 opacity-[0.04] saturate-1 lg:block">
          <img src="/assets/children.jpg" alt="" className="h-full w-full rounded-2xl object-cover" />
        </div>
        <div className="absolute -right-12 top-[10%] hidden h-48 w-48 rotate-6 opacity-[0.1] saturate-1 lg:block">
          <img src="/assets/items.jpg" alt="" className="h-full w-full rounded-2xl object-cover" />
        </div>
        <div className="absolute -bottom-12 left-1/3  hidden h-52 w-52 -rotate-6 opacity-[0.2] saturate-1 lg:block">
          <img src="/assets/items2.jpg" alt="" className="h-full w-full rounded-2xl object-cover" />
        </div>

        {/* Dotted squares – brand accent colors */}
        <div className="absolute left-[15%] top-[15%] hidden h-6 w-6 rotate-12 rounded-sm border-2 border-dotted border-teal/30 lg:block" />
        <div className="absolute right-[18%] top-[12%] hidden h-5 w-5 -rotate-12 rounded-sm border-2 border-dotted border-orange/25 lg:block" />
        <div className="absolute left-[28%] top-[38%] hidden h-5 w-5 rotate-45 rounded-sm border-2 border-dotted border-golden/25 lg:block" />
        <div className="absolute right-[25%] top-[42%] hidden h-6 w-6 rotate-[60deg] rounded-sm border-2 border-dotted border-primary/20 lg:block" />
        <div className="absolute bottom-[28%] left-[22%] hidden h-5 w-5 -rotate-12 rounded-sm border-2 border-dotted border-orange/20 lg:block" />
        <div className="absolute bottom-[22%] right-[16%] hidden h-6 w-6 rotate-12 rounded-sm border-2 border-dotted border-teal/25 lg:block" />

        {/* Icons */}
        <div className="absolute left-[5%] top-[22%] text-teal/20 lg:left-[7%] lg:top-[20%] lg:text-teal/35">
          <BookIcon className="h-12 w-12 lg:h-28 lg:w-28" />
        </div>
        <div className="absolute right-[6%] top-[16%] text-golden/20 lg:right-[8%] lg:top-[14%] lg:text-golden/30">
          <PencilIcon className="h-10 w-10 lg:h-24 lg:w-24" />
        </div>
        <div className="absolute left-[3%] top-[6%] text-orange/15 lg:left-[4%] lg:top-[4%] lg:text-orange/25">
          <RulerIcon className="h-10 w-10 rotate-12 lg:h-24 lg:w-24" />
        </div>
        <div className="absolute right-[3%] top-[38%] text-primary/20 lg:right-[5%] lg:top-[40%] lg:text-primary/30">
          <BlocksIcon className="h-12 w-12 lg:h-28 lg:w-28" />
        </div>
        <div className="absolute bottom-[20%] left-[6%] text-orange/20 lg:bottom-[16%] lg:left-[8%] lg:text-orange/30">
          <CrayonIcon className="h-12 w-12 lg:h-28 lg:w-28" />
        </div>
        <div className="absolute bottom-[14%] right-[5%] text-golden/20 lg:bottom-[12%] lg:right-[7%] lg:text-golden/30">
          <StarIcon className="h-10 w-10 lg:h-24 lg:w-24" />
        </div>
      </div>

      {/* Welcome toast — floats above the card, auto-dismisses */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 py-4">
        <WelcomeToast />
        <div className="w-full max-w-md animate-[slideUp_0.5s_ease-out] rounded-xl border bg-white shadow-lg sm:max-w-lg">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 border-t py-3 text-center text-xs text-muted-foreground/50">
        Spiced Childcare
      </footer>
    </div>
  );
}
