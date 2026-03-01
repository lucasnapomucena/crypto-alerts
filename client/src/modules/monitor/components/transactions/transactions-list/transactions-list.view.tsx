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
      style={{ height: "calc(100svh - 260px)" }}
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
          <TableHead className="hidden sm:table-cell">Action</TableHead>
          <TableHead className="hidden md:table-cell">Exchange</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead className="hidden sm:table-cell">Quote</TableHead>
          <TableHead>Side</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="hidden lg:table-cell">Type</TableHead>
        </TableRow>
      )}
      itemContent={(_, transaction) => (
        <>
          <TableCell className="hidden sm:table-cell">{formatAction(transaction.ACTION)}</TableCell>
          <TableCell className="hidden md:table-cell">{transaction.M}</TableCell>
          <TableCell className="font-medium">{transaction.FSYM}</TableCell>
          <TableCell className="hidden sm:table-cell">{transaction.TSYM}</TableCell>
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
          <TableCell className="hidden lg:table-cell">{transaction.TYPE}</TableCell>
        </>
      )}
    />
  );
};
