import { AlertsList } from "@/modules/alerts/components/alerts";
import { Layout } from "@/components/core/layout";

export default function AlertsPage() {
  return (
    <Layout>
      <section className="w-full flex items-center justify-between mb-6">
        <h1 className="text-2xl"> Alerts</h1>
      </section>

      <AlertsList />
    </Layout>
  );
}
