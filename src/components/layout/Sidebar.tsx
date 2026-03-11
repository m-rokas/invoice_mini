import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background pt-16">
      <div className="h-full overflow-y-auto px-3 py-4">
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center rounded-lg p-2 text-foreground hover:bg-accent"
            >
              <LayoutDashboard className="h-6 w-6" />
              <span className="ml-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/clients"
              className="flex items-center rounded-lg p-2 text-foreground hover:bg-accent"
            >
              <Users className="h-6 w-6" />
              <span className="ml-3">Clients</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/invoices"
              className="flex items-center rounded-lg p-2 text-foreground hover:bg-accent"
            >
              <FileText className="h-6 w-6" />
              <span className="ml-3">Invoices</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
