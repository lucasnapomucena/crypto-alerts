import { Header } from "@/components/core/header";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="p-4">{children}</main>
    </>
  );
};
