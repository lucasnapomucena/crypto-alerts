import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction } from "@/interfaces/transactions";

export type AlertCondition =
  | "price_above"
  | "price_below"
  | "quantity_above"
  | "quantity_below";

export type AlertSide = "all" | "buy" | "sell";

export interface AlertRule {
  id: string;
  label: string;
  symbol: string;
  condition: AlertCondition;
  threshold: number;
  side: AlertSide;
  active: boolean;
  createdAt: number;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  ruleLabel: string;
  condition: AlertCondition;
  threshold: number;
  transaction: Transaction;
  triggeredAt: number;
}

type AlertsState = {
  rules: AlertRule[];
  triggered: TriggeredAlert[];
  addRule: (rule: Omit<AlertRule, "id" | "createdAt">) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  addTriggered: (alert: Omit<TriggeredAlert, "id">) => void;
  clearTriggered: () => void;
};

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set) => ({
      rules: [],
      triggered: [],
      addRule: (rule) =>
        set((state) => ({
          rules: [
            ...state.rules,
            { ...rule, id: crypto.randomUUID(), createdAt: Date.now() },
          ],
        })),
      removeRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        })),
      toggleRule: (id) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, active: !r.active } : r
          ),
        })),
      addTriggered: (alert) =>
        set((state) => ({
          triggered: [
            { ...alert, id: crypto.randomUUID() },
            ...state.triggered,
          ].slice(0, 200),
        })),
      clearTriggered: () => set({ triggered: [] }),
    }),
    { name: "crypto-alerts-rules", partialize: (s) => ({ rules: s.rules }) }
  )
);
