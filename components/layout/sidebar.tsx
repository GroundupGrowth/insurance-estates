import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Logo } from "@/components/layout/logo";

export function Sidebar({ email }: { email: string | null }) {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-30 h-screen w-[240px] flex-col border-r border-app-border bg-white">
      <div className="px-4 py-4 border-b border-app-border">
        <Logo />
      </div>
      <div className="py-4 flex-1 overflow-y-auto scrollbar-thin">
        <SidebarNav />
      </div>
      <div className="border-t border-app-border p-3">
        <UserMenu email={email} />
      </div>
    </aside>
  );
}
