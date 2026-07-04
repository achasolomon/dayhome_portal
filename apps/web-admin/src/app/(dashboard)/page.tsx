import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@spiced-dayhome/ui-kit';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>Total registered organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">—</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dayhomes</CardTitle>
            <CardDescription>Active dayhomes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">—</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Children</CardTitle>
            <CardDescription>Enrolled children</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">—</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
