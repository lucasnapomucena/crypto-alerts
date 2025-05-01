import { create } from "zustand";
import { Transaction } from "@/interfaces/transactions";

type TransactionsState = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
};

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  addTransaction: (transaction: Transaction) =>
    set((state) => ({ transactions: [...state.transactions, transaction] })),
}));
