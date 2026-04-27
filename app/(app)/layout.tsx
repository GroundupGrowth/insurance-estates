import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack";
import { isAllowedEmail } from "@/lib/db/queries";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await stackServerApp.getUser();
  if (!user) redirect("/login");

  const allowed = await isAllowedEmail(user.primaryEmail);
  if (!allowed) {
    await user.signOut();
    redirect("/login?error=not-allowed");
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar email={user.primaryEmail ?? null} />
      <MobileNav email={user.primaryEmail ?? null} />
      <main className="md:pl-[240px]">
        <div className="px-6 py-6 md:px-10 md:py-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
