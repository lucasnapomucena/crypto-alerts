import { describe, it, expect, beforeEach } from "vitest";
import { useAlertsStore } from "@/stores/use-alerts";
import { Transaction } from "@/interfaces/transactions";

const mockTransaction: Transaction = {
  TYPE: "0",
  M: "Binance",
  FSYM: "BTC",
  TSYM: "USDT",
  SIDE: 1,
  ACTION: 1,
  CCSEQ: 1,
  P: 95000,
  Q: 0.5,
  SEQ: 1,
  REPORTEDNS: 0,
  DELAYNS: 0,
};

beforeEach(() => {
  localStorage.clear();
  useAlertsStore.setState({ rules: [], triggered: [] });
});

// ─── addRule ────────────────────────────────────────────────────────────────

describe("addRule", () => {
  it("adds a rule and auto-generates id and createdAt", () => {
    useAlertsStore.getState().addRule({
      label: "BTC spike",
      symbol: "BTC",
      condition: "price_above",
      threshold: 95000,
      active: true,
    });

    const { rules } = useAlertsStore.getState();
    expect(rules).toHaveLength(1);
    expect(rules[0].label).toBe("BTC spike");
    expect(rules[0].condition).toBe("price_above");
    expect(rules[0].threshold).toBe(95000);
    expect(rules[0].active).toBe(true);
    expect(typeof rules[0].id).toBe("string");
    expect(rules[0].id).not.toBe("");
    expect(typeof rules[0].createdAt).toBe("number");
  });

  it("adds multiple rules independently", () => {
    const { addRule } = useAlertsStore.getState();
    addRule({ label: "Rule A", symbol: "BTC", condition: "price_above", threshold: 100, active: true });
    addRule({ label: "Rule B", symbol: "ETH", condition: "price_below", threshold: 50, active: false });

    const { rules } = useAlertsStore.getState();
    expect(rules).toHaveLength(2);
    expect(rules[0].label).toBe("Rule A");
    expect(rules[1].label).toBe("Rule B");
  });

  it("generates unique ids for each rule", () => {
    const { addRule } = useAlertsStore.getState();
    addRule({ label: "Rule 1", symbol: "BTC", condition: "price_above", threshold: 100, active: true });
    addRule({ label: "Rule 2", symbol: "BTC", condition: "price_above", threshold: 200, active: true });

    const { rules } = useAlertsStore.getState();
    expect(rules[0].id).not.toBe(rules[1].id);
  });
});

// ─── removeRule ─────────────────────────────────────────────────────────────

describe("removeRule", () => {
  it("removes the rule with the given id", () => {
    useAlertsStore.getState().addRule({
      label: "To remove",
      symbol: "BTC",
      condition: "price_above",
      threshold: 100,
      active: true,
    });

    const id = useAlertsStore.getState().rules[0].id;
    useAlertsStore.getState().removeRule(id);

    expect(useAlertsStore.getState().rules).toHaveLength(0);
  });

  it("does not remove other rules", () => {
    const { addRule } = useAlertsStore.getState();
    addRule({ label: "Keep", symbol: "BTC", condition: "price_above", threshold: 100, active: true });
    addRule({ label: "Remove me", symbol: "BTC", condition: "price_below", threshold: 50, active: true });

    const idToRemove = useAlertsStore.getState().rules[1].id;
    useAlertsStore.getState().removeRule(idToRemove);

    const { rules } = useAlertsStore.getState();
    expect(rules).toHaveLength(1);
    expect(rules[0].label).toBe("Keep");
  });

  it("is a no-op when the id does not exist", () => {
    useAlertsStore.getState().addRule({
      label: "Stable",
      symbol: "BTC",
      condition: "price_above",
      threshold: 100,
      active: true,
    });

    useAlertsStore.getState().removeRule("non-existent-id");
    expect(useAlertsStore.getState().rules).toHaveLength(1);
  });
});

// ─── toggleRule ─────────────────────────────────────────────────────────────

