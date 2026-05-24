import { TopNav } from "@/components/landing/top-nav";
import { Sidebar } from "@/components/landing/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbf9f4]">
      <TopNav />
      <Sidebar />
      <main className="min-w-0 md:pl-64">{children}</main>
    </div>
  );
}
