import {
  TransactionsList,
  TransactionsActions,
} from "@/modules/monitor/components/transactions";
import { useWebSocketWorker } from "@/hooks/use-ws-client";
import { Layout } from "@/components/core/layout";

export default function MonitorPage() {
  const { resume, pause, transactions } = useWebSocketWorker();

  return (
    <Layout>
      <section className="w-full flex items-center justify-between mb-6">
        <h1 className="text-2xl"> Monitor transactions</h1>
        <div className="flex gap-2">
          <TransactionsActions handlePause={pause} handleResume={resume} />
        </div>
      </section>

      <section className="max-w-full">
        <TransactionsList transactions={transactions} />
      </section>
    </Layout>
  );
}
