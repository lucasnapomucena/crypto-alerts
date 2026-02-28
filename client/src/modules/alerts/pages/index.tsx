import { Layout } from "@/components/core/layout";
import { AlertForm } from "@/modules/alerts/components/alert-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAlertsStore } from "@/stores/use-alerts";
import { formatPrice, formatQuantity } from "@/lib/transaction-formatters";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const { rules, triggered, removeRule, toggleRule, clearTriggered } =
    useAlertsStore();

  const activeCount = rules.filter((r) => r.active).length;

  return (
    <Layout>
      <section className="w-full flex items-center justify-between mb-6">
        <h1 className="text-2xl">Alerts</h1>
        <AlertForm />
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="text-center flex flex-col gap-2 py-4">
            <p className="text-4xl font-bold">{rules.length}</p>
            <p className="text-sm text-muted-foreground">Rules configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center flex flex-col gap-2 py-4">
            <p className="text-4xl font-bold text-green-500">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Active rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center flex flex-col gap-2 py-4">
            <p className="text-4xl font-bold text-yellow-500">
              {triggered.length}
            </p>
            <p className="text-sm text-muted-foreground">Alerts triggered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Alert Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rules</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {rules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No rules yet. Click "New Alert" to create one.
              </p>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{rule.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {rule.symbol} · {rule.condition.replace("_", " ")}{" "}
                      {rule.condition.startsWith("price")
                        ? formatPrice(rule.threshold)
                        : formatQuantity(rule.threshold)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      title={
                        rule.active
                          ? "Active — click to disable"
                          : "Inactive — click to enable"
                      }
                      className={cn(
                        "h-2 w-2 rounded-full transition-colors",
                        rule.active ? "bg-green-500" : "bg-muted-foreground"
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => removeRule(rule.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Triggered Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Triggered</CardTitle>
            {triggered.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-6"
                onClick={clearTriggered}
              >
                Clear all
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
            {triggered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No alerts triggered yet.
              </p>
            ) : (
              triggered.map((alert) => {
                const isPrice =
                  alert.condition === "price_above" ||
                  alert.condition === "price_below";
                const value = isPrice
                  ? formatPrice(alert.transaction.P)
                  : formatQuantity(alert.transaction.Q);

                return (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between rounded-md border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{alert.ruleLabel}</span>
                      <span className="text-xs text-muted-foreground">
                        {alert.transaction.FSYM}/{alert.transaction.TSYM} —{" "}
                        {value}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {new Date(alert.triggeredAt).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
