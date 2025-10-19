import { create } from "zustand";
import { Transaction } from "@/interfaces/transactions";

type TransactionsState = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction[]) => void;
};

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  addTransaction: (transactions: Transaction[]) => {
    set(() => ({
      transactions: transactions,
    }));
  },
}));

useTransactionsStore.subscribe((state) => {
  console.log(state, "state");
});
