import { useTransactionsStore } from "@/stores/use-transactions";

export const AlertsList = () => {
  const { transactions } = useTransactionsStore();

  return (
    <div>
      {transactions.map((transaction, index) => (
        <div key={index}>
          <p>Hash: {transaction.TYPE}</p>
          <p>From: {transaction.Q}</p>
          <p>To: {transaction.FSYM}</p>
        </div>
      ))}
    </div>
  );
};
