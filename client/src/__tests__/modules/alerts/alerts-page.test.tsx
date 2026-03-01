import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AlertsPage from "@/modules/alerts/pages/index";
import { useAlertsStore } from "@/stores/use-alerts";
import { Transaction } from "@/interfaces/transactions";

// Mock Layout (contains Header → needs WebSocket context)
vi.mock("@/components/core/layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock AlertForm to isolate page logic
vi.mock("@/modules/alerts/components/alert-form", () => ({
  AlertForm: () => <button>New Alert</button>,
}));

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

describe("AlertsPage – stats", () => {
  it("shows zero counts when there are no rules or triggered alerts", () => {
    render(<AlertsPage />);
    expect(screen.getByText("Rules configured")).toBeInTheDocument();
    expect(screen.getByText("Active rules")).toBeInTheDocument();
    expect(screen.getByText("Alerts triggered")).toBeInTheDocument();
  });

  it("counts all rules correctly", () => {
    useAlertsStore.setState({
      rules: [
        { id: "1", label: "R1", symbol: "BTC", condition: "price_above", threshold: 100, side: "all", active: true, createdAt: 1 },
        { id: "2", label: "R2", symbol: "ETH", condition: "price_below", threshold: 50, side: "all", active: false, createdAt: 2 },
      ],
      triggered: [],
    });

    render(<AlertsPage />);
    // The "2" in the rules configured card
    const [totalEl] = screen.getAllByText("2");
    expect(totalEl).toBeInTheDocument();
  });

  it("counts only active rules for the active-rules stat", () => {
    useAlertsStore.setState({
      rules: [
        { id: "1", label: "R1", symbol: "BTC", condition: "price_above", threshold: 100, side: "all", active: true, createdAt: 1 },
        { id: "2", label: "R2", symbol: "ETH", condition: "price_below", threshold: 50, side: "all", active: false, createdAt: 2 },
        { id: "3", label: "R3", symbol: "SOL", condition: "quantity_above", threshold: 10, side: "all", active: true, createdAt: 3 },
      ],
      triggered: [],
    });

    render(<AlertsPage />);
    // active count = 2, total = 3, triggered = 0
    expect(screen.getByText("3")).toBeInTheDocument(); // total rules
    expect(screen.getByText("2")).toBeInTheDocument(); // active rules
  });
});

describe("AlertsPage – rules list", () => {
  it("shows empty state when there are no rules", () => {
    render(<AlertsPage />);
    expect(
      screen.getByText('No rules yet. Click "New Alert" to create one.')
    ).toBeInTheDocument();
  });

  it("renders each rule's label and condition", () => {
    useAlertsStore.setState({
      rules: [
        { id: "1", label: "BTC spike", symbol: "BTC", condition: "price_above", threshold: 95000, side: "all", active: true, createdAt: 1 },
      ],
      triggered: [],
    });

    render(<AlertsPage />);
    expect(screen.getByText("BTC spike")).toBeInTheDocument();
    expect(screen.getByText(/price above/i)).toBeInTheDocument();
    expect(screen.getByText(/\$95,000\.00/)).toBeInTheDocument();
  });

  it("calls removeRule when Remove is clicked", () => {
    useAlertsStore.setState({
      rules: [
        { id: "rule-1", label: "To remove", symbol: "BTC", condition: "price_above", threshold: 100, side: "all", active: true, createdAt: 1 },
      ],
      triggered: [],
    });

    render(<AlertsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(useAlertsStore.getState().rules).toHaveLength(0);
  });

  it("calls toggleRule when the status indicator is clicked", () => {
    useAlertsStore.setState({
      rules: [
        { id: "rule-1", label: "Toggle me", symbol: "BTC", condition: "price_above", threshold: 100, side: "all", active: true, createdAt: 1 },
      ],
      triggered: [],
    });

    render(<AlertsPage />);
    fireEvent.click(screen.getByTitle("Active — click to disable"));
    expect(useAlertsStore.getState().rules[0].active).toBe(false);
  });

  it("shows buy/sell badge when side is not 'all'", () => {
    useAlertsStore.setState({
      rules: [
        { id: "1", label: "Buy only", symbol: "BTC", condition: "price_above", threshold: 100, side: "buy", active: true, createdAt: 1 },
        { id: "2", label: "Sell only", symbol: "ETH", condition: "price_below", threshold: 50, side: "sell", active: true, createdAt: 2 },
      ],
      triggered: [],
    });

    render(<AlertsPage />);
    expect(screen.getByText("· Buy")).toBeInTheDocument();
    expect(screen.getByText("· Sell")).toBeInTheDocument();
  });

  it("does not show side badge when side is 'all'", () => {
    useAlertsStore.setState({
      rules: [
        { id: "1", label: "Both sides", symbol: "BTC", condition: "price_above", threshold: 100, side: "all", active: true, createdAt: 1 },
      ],
      triggered: [],
    });

    render(<AlertsPage />);
    expect(screen.queryByText("· Buy")).not.toBeInTheDocument();
    expect(screen.queryByText("· Sell")).not.toBeInTheDocument();
  });
});

describe("AlertsPage – triggered alerts", () => {
  it("shows empty state when no alerts have been triggered", () => {
    render(<AlertsPage />);
    expect(screen.getByText("No alerts triggered yet.")).toBeInTheDocument();
  });

  it("renders each triggered alert's label and pair", () => {
    useAlertsStore.setState({
      rules: [],
      triggered: [
        {
          id: "t1",
          ruleId: "r1",
          ruleLabel: "Big Trade",
          condition: "price_above",
          threshold: 90000,
          transaction: mockTransaction,
          triggeredAt: new Date("2024-01-01T12:00:00").getTime(),
        },
      ],
    });

    render(<AlertsPage />);
    expect(screen.getByText("Big Trade")).toBeInTheDocument();
    expect(screen.getByText(/BTC\/USDT/)).toBeInTheDocument();
    expect(screen.getByText(/\$95,000\.00/)).toBeInTheDocument();
  });

  it('shows "Clear all" button only when there are triggered alerts', () => {
    render(<AlertsPage />);
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
  });

  it('shows "Clear all" button when triggered alerts exist', () => {
    useAlertsStore.setState({
      rules: [],
      triggered: [
        { id: "t1", ruleId: "r1", ruleLabel: "Test", condition: "price_above", threshold: 100, transaction: mockTransaction, triggeredAt: Date.now() },
      ],
    });

    render(<AlertsPage />);
    expect(screen.getByRole("button", { name: "Clear all" })).toBeInTheDocument();
  });

  it("clears all triggered alerts when Clear all is clicked", () => {
    useAlertsStore.setState({
      rules: [],
      triggered: [
        { id: "t1", ruleId: "r1", ruleLabel: "Test", condition: "price_above", threshold: 100, transaction: mockTransaction, triggeredAt: Date.now() },
      ],
    });

    render(<AlertsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(useAlertsStore.getState().triggered).toHaveLength(0);
  });

  it("formats quantity values for quantity-based conditions", () => {
    useAlertsStore.setState({
      rules: [],
      triggered: [
        {
          id: "t1",
          ruleId: "r1",
          ruleLabel: "Vol spike",
          condition: "quantity_above",
          threshold: 0.1,
          transaction: { ...mockTransaction, Q: 1.5 },
          triggeredAt: Date.now(),
        },
      ],
    });

    render(<AlertsPage />);
    expect(screen.getByText(/1\.500000/)).toBeInTheDocument();
  });
});
