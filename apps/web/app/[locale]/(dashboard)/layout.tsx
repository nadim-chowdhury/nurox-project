import { AppShell } from "@/components/layout/AppShell";
import { SocketProvider } from "@/components/providers/SocketProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      <AppShell>{children}</AppShell>
    </SocketProvider>
  );
}
