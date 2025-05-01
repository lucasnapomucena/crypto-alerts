import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/core/sidebar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <MainSidebar />
      <main className="p-4">{children}</main>
    </SidebarProvider>
  );
};