describe("toggleRule", () => {
  it("sets active to false when the rule is currently active", () => {
    useAlertsStore.getState().addRule({
      label: "Toggle",
      symbol: "BTC",
      condition: "price_above",
      threshold: 100,
      active: true,
    });

    const id = useAlertsStore.getState().rules[0].id;
    useAlertsStore.getState().toggleRule(id);

    expect(useAlertsStore.getState().rules[0].active).toBe(false);
  });

  it("sets active to true when the rule is currently inactive", () => {
    useAlertsStore.getState().addRule({
      label: "Toggle",
      symbol: "BTC",
      condition: "price_above",
      threshold: 100,
      active: false,
    });

    const id = useAlertsStore.getState().rules[0].id;
    useAlertsStore.getState().toggleRule(id);

    expect(useAlertsStore.getState().rules[0].active).toBe(true);
  });

  it("only toggles the targeted rule", () => {
    const { addRule } = useAlertsStore.getState();
    addRule({ label: "Rule 1", symbol: "BTC", condition: "price_above", threshold: 100, active: true });
    addRule({ label: "Rule 2", symbol: "ETH", condition: "price_below", threshold: 50, active: true });

    const idOfFirst = useAlertsStore.getState().rules[0].id;
    useAlertsStore.getState().toggleRule(idOfFirst);

    const { rules } = useAlertsStore.getState();
    expect(rules[0].active).toBe(false);
    expect(rules[1].active).toBe(true);
  });
});

// ─── addTriggered ───────────────────────────────────────────────────────────

describe("addTriggered", () => {
  it("adds a triggered alert with a generated id", () => {
    useAlertsStore.getState().addTriggered({
      ruleId: "rule-1",
      ruleLabel: "BTC spike",
      condition: "price_above",
      threshold: 90000,
      transaction: mockTransaction,
      triggeredAt: Date.now(),
    });

    const { triggered } = useAlertsStore.getState();
    expect(triggered).toHaveLength(1);
    expect(triggered[0].ruleId).toBe("rule-1");
    expect(triggered[0].ruleLabel).toBe("BTC spike");
    expect(typeof triggered[0].id).toBe("string");
  });

  it("prepends alerts so the most recent appears first", () => {
    const { addTriggered } = useAlertsStore.getState();
    addTriggered({ ruleId: "r1", ruleLabel: "First", condition: "price_above", threshold: 100, transaction: mockTransaction, triggeredAt: 1000 });
    addTriggered({ ruleId: "r2", ruleLabel: "Second", condition: "price_below", threshold: 50, transaction: mockTransaction, triggeredAt: 2000 });

    const { triggered } = useAlertsStore.getState();
    expect(triggered[0].ruleLabel).toBe("Second");
    expect(triggered[1].ruleLabel).toBe("First");
  });

  it("caps the list at 200 entries", () => {
    const { addTriggered } = useAlertsStore.getState();
    for (let i = 0; i < 205; i++) {
      addTriggered({
        ruleId: `r${i}`,
        ruleLabel: `Alert ${i}`,
        condition: "price_above",
        threshold: 100,
        transaction: mockTransaction,
        triggeredAt: i,
      });
    }

    expect(useAlertsStore.getState().triggered).toHaveLength(200);
  });
});

// ─── clearTriggered ─────────────────────────────────────────────────────────

describe("clearTriggered", () => {
  it("removes all triggered alerts", () => {
    useAlertsStore.getState().addTriggered({
      ruleId: "r1",
      ruleLabel: "Test",
      condition: "price_above",
      threshold: 100,
      transaction: mockTransaction,
      triggeredAt: Date.now(),
    });

    useAlertsStore.getState().clearTriggered();
    expect(useAlertsStore.getState().triggered).toHaveLength(0);
  });

  it("is a no-op on an already-empty list", () => {
    useAlertsStore.getState().clearTriggered();
    expect(useAlertsStore.getState().triggered).toHaveLength(0);
  });
});
