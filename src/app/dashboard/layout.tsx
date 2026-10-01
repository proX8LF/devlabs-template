import { DashboardChrome } from "@/components/ui";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await db.listItems();
  return <DashboardChrome email={getSession()?.email ?? ""}>{children}</DashboardChrome>;
}
