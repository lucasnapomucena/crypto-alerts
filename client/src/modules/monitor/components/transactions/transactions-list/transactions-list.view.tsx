import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactionsStore } from "@/stores/use-transactions";
import {
  formatAction,
  formatPrice,
  formatQuantity,
  formatSide,
} from "@/lib/transaction-formatters";
import { cn } from "@/lib/utils";
import { TableVirtuoso } from "react-virtuoso";

interface TransactionsListProps {
  symbol?: string;
  side?: number;
}

export const TransactionsList = ({ symbol, side }: TransactionsListProps) => {
  const transactions = useTransactionsStore((state) => state.transactions);
  let filtered = symbol ? transactions.filter((t) => t.FSYM === symbol) : transactions;
  if (side !== undefined) {
    filtered = filtered.filter((t) => t.SIDE === side);
  }

  return (
    <TableVirtuoso
      style={{ height: "calc(100vh - 200px)" }}
      data={filtered}
      components={{
        Scroller: (props) => <div {...props} className="overflow-auto" />,
        Table: (props) => <Table {...props} />,
        TableHead: (props) => <TableHeader {...props} />,
        TableRow: (props) => <TableRow {...props} />,
        TableBody: (props) => <TableBody {...props} />,
      }}
      fixedHeaderContent={() => (
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Exchange</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Quote</TableHead>
          <TableHead>Side</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      )}
      itemContent={(_, transaction) => (
        <>
          <TableCell>{formatAction(transaction.ACTION)}</TableCell>
          <TableCell>{transaction.M}</TableCell>
          <TableCell className="font-medium">{transaction.FSYM}</TableCell>
          <TableCell>{transaction.TSYM}</TableCell>
          <TableCell>
            <span
              className={cn(
                "font-semibold",
                transaction.SIDE === 1 ? "text-green-500" : "text-red-500"
              )}
            >
              {formatSide(transaction.SIDE)}
            </span>
          </TableCell>
          <TableCell className="text-right font-mono">
            {formatQuantity(transaction.Q)}
          </TableCell>
          <TableCell className="text-right font-mono">
            {formatPrice(transaction.P)}
          </TableCell>
          <TableCell>{transaction.TYPE}</TableCell>
        </>
      )}
    />
  );
};
