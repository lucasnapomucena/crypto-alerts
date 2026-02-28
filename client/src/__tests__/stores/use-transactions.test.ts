import { describe, it, expect, beforeEach } from "vitest";
import { useTransactionsStore } from "@/stores/use-transactions";
import { Transaction } from "@/interfaces/transactions";

const makeTx = (ccseq: number): Transaction => ({
  TYPE: "0",
  M: "Binance",
  FSYM: "BTC",
  TSYM: "USDT",
  SIDE: 1,
  ACTION: 1,
  CCSEQ: ccseq,
  P: 95000,
  Q: 0.5,
  SEQ: ccseq,
  REPORTEDNS: 0,
  DELAYNS: 0,
});

beforeEach(() => {
  useTransactionsStore.setState({ transactions: [] });
});

describe("useTransactionsStore", () => {
  it("starts with an empty list", () => {
    expect(useTransactionsStore.getState().transactions).toHaveLength(0);
  });

  it("stores the provided transactions", () => {
    useTransactionsStore.getState().addTransaction([makeTx(1)]);
    expect(useTransactionsStore.getState().transactions).toHaveLength(1);
    expect(useTransactionsStore.getState().transactions[0].CCSEQ).toBe(1);
  });

  it("replaces previous transactions on each call", () => {
    useTransactionsStore.getState().addTransaction([makeTx(1)]);
    useTransactionsStore.getState().addTransaction([makeTx(2), makeTx(3)]);

    const { transactions } = useTransactionsStore.getState();
    expect(transactions).toHaveLength(2);
    expect(transactions[0].CCSEQ).toBe(2);
    expect(transactions[1].CCSEQ).toBe(3);
  });

  it("can store an empty array, clearing previous transactions", () => {
    useTransactionsStore.getState().addTransaction([makeTx(1)]);
    useTransactionsStore.getState().addTransaction([]);
    expect(useTransactionsStore.getState().transactions).toHaveLength(0);
  });
});
