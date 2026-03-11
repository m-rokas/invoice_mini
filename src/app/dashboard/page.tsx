import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [totalClients, totalInvoices, invoices] = await Promise.all([
    prisma.client.count({
      where: { userId: session?.user?.id },
    }),
    prisma.invoice.count({
      where: { userId: session?.user?.id },
    }),
    prisma.invoice.findMany({
      where: { userId: session?.user?.id },
      select: { totalAmount: true, status: true },
    }),
  ]);

  const totalRevenue = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const outstandingRevenue = invoices
    .filter((inv) => inv.status === "PENDING" || inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${outstandingRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
