import { Layout } from "@/components/core/layout";
import { AlertsCard, AlertsList } from "@/modules/alerts/components/alerts";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactionsStore } from "@/stores/use-transactions";

export default function AlertsPage() {
  const transactionsCheap = useTransactionsStore();

  console.log(transactionsCheap, "transactionsCheap");

  return (
    <Layout>
      <section className="w-full mb-6">
        <h1 className="text-2xl"> Alerts</h1>
      </section>

      <div className="w-full flex gap-6">
        <section className="w-full flex flex-col gap-8">
          <AlertsCard title="Cheap order" total={10} />

          <Card>
            <CardContent>
              <AlertsList />
            </CardContent>
          </Card>
        </section>

        <section className="w-full flex flex-col gap-8">
          <AlertsCard title="Solid order" total={10} />

          <Card>
            <CardContent>
              <AlertsList />
            </CardContent>
          </Card>
        </section>

        <section className="w-full flex flex-col gap-8">
          <AlertsCard title="Cheap order" total={10} />

          <Card>
            <CardContent>
              <AlertsList />
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
