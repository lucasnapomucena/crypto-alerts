import { create } from "zustand";
import { Transaction } from "@/interfaces/transactions";

type TransactionsCheapState = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction[]) => void;
};

export const useTransactionsCheapStore = create<TransactionsCheapState>(
  (set) => ({
    transactions: [],
    addTransaction: (transactions: Transaction[]) => {
      set(() => ({
        transactions: transactions,
      }));
    },
  })
);
