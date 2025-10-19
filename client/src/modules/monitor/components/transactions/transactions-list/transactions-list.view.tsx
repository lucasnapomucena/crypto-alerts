import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactionsStore } from "@/stores/use-transactions";
import { TableVirtuoso } from "react-virtuoso";

export const TransactionsList = () => {
  const transactions = useTransactionsStore((state) => state.transactions);

  return (
    <TableVirtuoso
      style={{ height: "calc(100vh - 200px)" }}
      data={transactions}
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
          <TableHead>Fsym</TableHead>
          <TableHead>Tsym</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Side</TableHead>
        </TableRow>
      )}
      itemContent={(_, transaction) => (
        <>
          <TableCell>{transaction.ACTION}</TableCell>
          <TableCell>{transaction.M}</TableCell>
          <TableCell>{transaction.FSYM}</TableCell>
          <TableCell>{transaction.TSYM}</TableCell>
          <TableCell>{transaction.Q}</TableCell>
          <TableCell>{transaction.P}</TableCell>
          <TableCell>{transaction.TYPE}</TableCell>
          <TableCell>{transaction.SIDE}</TableCell>
        </>
      )}
    />
  );
};
