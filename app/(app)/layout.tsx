import { getCurrentUser } from "@/stack";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar email={user.primaryEmail} />
      <MobileNav email={user.primaryEmail} />
      <main className="md:pl-[240px]">
        <div className="px-6 py-6 md:px-10 md:py-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
