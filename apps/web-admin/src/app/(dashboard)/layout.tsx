import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r bg-white p-4">
        <h2 className="mb-6 text-lg font-bold text-primary">Spiced Admin</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block rounded px-3 py-2 text-sm hover:bg-primary-50">
            Dashboard
          </Link>
          <Link href="/organizations" className="block rounded px-3 py-2 text-sm hover:bg-primary-50">
            Organizations
          </Link>
          <Link href="/dayhomes" className="block rounded px-3 py-2 text-sm hover:bg-primary-50">
            Dayhomes
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
