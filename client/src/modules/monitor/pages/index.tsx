import { TransactionsList } from "@/modules/monitor/components/transactions";
import { Layout } from "@/components/core/layout";

export default function MonitorPage() {
  return (
    <Layout>
      <section className="w-full flex items-center justify-between mb-6">
        <h1 className="text-2xl"> Monitor transactions</h1>
      </section>

      <section className="max-w-full">
        <TransactionsList />
      </section>
    </Layout>
  );
}
