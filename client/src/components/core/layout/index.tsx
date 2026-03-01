import { Header } from "@/components/core/header";
import { BottomNav } from "@/components/core/bottom-nav";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="p-4 pb-20 md:pb-4">{children}</main>
      <BottomNav />
    </>
  );
};
