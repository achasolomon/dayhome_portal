export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
          S
        </div>
        <div>
          <h1 className="text-xl font-semibold text-primary">Spiced Dayhome</h1>
          <p className="text-xs text-muted-foreground">Management Platform</p>
        </div>
      </div>
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
